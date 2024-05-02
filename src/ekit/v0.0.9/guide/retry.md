# 重试策略

重试作为一个常见的可用性保障手段，我们会经常用到。但是在重试的时候，控制重试次数、重试间隔等逻辑差不多，所以我们统一抽象出来了 retry 包，提供了一致性的接口：
```go
type Strategy interface {
	// Next 返回下一次重试的间隔，如果不需要继续重试，那么第二参数返回 false
	Next() (time.Duration, bool)
}
```
我们提供了两个实现：
- 等间隔重试
- 指数退避重试

## 等间隔重试

等间隔重试有两个参数：
- 重试间隔
- 最大重试次数

例如：
```go
func ExampleFixedIntervalRetryStrategy_Next() {
	retry, err := NewFixedIntervalRetryStrategy(time.Second, 3)
	if err != nil {
		fmt.Println(err)
		return
	}
	interval, ok := retry.Next()
	for ok {
		fmt.Println(interval)
		interval, ok = retry.Next()
	}
	// Output:
	// 1s
	// 1s
	// 1s
}
```
可以看到，连续输出了三次间隔 1s。

## 指数退避重试
指数退避重试有三个重要的参数：
- 初始间隔
- 最大重试间隔
- 最大重试次数

该重试机制是第一次按照初始间隔进行重试，后续每一次调用 Next 返回的间隔都是按照两倍来增长，直到触及最大重试间隔。当达到最大重试次数之后，再调用 Next 就会返回 false。

例如：
```go

func ExampleExponential() {
    retry, err := NewExponentialBackoffRetryStrategy(time.Second, time.Second * 5, 10)
    if err != nil {
        fmt.Println(err)
        return
    }
    interval, ok := retry.Next()
    for ok {
        fmt.Println(interval)
        interval, ok = retry.Next()
    }
}
```
那么最终输出的结果是`1s,2s,4s,5s,5s,5s,5s,5s,5s,5s`。