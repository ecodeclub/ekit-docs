# eorm

> 更新中...

eorm 是一个设计稍微有点新颖但是新得又不是很多的 ORM 框架。目前来说 API 还没有稳定，所以你可以尝试使用，但是请关注我们后续的重构。

eorm 目前提供：
- 增删改查
- 事务
- 子查询和 JOIN 查询支持

> 但是 eorm 目前并不打算提供关联关系处理，因为我们认为关联关系应该在 DDD 中的 repository 层面上处理，而不是在 ORM 层面上处理。我们意识到无论是 Beego ORM 还是 GORM 对关联关系的支持都过于复杂，对于用户来说接入成本过高；对于框架本身来说，也过于复杂，投入产出比不高。

使用 eorm 的步骤非常简单，例如以下这个例子：

```go
package develop

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/gotomicro/eorm"
	// 不要忘了匿名引入驱动
	_ "github.com/mattn/go-sqlite3"
	"time"
)

// 快速开始的例子
func ExampleQuickStart() {
	// 创建一个 sqlite3 的 DB 实例
	db, err := eorm.Open("sqlite3", "file:test.db?cache=shared&mode=memory")
	if err != nil {
		panic(err)
	}

	// 创建一个带超时时间的 Context
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	// 创建表。目前 eorm 上不支持表结构变更
	err = eorm.RawQuery[any](db, TestModel{}.CreateSQL()).Exec(ctx).Err()
	if err != nil {
		panic(err)
	}

	// 插入数据
	i := eorm.NewInserter[TestModel](db).Values(&TestModel{
		Id:        123,
		FirstName: "Deng",
		LastName:  &sql.NullString{String: "Ming", Valid: true}}).Exec(ctx)
	affected, err := i.RowsAffected()
	if err != nil {
		panic(err)
	}
	fmt.Println(affected)
	tm, err := eorm.NewSelector[TestModel](db).Where(eorm.C("Id").EQ(123)).Get(ctx)
	if err != nil {
		panic(tm)
	}
	fmt.Println(tm.FirstName)
	// Output:
	// 1
	// Deng
}

type TestModel struct {
	Id        int64 `eorm:"primary_key"`
	FirstName string
	Age       int8
	LastName  *sql.NullString
}

func (TestModel) CreateSQL() string {
	return `
CREATE TABLE IF NOT EXISTS test_model(
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    age INTEGER,
    last_name TEXT NOT NULL
)
`
}

```
注意：
- 在创建 DB 的时候不要忘记匿名引入对应的驱动；
- 发起查询的时候最好传入一个带超时控制的 context.Context，防止数据库性能抖动而导致客户端这边 goroutine 泄露;

以下所有的例子都会复用这里定义的`TestModel`。

## 初始化 DB

在 eorm 里面可以调用 Open 方法来创建一个 DB 实例。注意，我们将 DB 设计为无状态的，这意味着大多数时候你应该保持在全局只有一个 DB 实例。当然，如果你实际上拥有多个数据库，那么应该是一个数据库一个 DB 实例。

```go
func Open(driver string, dsn string, opts ...DBOption) (*DB, error)
```
driver 即驱动的名字，而 dsn 则是连接信息。不同的 driver 的 dsn 有不同的规范和参数，具体可以参考：
- [mysql](https://github.com/go-sql-driver/mysql#dsn-data-source-name)
- [sqlite3](https://github.com/mattn/go-sqlite3#connection-string)

DBOption 则是有很多，可以用于定制一些特性：
- `DBUseReflection`: 默认情况下，eorm 使用 unsafe 来处理输入和输出。如果你担忧 unsafe，那么可以考虑使用该选项指定使用反射来处理输入和输出。例如 `Open(xx, xx, eorm.DBUseReflection())`;
- `DBWithMiddlewares`: 用于指定 Middleware。Middleware 你可以看做是 AOP 的解决方案，又或者是插件，详情见后面[Middleware](#Middleware)

此外 DB 还提供了一个有用的特性，用于支持测试：
```go
// Wait 会等待数据库连接
// 注意只能用于测试
func (db *DB) Wait() error {
	// ...
}
```
在一些情况下，我们会启动 docker（或者 docker-compose）来执行测试，那么可以使用这个方法等待 docker 启动成功。

## 模型定义

在 eorm 里面，一个结构体就是一个模型。例如：
```go
type TestModel struct {
    Id        int64 `eorm:"primary_key"`
    FirstName string
    Age       int8
    LastName  *sql.NullString
}
```
默认情况下，eorm 将驼峰命名转化为下划线命名作为对应的表名或者列名。例如 TestModel 会使用 test_model 作为表名，而 FirstName 会使用 first_name 作为列名。

eorm 目前支持的标签包含两个键：
- primary_key：表名该列是主键，如果是复合主键（即多个列组成一个主键），那么只需要在对应的字段上加上 primary_key 键
- column：用于指定列名
- `-`：忽略该字段

在 TestModel 的定义里面你还能看到另外一个东西 sql.NullString，它是 sql 包提供的用于表达的 nullable 列的结构体。目前来说大多数的基本类型都有对应的 sql.Nullxxx 结构体。相比使用指针来表达一个列可以是为 null 的，我们建议你使用 sql.Nullxxx 系列结构体。在使用 sql.Nullxxx 的时候最好使用指针，例如 `LastName *sql.NullString`。

另外，你可以直观理解为，在 sql 包里面的 sql.Rows 的 Scan 方法支持什么类型，eorm 就支持什么类型。

### 组合

eorm 是支持组合的，但是只支持结构体组合。在组合的情况下，我们会递归解析被组合结构体的所有字段，例如：
```go
type Parent struct {
	Sub
	Age int8
}

type Sub struct {
	Name string
}
```
那么意味着 Parent 含有两个列 name 和 age.

如果是指针组合，则不支持：
```go
type Parent struct {
	*Sub
}
```

主要是因为在 eorm 内部使用 unsafe 来处理输入和输出，那么就需要计算字段的偏移量，包括组合内部字段的偏移量。在指针组合的形式下，我们无法计算出这个偏移量。

从另外一方面来说，我们也想象不到在什么场景之下一定要使用这种组合形态。

## 插入

插入数据非常简单，只需要创建一个`Inserter`:
```go
	i := eorm.NewInserter[TestModel](db).Values(&TestModel{
		Id:        123,
		FirstName: "Deng",
		LastName:  &sql.NullString{String: "Ming", Valid: true}}).Exec(ctx)
```

- 使用 Values 方法来指定要插入的数据
- 使用 Exec 来执行最后的查询

需要注意的是，即便没有设置主键，eorm 也不会将主键赋值给传入的结构体。这主要是因为，Values 本身设计为接收任意多个值，那么实际上我们都认为它是批量插入。在批量插入的情况下，我们并不能确保自动生成的主键是连续的，所以无法给结构体赋值。

因此即便是在单个插入的情况下，你也要从 Exec 的返回值里面调用 LastInsertID 获得生成的主键。

### 忽略主键

默认情况下，eorm 会插入所有的列。如果你希望忽略忽略某些列，那么你可以使用方法`SkipPK`：
```go
eorm.NewInserter[TestModel](db).SkipPK().Values(...)
```
那么我们会忽略主键。

## 更新

更新也是比较简单的。

## 删除

## 查找

### 指定列与聚合函数

### WHERE

### GROUP BY 和 HAVING

### OFFSET 和 LIMIT

## 事务

## 原生表达式和原生查询

## Middleware

## 子查询

## JOIN 查询
