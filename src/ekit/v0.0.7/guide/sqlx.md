# SQL 增强

我们提供了一些类和方法用于辅助数据库操作。

为了使用这些类和方法，你需要引入：
```go
import (
    "github.com/ecodeclub/ekit/sqlx"
)
```
## 加密列支持

我们设计了一个加密列的类型：
```go
type EncryptColumn[T any] struct {
	Val   T
	Valid bool
	Key   string
}
```
它会把 Val 加密之后存储到数据库里面，而后在查询的时候将数据库加密后的字段进行解密。如果 Val 的类型 T 是基本类型 string 或者 []byte，那么我们会编码之后进行加密；否则，我们将 T 序列化为 JSON 字符串，再进行加密。

因此它适合用于加密一些敏感但又不是极端敏感的数据。

使用例子：
```go
type User struct {
	// 使用指针
	Email *sqlx.EncryptColumn[string]
}

func DoSomething() {
	u := User{
		Email: &sqlx.EncryptColumn[string]{
		    Valid: true,
			Key: "your key",
			Val: "my_email@xxx.com",
        },
	}
	db, err := sql.Open("mysql", "your dsn")
	// 插入的将会是加密后的数据
	db.Exec("INSERT INTO `user`(email) VALUES(?);", u.Email)
	u = User{
        Email: &sqlx.EncryptColumn{
            Key: "your key",
        }
    }
	row := db.QueryRow("SELECT * FROM `user`")
    // 拿出来的是解密后的 email
	row.Scan(&u.Email)
	// 拿到了数据，并且不为 NULL
	if u.Email.Valid {
		
    }
}
```
注意，加密和解密的 key 必须是同一个。 EncryptColumn 内部是用的是 AES 的 GCM 模式，所以 key 长度应该是 16,24, 或者 32。

另外，该类型不适合用于保存密码，因为密码我们通常不需要解密出来。

数据库中对应的列必须能够存储加密后的字节。

## Json 列支持

类似地，我们提供了 JSON 列支持：
```go
type JsonColumn[T any] struct {
	Val   T
	Valid bool
}
```
T 必须是一个可以被 json 包正确处理的类型，我们本身直接依赖于 json 进行序列化和反序列化操作。

使用例子：
```go
type User struct {
	Address *sqlx.JsonColumn[Address]
}

type Address struct {
	Province string
	City string
}

func DoSomething() {
    u := User{
        Address: &sqlx.JsonColumn[Address]{
            Valid: true,
            Address: Address{Province: "广东", City: "广州" },
        },
    }
    db, err := sql.Open("mysql", "your dsn")
    // 插入的将会是 json 字符串
    db.Exec("INSERT INTO `user`(address) VALUES(?);", u.Address)
    u = User{
        Address: &sqlx.JsonColumn[Address]{}
    }
    row := db.QueryRow("SELECT * FROM `user`")
    row.Scan(&u.Address)
	
	// 拿到了数据，并且不为 NULL
	if u.Address.Valid {
		
    }
}
```

注意，你数据库中对应的列必须要能存储 json 字节。