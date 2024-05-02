# sync 包扩展

我们使用泛型对 sync 包中的一些类型进行了封装。使用泛型的封装相比原来会有额外的性能损耗，目前通过基准测试我们确认，大概会多 3ns 左右的损耗，并且不会引入额外的内存分配。

你需要引入包来使用这些封装后的结构体：
```go
import (
    "github.com/gotomicro/ekit/syncx"
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

## 分段锁
分段锁是用来解决这样一类场景：你需要对某些业务 Key 加锁，这个业务 Key 可能是你的业务 ID，或者唯一索引之类的。

但是如果你为每一个 Key 定义个 Mutex，那么可能会有非常多的 Mutex；同时你也希望，一个 Key 的 Mutex 用完之后，可以尝试释放掉它。

那么我们就提供了这样一个工具：`SegmentKeysLock`。

这是一个简单的例子：
```go
package syncx_test

import (
	"fmt"
	"github.com/ecodeclub/ekit/syncx"
)

func ExampleNewSegmentKeysLock() {
	// 参数就是分多少段，你也可以理解为总共有多少锁
	// 锁越多，并发竞争越低，但是消耗内存；
	// 锁越少，并发竞争越高，但是内存消耗少；
	lock := syncx.NewSegmentKeysLock(100)
	// 对应的还有 TryLock
	// RLock 和 RUnlock
	lock.Lock("key1")
	defer lock.Unlock("key1")
	fmt.Println("OK")
	// Output:
	// OK
}
```
`SegmentKeysLock` 提供了读锁、写锁，用法和原生的 `sync.RWMutex` 类似。

## LimitPool

通过控制申请次数来控制内存使用量的 Pool 实现，只有在一些你需要使用 Pool，但是又需要控制整体内存使用量的场景下才有意义。

如下图：
```go
func ExampleNewLimitPool() {
	p := syncx.NewLimitPool(1, func() int {
		return 123
	})
	val, ok := p.Get()
	fmt.Println("第一次", val, ok)
	val, ok = p.Get()
	fmt.Println("第二次", val, ok)
	p.Put(123)
	val, ok = p.Get()
	fmt.Println("第三次", val, ok)
	// Output:
	// 第一次 123 true
	// 第二次 0 false
	// 第三次 123 true
}
```
在第二次调用 Get 的时候，因为 Pool 里面只有一个元素，并且已经被取走了，所以会得到一个 true 作为返回值。

当然，即便是返回了 false，这种情况下你会得到对应类型的 0 值。
