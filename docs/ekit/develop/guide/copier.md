### ekit下Copier的使用

#### 准备工作

首先确保自己已经安装了 GO，版本在 1.18之上，同时设置了 GOPATH 环境变量，并且将 GOPATH/bin 加入到了环境变量。

如果你还没安装环境，请参考：

- [Windows 安装](https://beego.gocn.vip/beego/zh/developing/environment/install_go_windows.html)

- [Linux 安装](https://beego.gocn.vip/beego/zh/developing/environment/install_go_linux.html)

- [Mac 安装](https://beego.gocn.vip/beego/zh/developing/environment/install_go_mac.html)

同时，如果你是在中国大陆境内，我们建议你同时设置`GORPOXY`并开启`go mod`。在自己的环境变量里面设置：

~~~bash
# windows
go env -w GOPROXY=https://goproxy.cn GO111MODULE=one

# linux or mac
export GOPROXY=https://goproxy.cn GO111MODULE=on
~~~



#### 快速开始

如果你已经安装好了开发环境，那么我们可以使用`go get`命令进行安装

~~~bash
go get -u github.com/gotomicro/ekit
~~~

安装成功之后，我们可以使用其中的拷贝函数

- 浅层拷贝

~~~go
reflectCopier, err := copier.NewReflectCopier()
	if err != nil {
		// handle error
	}
// Copy方法实现浅拷贝，将拷贝后的结果返回 
dst, err := reflectCopier.Copy(&src)

// CopyTo方法实现浅拷贝,将拷贝后的结果直接写入到dst中
err := reflectCopie.CopyTo(&src, &dst)
~~~

- 深层拷贝

~~~go
err := copier.CopyTo(&src, &dst)
~~~



