# sync 包扩展

我们使用泛型对 sync 包中的一些类型进行了封装。使用泛型的封装相比原来会有额外的性能损耗，目前通过基准测试我们确认，大概会多 3ns 左右的损耗，并且不会引入额外的内存分配。

你需要引入包来使用这些封装后的结构体：
```go
import (
    "github.com/ecodeclub/ekit/syncx"
)
```

## 泛型 Pool
我们使用泛型了封装了 sync.Pool：
```go
func ExampleNew() {
	p := syncx.NewPool[[]byte](func() []byte {
		res := make([]byte, 1, 12)
		res[0] = 'A'
		return res
	})

	res := p.Get()
	fmt.Print(string(res))
	// Output:
	// A
}
```
注意这里我们要求 NewPool 里面传入的构造函数，不能为 nil。换言之，在 Pool 里面的所有元素都不能为 nil。

## 泛型 Map
类似地，我们也封装了 sync.Map：
```go
func ExampleMap_Load() {
	var m syncx.Map[string, int]
	m.Store("key1", 123)
	val, ok := m.Load("key1")
	if ok {
		fmt.Println(val)
	}
	// Output:
	// 123
}
```
注意，key 只能是 comparable 类型。