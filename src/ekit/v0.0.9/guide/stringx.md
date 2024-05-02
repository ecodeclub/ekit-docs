# string 扩展功能

## string 和 []byte 的 unsafe 转换
众所周知，在 GO 里面如果用 string 转 []byte 或者 []byte 转 string，会触发复制。

那么一种骚操作就是利用 unsafe 来转换。这种技巧在很多中间件里面都用过，那么这一次我们也提供了类似的方法:
- `UnsafeToBytes`
- `UnsafeToString`

我们建议你除非已经到了逼不得已的地步，不然不要使用这两个方法。

```go
package stringx_test

import (
	"fmt"
	"github.com/ecodeclub/ekit/stringx"
)

func ExampleUnsafeToBytes() {
	str := "hello"
	val := stringx.UnsafeToBytes(str)
	fmt.Println(len(val))
	// Output:
	// 5
}

func ExampleUnsafeToString() {
	val := stringx.UnsafeToString([]byte("hello"))
	fmt.Println(val)
	// Output:
	// hello
}
```
这种转化方式相比原来的方式性能上是有所提升的，这是我们的执行的一个基准测试结果：
```shell
goos: darwin
goarch: amd64
pkg: github.com/ecodeclub/ekit/stringx
cpu: Intel(R) Core(TM) i7-7920HQ CPU @ 3.10GHz
Benchmark_UnsafeToBytes/safe_to_bytes-8         	39721614	        29.60 ns/op	      48 B/op	       1 allocs/op
Benchmark_UnsafeToBytes/unsafe_to_bytes-8       	1000000000	         0.2805 ns/op	       0 B/op	       0 allocs/op
Benchmark_UnsafeToString/safe_to_string-8       	45207981	        26.77 ns/op	      48 B/op	       1 allocs/op
Benchmark_UnsafeToString/unsafe_to_string-8     	1000000000	         0.2842 ns/op	       0 B/op	       0 allocs/op
PASS
ok  	github.com/ecodeclub/ekit/stringx	4.780s
```