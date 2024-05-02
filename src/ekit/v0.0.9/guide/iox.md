# io 包扩展

## JSONReader
在某些情况下，我们经常需要将一个对象转化为 json 字符串，而后转化为一个 io.Reader。这是因为很多库的顶级依赖，都是 io.Reader 这个接口。

为了简化这个过程，我们提供了 JSONReader 这个结构体。下面是一个例子：
```go
package iox_test

import (
	"fmt"
	"github.com/ecodeclub/ekit/iox"
	"net/http"
)

func ExampleNewJSONReader() {
	val := iox.NewJSONReader(User{Name: "Tom"})
	_, err := http.NewRequest(http.MethodPost, "/hello", val)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Println("OK")
}

type User struct {
	Name string `json:"name"`
}
```
原本 http.NewRequest 中的第三个参数，是要求传入一个 io.Reader。而在上面的例子中，我们直接将 User 包装为一个 JSONReader，就省略了我们转 JSON，而后再次封装为 io.Reader 的麻烦。