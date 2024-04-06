# Map 扩展

在这个包里面，我们提供了两大类接口和实现：
- 为 Go 的内置结构体 map 提供了一些辅助方法
- 新加了哈希 map 和基于树形结构的 map 实现

所有的这些方法和结构体都位于 `github.com/ecodeclub/ekit/mapx` 这个包里面。

## map 辅助方法

我们提供了以下方法：
- `func Keys[K comparable, V any](m map[K]V) []K`: 用于放回一个 map 中的所有的键
- `func Values[K comparable, V any](m map[K]V) []V {`: 用于返回一个 map 中所有的值
- `func KeysValues[K comparable, V any](m map[K]V) ([]K, []V) {`: 用于返回一个 map 中的所有键值对

需要注意的是，三个方法返回的切片中元素的顺序是不确定的。这也就是意味着，如果你连续调用两次方法，那么得到的返回值的元素顺序都是不确定的，这主要是因为 Go 本身在遍历 map 的时候会故意将顺序打乱。

例如：
```go
m := map[int]int{
	1:11,
	2:22,
	3:33
}
keys1 := mapx.Keys[int, int](m) // 假如说是 [1, 2, 3]
keys2 := mapx.Keys[int, int](m) // 那么可能是 [2, 1, 3]
```

你不能对元素顺序做任何假设。

## HashMap

大多数情况下，我们使用内置的 map 结构就可以了。但是 map 要求键必须满足 comparable 的约束，那么在某些情况下我们可能尝试采用复杂结构作为键的时候，就无法通过编译。

那么你可以考虑使用我们这里的 HashMap 结构体，使用例子：
```go

func ExampleNewHashMap() {
	m := mapx.NewHashMap[MockKey, int](10)
	_ = m.Put(MockKey{}, 123)
	val, _ := m.Get(MockKey{})
	fmt.Println(val)
	// Output:
	// 123
}

type MockKey struct {
	values []int
}

func (m MockKey) Code() uint64 {
	res := 3
	for _, v := range m.values {
		res += v * 7
	}
	return uint64(res)
}

func (m MockKey) Equals(key any) bool {
	k, ok := key.(MockKey)
	if !ok {
		return false
	}
	if len(k.values) != len(m.values) {
		return false
	}
	if k.values == nil && m.values != nil {
		return false
	}
	if k.values != nil && m.values == nil {
		return false
	}
	for i, v := range m.values {
		if v != k.values[i] {
			return false
		}
	}
	return true
}
```

注意到，我们要求键必须实现接口 Hashable:
```go
type Hashable interface {
	Code() uint64
	Equals(key any) bool
}
```
其中 Code 方法是返回哈希值的方法，具体如何设计优雅的计算哈希值的方法，可以在网上搜索相关的内容，这个跟你的键的定义是密切相关的。

而 Equals 则是比较两个元素是否相等，如果两个键是相等的，那么后者的值就会覆盖掉前者的值。

HashMap 内部是直接封装了内置的 map 结构，并没有自己设计全新的哈希结构。这种设计方案极大的简化了代码，同时了保证了健壮性和正确性。

后面我们会根据使用的情况以及性能等综合考虑要不要设计的内部哈希结构，摆脱对 map 的依赖。

## TreeMap

TreeMap 是一个基于红黑树的树形 map 结构设计。

TreeMap 的使用依旧很简单：
```go
import (
	"fmt"
	"github.com/ecodeclub/ekit"
	"github.com/ecodeclub/ekit/mapx"
)

func ExampleNewTreeMap() {
	m, _ := mapx.NewTreeMap[int, int](ekit.ComparatorRealNumber[int])
	_ = m.Put(1, 11)
	val, _ := m.Get(1)
	fmt.Println(val)
	// Output:
	// 11
}
```
注意：
- TreeMap 对键没有任何约束，也就是说你可以使用任意的类型
- TreeMap 要求在创建实例的时候传入一个 comparator，
  ```go
    // Comparator 用于比较两个对象的大小 src < dst, 返回-1，src = dst, 返回0，src > dst, 返回1
    // 不要返回任何其它值！
    type Comparator[T any] func(src T, dst T) int
  ```
我们在 ekit 包里面提供了数字类型的 Comparator 实现，例如例子里面展示的那样，你可以直接使用。