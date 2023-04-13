# atomic 包扩展

我们对原子包里面的一些类型和方法进行了泛型封装，这样在使用原子操作的时候可以避免一些类型转换的操作。

使用这些类型和方法之前，你需要引入依赖：
```go
import (
    "github.com/gotomicro/ekit/syncx/atomicx"
)
```

## Value

我们对 atomic.Value 进行了封装：
```go
type Value[T any] struct {
	val atomic.Value
}
```
它的四个方法都被泛型重新进行了封装：
- Load
- Store
- Swap
- CompareAndSwap

同时我们提供了两个创建方法 NewValue 和 NewValueOf。你应该只使用这两个方法来创建一个实例：
```go
func ExampleNewValue() {
	val := atomicx.NewValue[int]()
	data := val.Load()
	fmt.Println(data)
	// Output:
	// 0
}

func ExampleNewValueOf() {
    val := atomicx.NewValueOf[int](123)
    data := val.Load()
    fmt.Println(data)
    // Output:
    // 123
}
```
NewValue 和 NewValueOf 传入零值的效果是一样的。这两个创建方法**可以确保存储的零值是带类型的零值**的。
