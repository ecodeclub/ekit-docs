# List

目前我们提供了 ArrayList 和 LinkedList 两种实现，并且使用装饰器模式封装了一个线程安全的 ConcurrentList。

为了使用 List，你需要引入包：
```go
import (
    "github.com/ecodeclub/ekit/list"
)
```

List 支持的 API 有：
```go
type List[T any] interface {
	// Get 返回对应下标的元素，
	// 在下标超出范围的情况下，返回错误
	Get(index int) (T, error)
	// Append 在末尾追加元素
	Append(ts ...T) error
	// Add 在特定下标处增加一个新元素
	// 如果下标超出范围，应该返回错误
	Add(index int, t T) error
	// Set 重置 index 位置的值
	// 如果下标超出范围，应该返回错误
	Set(index int, t T) error
	// Delete 删除目标元素的位置，并且返回该位置的值
	// 如果 index 超出下标，应该返回错误
	Delete(index int) (T, error)
	// Len 返回长度
	Len() int
	// Cap 返回容量
	Cap() int
	// Range 遍历 List 的所有元素
	Range(fn func(index int, t T) error) error
	// AsSlice 将 List 转化为一个切片
	// 不允许返回nil，在没有元素的情况下，
	// 必须返回一个长度和容量都为 0 的切片
	// AsSlice 每次调用都必须返回一个全新的切片
	AsSlice() []T
}
```

### 在循环中调用 Add 或者 Delete

在循环中调用 Add 或者 Delete 等修改 List 本身结构的方法要小心，例如代码：
```go
	list := NewArrayListOf[int]([]int{1, 2, 3, 4, 5})
    for i := 0; i < list.Len(); i++ {
        _, err := list.Delete(i)
        fmt.Println(err)
    }
```
这段代码最终只会执行三次，因为在每一次执行删除之后，list 本身已经被修改了。因此结果并不是我们预期的全部元素都会被删除。
如果我们的代码写成：
```go
	list = NewArrayListOf[int]([]int{1, 2, 3, 4, 5})
	l := list.Len()
	for i := 0; i < l; i++ {
		_, err := list.Delete(i)
		fmt.Println(err)
	}
```
那么最终会输出两次 error:
```
<nil>
<nil>
<nil>
ekit: 下标超出范围，长度 2, 下标 3
ekit: 下标超出范围，长度 2, 下标 4
```

类似地，Add 方法也有类似缺点，你在使用的时候要充分测试。

## ArrayList

目前 ArrayList 是基于切片来实现的，所以它具备切片的大多数性质。
- 随机访问性能极好：即按照下标来查找元素，会非常迅速
- Add 和 Delete 两个方法会引起元素移动，所以性能稍差
- Append 因为只追加元素，所以性能好
- AsSlice 你可以放心使用，而不必担心对返回的切片的修改，会影响到 ArrayList 的底层切片

创建 ArrayList 有两种方式：
```go
l := list.NewArrayListOf[int]([]int{1, 2, 3, 4, 5})
```
这种方式会将传入的切片构造为一个 ArrayList 实例。需要注意的是，此处我们直接使用了传入的切片，而没有执行复制。所以如果你修改原本的切片，那么 ArrayList 实例也会收到影响。

另外一种方式是创建一个空的 ArrayList:
```go
l := list.NewArrayList[int](initCap)
```
在传入的时候，你需要传入一个预估的容量。我们并没有对传入的容量进行校验，你应该自己确保它不能为负数。

### Delete 与缩容

Delete 方法会在必要的时候执行缩容，其算法为：

- 如果容量 > 2048，并且长度小于容量一半，那么就会缩容为原本的 5/8
- 如果容量 (64, 2048]，如果长度是容量的 1/4，那么就会缩容为原本的一半
- 如果此时容量 <= 64，那么我们将不会执行缩容。在容量很小的情况下，浪费的内存很少，所以没必要消耗 CPU去执行缩容

## LinkedList

LinkedList 是一个双向循环链表，所以非常适合频繁修改数据的场景。
- 随机访问性能差：即按照下标来查找元素，LinkedList 需要遍历来找到下标指向的元素；
- Add 和 Delete 两个方法性能比 ArrayList 好
- Append 因为只追加元素，所以性能好
- LinkedList 的 Cap 方法并没有什么意义。目前我们会固定返回 Len() 相同的值。实际上，你可以无限增加元素，直到你内存消耗干净；

创建一个 LinkedList 非常简单：
```go
l := list.NewLinkedList[int]()
```