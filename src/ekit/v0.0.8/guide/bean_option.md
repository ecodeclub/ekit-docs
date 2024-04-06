# Option 模式

因为 Go 本身没有提供构造器，也不支持重载，所以大多数时候我们都会使用 Option 模式来构造复杂对象。

在 `github.com/ecodeclub/ekit/bean/option` 包里面，我们提供了快速使用 Option 模式的辅助类和辅助方法：

```go
package option
type Option[T any] func (t *T)
// Apply 将 opts 应用在 t 之上
func Apply[T any](t *T, opts ...Option[T]) {
	for _, opt := range opts {
		opt(t)
	}
}
```

用户可以直接使用这个 Option 类型而无需自己定义，例如：

```go

// 别忘了引入 "github.com/ecodeclub/ekit/bean/option"

func WithName(name string) option.Option[User] {
	return func (u *User) {
		u.name = name
	}
}
func WithAge(age int) option.Option[User] {
	return func(u *User) {
		u.age = age
	}
}

type User struct {
	name string
	age  int
}

func ExampleApply() {
	u := &User{}
	option.Apply[User](u, WithName("Tom"), WithAge(18))
	fmt.Println(u)
	// Output:
	// &{Tom 18}
}
```

部分情况下，我们会考虑在 Option 里面对输入进行一些检测，并且在输入数据不对的情况下，希望返回 error。那么可以使用 OptionErr，其定义是：
```go
package option
type OptionErr[T any] func(t *T) error

func ApplyErr[T any](t *T, opts ...OptionErr[T]) error {
	for _, opt := range opts {
		if err := opt(t); err != nil {
			return err
		}
	}
	return nil
}
```
使用例子：
```go
// 别忘了引入 "github.com/ecodeclub/ekit/bean/option"

func WithAgeErr(age int) OptionErr[User] {
    return func(u *User) error {
        if age <= 0 {
            return errors.New("age 应该是正数")
        }
        u.age = age
        return nil
    }
}
func WithNameErr(name string) OptionErr[User] {
	return func(u *User) error {
		if name == "" {
			return errors.New("name 不能为空")
		}
		u.name = name
		return nil
	}
}
func ExampleApplyErr() {
	u := &User{}
    err := ApplyErr[User](u, WithNameErr("Tom"), WithAgeErr(18))
    fmt.Println(err)
    fmt.Println(u)
    
    err = ApplyErr[User](u, WithNameErr(""), WithAgeErr(18))
    fmt.Println(err)
    // Output:
    // <nil>
    // &{Tom 18}
    // name 不能为空
}
```