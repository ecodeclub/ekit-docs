# 协程池
在 ekit 里面我们支持了类似于线程池的协程池，也称为任务池。

在使用之前你需要引入：
```go
import (
    "github.com/gotomicro/ekit/pool"
)
```

使用例子：
```go
func ExampleNewOnDemandBlockTaskPool() {
	p, _ := pool.NewOnDemandBlockTaskPool(10, 100)
	_ = p.Start()
	// wg 只是用来确保任务执行的，你在实际使用过程中是不需要的
	var wg sync.WaitGroup
	wg.Add(1)
	_ = p.Submit(context.Background(), TaskFunc(func(ctx context.Context) error {
		fmt.Println("hello, world")
		wg.Done()
		return nil
	}))
	wg.Wait()
	// Output:
	// hello, world
}
```
再次强调，在上面我们的例子里面，变量 wg 只是我们用来协调例子的，你使用的时候是不需要的。

你可以在调用`pool.NewOnDemandBlockTaskPool`的时候传入一些选项：
```go
- WithMaxGo: 最大协程数量
- WithCoreGo: 核心协程数量
- WithMaxIdleTime: 协程的最大空闲时间
- WithQueueBacklogRate: 队列积压率
```

这是因为我们使用了以下参数来控制协程池的行为：
- initGo：初始协程数
- coreGo：核心协程数
- maxGo：最大协程数
- queueBacklogRate: 队列积压率，取值在 [0, 1] 之间
- maxIdleTime：最大空闲时间

协程池在不同的情况下，会决定是否启用一个新的协程：
- 在协程池调用 Start() 的时候就会创建出来 initGo 个协程
- 随着任务不断提交，当协程数量达到 coreGo 之前，如果此时没有空闲协程，那么协程池就会创建一个新的协程
- 当协程数量到达了 coreGo 之后，任务会先放在队列之中
- 如果队列中的任务堆积太多，达到了 queueBacklogRate 设定的阈值，那么协程池会创建一个新的协程

关闭协程的过程是一个相反过程：
- 如果此时协程数量超过 coreGo，而且队列中没有任务，那么协程会直接退出
- 如果此时协程数量在 (initGo, coreGo] 之间，那么当协程空闲时间超过 maxIdleTime 的时候，协程会退出
- 当协程数量在 (0, initGo] 之间，这些协程永远不会退出

## 实践建议

任何时候都要记住，你的任务调度最好是不依赖于协程池管理协程的任何细节。

### initGo, coreGo 和 maxGo 的设置

一般情况下，你可以直接使用默认参数。当你希望修改这些参数的时候，你要考虑以下问题：
- 如果三个参数的值都相等，那么意味着你希望使用固定个协程来处理你的任务。这些协程将会在 Start 方法调用的时候创建好，并且不会再退出；
- maxGo 意味着你所能容忍的这个协程池所能占据的最多的协程数量

### 协程池隔离

一般的做法是：
- 你会有一个全局的协程池。不重要的业务产生的任务都提交到这个协程池
- 重要业务都是独享一个协程池，以避免相互之间影响
- 要注意所有的协程池的 maxGo 的设计，并且考虑系统是否有足够的资源支持所有的协程池都满负荷运行

### 队列大小

如果你的任务数量波动比较大，那么应该把队列设置得比较大一些。

例如，在业务高峰期可能会短时间提交很多任务，但是你能容忍这些任务在后面慢慢运行完成，那么你就需要把队列设置得大一些。

而如果你的系统需要很多内存，那么你应该将队列设置小一些，以节省内存。

### queueBacklogRate

这个参数我们不建议你修改，大多数时候我们希望协程池中的协程数量保持稳定，不会出现突然创建协程，然后又退出的情况。

你只有在有确凿把握的时候再去调整它。并且，将来我们会考虑优化这个参数。