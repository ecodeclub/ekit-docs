package develop

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/ecodeclub/eorm"
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
	i := eorm.NewInserter[TestModel](db).SkipPK().Values(&TestModel{
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
