# 队列

我们在 ekit 里面提供了几种队列：
- 线程安全与非线程安全的
- 阻塞与非阻塞的
- 有界与无界的

总体上来说，队列使用起来很简单，但是如果没有控制好一些参数的话，可能会遇到一些意想不到的情况。

我们建议你在选用队列的时候，一定要阅读我们的注意事项以及特定队列实现的注意事项。不过如果你的应用本身并发数不高，数据量也不大的话，那么就可以随便了。

所有的这些队列都在包：
```go
import (
    "github.com/gotomicro/ekit/queue"
)

```
使用之前别忘了引入。

## 并发非阻塞队列
并发非阻塞意味着，它是一个线程安全的实现，但是并不是阻塞的。
### 无锁实现 ConcurrentLinkedQueue
ConcurrentLinkedQueue 是基于链表和 CAS 操作实现的无界并发队列。
使用 ConcurrentLinkedQueue 非常简单：
```go
func ExampleNewConcurrentLinkedQueue() {
	q := queue.NewConcurrentLinkedQueue[int]()
	_ = q.Enqueue(10)
	val, err := q.Dequeue()
	if err != nil {
		// 一般意味着队列为空
		fmt.Println(err)
	}
	fmt.Println(val)
	// Output:
	// 10
}
```

在出队的时候，如果队列没有元素，我们会返回一个错误。

使用该并发队列，有两个注意事项：
- 该队列是无界队列，意味着在极端情况下，它可能存储了成千上万的数据，导致内存耗尽；
- 该队列是基于 CAS 操作实现的，正常的情况下它的性能会比基于锁实现的要更加高效。但是在极高并发的情况下，那么 CAS 可能会不断自旋，造成 CPU 使用率飙升。在这种情况下，换用其它并发队列可能会更加高效；


## 并发阻塞队列
并发阻塞队列意味着队列是并发安全的，并且是阻塞式的。所有实现都支持在以下情况阻塞：
- 在入队的时候，如果已经到达容量上限，那么就会阻塞。
- 在出队的时候，如果队列已经为空，那么就会阻塞。

不管出队还是入队，如果此时你传入的 context.Context 参数是可以被取消，或者设置了超时，那么在 context.Context 被取消或者超时的时候会返回错误。**你可以通过检测返回的 error 是不是 context.Cancel 或者 context.DeadlineExceeded 来判断是不是被人取消，或者超时了**。

我们建议尽量使用设置了超时的 context.Context，避免长时间阻塞。关于超时阻塞的时间精确性问题，请阅读后面[注意事项](#阻塞超时控制精确性问题)。

### 基于切片的实现 ConcurrentArrayBlockingQueue

ConcurrentArrayBlockingQueue 是有界并发阻塞队列。

使用方法非常简单：
```go
func ExampleNewConcurrentArrayBlockingQueue() {
	q := queue.NewConcurrentArrayBlockingQueue[int](10)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	_ = q.Enqueue(ctx, 22)
	val, err := q.Dequeue(ctx)
	// 这是例子，实际中你不需要写得那么复杂
	switch err {
	case context.Canceled:
		// 有人主动取消了，即调用了 cancel 方法。在这个例子里不会出现这个情况
	case context.DeadlineExceeded:
		// 超时了
	case nil:
		fmt.Println(val)
	default:
		// 其它乱七八糟的
	}
	// Output:
	// 22
}
```

该实现会在最开始的时候就把所以的内存都分配好，后面不会有任何的扩容和缩容的操作，也就是谨慎创建大容量的队列。

### 基于链表的实现 ConcurrentLinkedBlockingQueue
ConcurrentLinkedBlockingQueue 是基于链表的实现，它分成有界和无界两种形态。如果在创建队列的时候传入的容量小于等于0，那么就代表这是一个无界的并发阻塞队列。在无界的情况下，入队永远不会阻塞。但是队列为空的时候，出队依旧会阻塞。

使用起来也很简单：
```go
func ExampleNewConcurrentLinkedBlockingQueue() {
	// 创建一个容量为 10 的有界并发阻塞队列，如果传入 0 或者负数，那么创建的是无界并发阻塞队列
	q := queue.NewConcurrentLinkedBlockingQueue[int](10)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	_ = q.Enqueue(ctx, 22)
	val, err := q.Dequeue(ctx)
	// 这是例子，实际中你不需要写得那么复杂
	switch err {
	case context.Canceled:
		// 有人主动取消了，即调用了 cancel 方法。在这个例子里不会出现这个情况
	case context.DeadlineExceeded:
		// 超时了
	case nil:
		fmt.Println(val)
	default:
		// 其它乱七八糟的
	}
	// Output:
	// 22
}
```
### 选型
- 如果你难以预估容量或者需要使用大容量的队列，那么使用 ConcurrentLinkedBlockingQueue

## 优先级队列

我们提供了：
- 普通的优先级队列 PriorityQueue
- 并发非阻塞优先级队列 ConcurrentPriorityQueue

这些优先级队列都依赖于一个比较函数。

### 比较函数

使用优先级队列的核心在于要传入一个比较函数：
```go
// Comparator 用于比较两个对象的大小 src < dst, 返回-1，src = dst, 返回0，src > dst, 返回1
type Comparator[T any] func(src T, dst T) int
```
我们提供了最基本的实现：
```go
func ComparatorRealNumber[T RealNumber](src T, dst T) int {
	if src < dst {
		return -1
	} else if src == dst {
		return 0
	} else {
		return 1
	}
}
```
其中 RealNumber 可以除了复数类型以外的任何数字类型。

例如你要对 int 进行比较，那么就可以使用 `ComparatorRealNumber[int]`。

### 普通优先队列

注意，该实现并不是线程安全的，所以谨慎在并发环境下使用。

```go
package queue_test

import (
	"fmt"
	"github.com/ecodeclub/ekit"
	"github.com/ecodeclub/ekit/internal/queue"
)

func ExampleNewPriorityQueue() {
	// 容量，并且队列里面放的是 int
	pq := queue.NewPriorityQueue(10, ekit.ComparatorRealNumber[int])
	_ = pq.Enqueue(10)
	_ = pq.Enqueue(9)
	val, _ := pq.Dequeue()
	fmt.Println(val)
	// Output:
	// 9
}
```
注意：
- 如果队列里面的元素数量超过了容量，那么你在调用 Enqueue 的时候，会得到一个 `ErrOutOfCapacity` 错误，你可以通过 `errors.Is` 来检测。
- 如果队列里面为空，但是你调用了 Dequeue，那么你会得到`ErrEmptyQueue`错误，但是这个错误目前还没有暴露出去。如果你需要检测该错误，可以给我们发合并请求。

### 并发非阻塞优先级队列 ConcurrentPriorityQueue


我们并不关心你是如何定义优先级的，你只需要提供一个这种方法，那么我们就会按照逻辑上的从小到大的优先级顺序组织起来。你需要在初始化的时候提供这个比较方法：
```go
func ExampleNewConcurrentPriorityQueue() {
	q := queue.NewConcurrentPriorityQueue[int](10, ekit.ComparatorRealNumber[int])
	_ = q.Enqueue(3)
	_ = q.Enqueue(2)
	_ = q.Enqueue(1)
	var vals []int
	val, _ := q.Dequeue()
	vals = append(vals, val)
	val, _ = q.Dequeue()
	vals = append(vals, val)
	val, _ = q.Dequeue()
	vals = append(vals, val)
	fmt.Println(vals)
	// Output:
	// [1 2 3]
}
```
注意 ```ComparatorRealNumber[int]```使用了我们的默认比较函数，可以看到最终我们按照从小到大的顺序把元素取出来了。


## 延时队列
DelayQueue，即延时队列。延时队列的运作机制是：
- 按照元素的预期过期时间来进行排序，过期时间短的在前面；
- 当从队列中获取元素的时候，如果队列为空，或者元素还没有到期，那么调用者会被阻塞；
- 入队的时候，如果队列已经满了，那么调用者会被阻塞，直到有人取走元素，或者阻塞超时；

因此延时队列的使用场景主要就是那些依赖于时间的场景，例如本地缓存，定时任务等。

使用延时队列需要两个步骤：
- 实现 Delayable 接口
- 创建一个延时队列

Delayable 定义很简单，只需要返回剩余的过期时间：
```go
type Delayable interface {
    Delay() time.Duration
}
```
延时队列会按照这个返回值来进行排序，最近过期的会在最前面。

而后使用延时队列就很简单：
```go
func ExampleNewDelayQueue() {
	q := NewDelayQueue[delayElem](10)
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	now := time.Now()
	_ = q.Enqueue(ctx, delayElem{
		// 3 秒后过期
		deadline: now.Add(time.Second * 3),
		val:      3,
	})

	_ = q.Enqueue(ctx, delayElem{
		// 2 秒后过期
		deadline: now.Add(time.Second * 2),
		val:      2,
	})

	_ = q.Enqueue(ctx, delayElem{
		// 1 秒后过期
		deadline: now.Add(time.Second * 1),
		val:      1,
	})

	var vals []int
	val, _ := q.Dequeue(ctx)
	vals = append(vals, val.val)
	val, _ = q.Dequeue(ctx)
	vals = append(vals, val.val)
	val, _ = q.Dequeue(ctx)
	vals = append(vals, val.val)
	fmt.Println(vals)
	duration := time.Since(now)
	if duration > time.Second*3 {
		fmt.Println("delay!")
	}
	// Output:
	// [1 2 3]
	// delay!
}
```
在前面的例子里面，我们取完所有数据的时候，已经过去了三秒钟，这也就是延时队列的特性——只有过期元素才会被拿到。

另外，如果两个元素过期时间非常接近（或者一模一样），那么究竟谁会在前谁会在后，是比较难以确定的。

> 例如在我们实验过程中，如果两个过期时间相差在毫秒级内，那么这个延时队列可能会搞错顺序

所以，如果你需要一个非常精确的延时队列，那么这个延时队列不能满足你的要求。

关于时间准确性的问题，可以参考后面[注意事项](#阻塞超时控制精确性问题)。虽然这个部分是用于描述超时控制的，但是对于这个延时精确性一样是适用的。


## 注意事项
### 阻塞超时控制精确性问题
我们不提供任何关于时间精确度的保证。举个例子，如果你在操作并发队列的时候，设置的阻塞时间是 100ms，那么我们不能保证它一定会在 100ms 的时候准确返回一个超时错误。但是我们可以保证，不会在 100ms **内**返回超时错误。即如果你收到了超时错误，那么必然已经过去了至少 100ms。

> 当然，如果你考虑时钟准确性的问题，那么实际上也有可能是 100ms 内就返回了超时错误。

阻塞超时控制的精度问题源自很多方面：
- 时钟准确度问题。如果你的超时控制是基于现实时间的话，那么会有问题。但是如果你的超时是基于同一个进程的（或者同一台机器上），那么相对来说肯定没问题——毕竟不同 goroutine 之间使用的是同一个时钟；
- 阻塞未能被唤醒，或者被唤醒本身就存在时间误差。我们大量依赖了 Go 的 time 包。但是这个 time 包本身就不是很精确。此外，我们大量依赖 channel 来做同步，例如在出队的时候通知入队被阻塞的 goroutine，而从信号发出来，到 goroutine 被唤醒，也是一个需要时间的过程；
- goroutine 未能被及时调度：如果当下 CPU 资源（按照 GMP 调度的说法，应该是抢不到 P）紧张，那么即便一个 goroutine 本身是可以被调度的，但是真的调度到它，可能已经过去了很长时间；
- Go select 特性：我们在队列里面大量使用了 select-case 来同时监听超时和数据操作通知（入队或者出队）。举例来说，我们在出队的时候，会同时监听 context.Context 的 Done 信号（即超时或者被取消）和入队新元素的信号，如果在某个时刻，恰好有一个元素入队，并且触发超时，那么 Go select 本身是随机挑选一个 case 分支进去执行。这个分支可能是出队，也可能就是直接返回超时错误；
- Go 垃圾回收：Go 在触发垃圾回收的时候，会在两个方面影响超时的效果。第一个是 STW（stop the world），假设还剩下 1ms 就超时了，此时触发了 STW 10ms，那么你收到超时的时候就比预期的晚了 9ms；另外一个则是在垃圾回收的时候，相当多的 CPU 资源被拿去处理垃圾回收，因此会导致 goroutine 未能被及时调度；

### 和 channel 的对比
首先，你应该永远优先使用 channel，除非你确认 channel 不能满足你的需求，那么你可以考虑使用我们这里列举出来的各种队列。

channel 可以理解看做是一个有界的并发阻塞队列。所以当你遇到以下场景的时候，你可以考虑这里的队列：
- 你无法预估 channel 的容量。即你在 make 的时候，不知道应该设置多大的 buffer
- 如果你需要随机访问或者遍历元素（随机访问我们还没有暴露接口，你可以给我们提 issue）

### 无界队列与 OOM
绝大多数情况下，我们建议你使用有界队列，并且队列的容量不应该设置得很大。在逼不得已的情况下，如果你要使用无界队列，那么你需要小心一点。因为无界队列意味着元素可能存在非常非常多，那么你就会遇到 OOM 之类的错误。

于是我们都是建议有限使用有界队列。如果实在无法预估队列的容量，那么可以考虑使用无界队列并且监控队列长度。