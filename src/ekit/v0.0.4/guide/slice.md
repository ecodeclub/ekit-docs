# 切片
切片作为最常用的数据结构，我们为它提供了非常多的辅助方法。以下所有的方法都定义在 "github.com/gotomicro/ekit/slice" 下，使用前你需要引入：
```
import (
    "github.com/gotomicro/ekit/slice"
)
```

## 聚合函数
目前聚合函数支持 Sum, Max 和 Min。

Sum 使用例子：
```go
func ExampleSum() {
    res := slice.Sum[int]([]int{1, 2, 3})
    fmt.Println(res)
    res = Sum[int](nil)
    fmt.Println(res)
    // Output:
    // 6
    // 0
}
```
当用户传入空切片或者 nil 的时候，返回的是对应类型的零值。

Max 使用例子：
```go
func ExampleMax() {
	res := slice.Max[int]([]int{1, 2, 3})
	fmt.Println(res)
	// Output:
	// 3
}
```
使用 Max 需要传入至少一个元素，否则会出现 panic。

Min 使用例子：
```go
func ExampleMin() {
	res := slice.Min[int]([]int{1, 2, 3})
	fmt.Println(res)
	// Output:
	// 1
}
```
使用 Min 需要传入至少一个元素，否则会出现 panic。

使用注意事项：
- 如果你使用的是 float32 或者 float64，那么你需要自己处理精度问题。这些聚合函数只是简单使用 Go 中默认的 +, >, <
- Min 和 Max 只能处理实数及其衍生类型，无法处理复数

## 包含

我们定义了三组方法用于检测包含关系。这三组方法中，没有 Func 后缀的方法，接收的是任意的 comparable 类型，有 Func 后缀的方法则可以接收任意类型。

- Contains 和 ContainsFunc用于检测切片 src 是否包含某个元素：
```go
func ExampleContains() {
	res := slice.Contains[int]([]int{1, 2, 3}, 3)
	fmt.Println(res)
	// Output:
	// true
}

func ExampleContainsFunc() {
	res := slice.ContainsFunc[int]([]int{1, 2, 3}, 3, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	// Output:
	// true
}
```
- ContainsAny 和 ContainsAnyFunc 用于检测切片 src 是否包含另外一个切片 dst 中的任意元素：
```go
func ExampleContainsAny() {
    res := slice.ContainsAny[int]([]int{1, 2, 3}, []int{3, 6})
    fmt.Println(res)
    res = slice.ContainsAny[int]([]int{1, 2, 3}, []int{4, 5, 9})
    fmt.Println(res)
    // Output:
    // true
    // false
}

func ExampleContainsAnyFunc() {
    res := slice.ContainsAnyFunc[int]([]int{1, 2, 3}, []int{3, 1}, func(src, dst int) bool {
    return src == dst
    })
    fmt.Println(res)
    res = slice.ContainsAllFunc[int]([]int{1, 2, 3}, []int{4, 7, 6}, func(src, dst int) bool {
    return src == dst
    })
    fmt.Println(res)
    // Output:
    // true
    // false
}
```
如果 src 是空切片或者 nil，那么会返回 false。

- ContainsAll 和 ContainsAllFunc 用于判断切片 src 是否包含另一个切片 dst 中的所有元素。
```go
func ExampleContainsAll() {
	res := slice.ContainsAll[int]([]int{1, 2, 3}, []int{3, 1})
	fmt.Println(res)
	res = slice.ContainsAll[int]([]int{1, 2, 3}, []int{3, 1, 4})
	fmt.Println(res)
	// Output:
	// true
	// false
}

func ExampleContainsAllFunc() {
	res := slice.ContainsAllFunc[int]([]int{1, 2, 3}, []int{3, 1}, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	res = slice.ContainsAllFunc[int]([]int{1, 2, 3}, []int{3, 1, 4}, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	// Output:
	// true
	// false
}
```
如果 src 是空切片或者 nil：
- 如果 dst 是空切片或者 nil，返回 true
- 如果 dst 不为空，返回 false

使用注意事项：
- ContainsAllFunc 在 src 或者 dst 很大的情况下，性能会比较差，因为它使用了循环

## 差集和对称差集

差集和对称差集用于计算 src 和 dst 两个切片之间的不同元素。它们遵循严格的数学语义。

### DiffSet 和 DiffSetFunc
使用 DiffSet 和 DiffSetFunc 非常简单：
```go
func ExampleDiffSet() {
	res := slice.DiffSet[int]([]int{1, 3, 2, 2, 4}, []int{3, 4, 5, 6})
	sort.Ints(res)
	fmt.Println(res)
	// Output:
	// [1 2]
}

func ExampleDiffSetFunc() {
	res := slice.DiffSetFunc[int]([]int{1, 3, 2, 2, 4}, []int{3, 4, 5, 6}, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	// Output:
	// [1 2]
}
```
DiffSet 只能处理 comparable 的任意类型，而 DiffSetFunc 可以处理任意类型。

使用注意事项：
- DiffSet 和 DiffSetFunc 计算的都是 src - dst，而不是 (src - dst) 和 (dst - src)
- DiffSet 和 DiffSetFunc 的返回值都已经去重了
- DiffSet 返回值的元素顺序，和原本的 src 中元素的顺序不一样
- DiffSetFunc 本身采用的是循环来处理，所以在元素数量非常多的时候，性能会比较差

### SymmetricDiffSet 和 SymmetricDiffSetFunc

这两个方法用于计算对称差集。对称差集和差集相比：
- 差集计算的是 src - dst
- 对称差集计算的是 (src - dst) U (dst - src)

这两个方法使用例子：
```go
func ExampleSymmetricDiffSet() {
	res := slice.SymmetricDiffSet[int]([]int{1, 3, 4, 2}, []int{2, 5, 7, 3})
	sort.Ints(res)
	fmt.Println(res)
	// Output:
	// [1 4 5 7]
}

func ExampleSymmetricDiffSetFunc() {
	res := slice.SymmetricDiffSetFunc[int]([]int{1, 3, 4, 2}, []int{2, 5, 7, 3}, func(src, dst int) bool {
		return src == dst
	})
	sort.Ints(res)
	fmt.Println(res)
	// Output:
	// [1 4 5 7]
}
```
SymmetricDiffSet 只能处理 comparable 类型，而 SymmetricDiffSetFunc 可以处理任意类型。

- SymmetricDiffSet 和 SymmetricDiffSetFunc 的返回值都已经去重了
- SymmetricDiffSet 返回值的元素顺序，和原本的 src 中元素的顺序不一样
- SymmetricDiffSetFunc 本身采用的是循环来处理，所以在元素数量非常多的时候，性能会比较差

## 交集
交集用于计算两个切片的公共元素，严格遵循数学语义。

交集使用起来非常简单：
```go
func ExampleIntersectSet() {
	res := slice.IntersectSet[int]([]int{1, 2, 3, 3, 4}, []int{1, 1, 3})
	sort.Ints(res)
	fmt.Println(res)
	res = IntersectSet[int]([]int{1, 2, 3, 3, 4}, []int{5, 7})
	fmt.Println(res)
	// Output:
	// [1 3]
	// []
}

func ExampleIntersectSetFunc() {
	res := slice.IntersectSetFunc[int]([]int{1, 2, 3, 3, 4}, []int{1, 1, 3}, func(src, dst int) bool {
		return src == dst
	})
	sort.Ints(res)
	fmt.Println(res)
	res = IntersectSetFunc[int]([]int{1, 2, 3, 3, 4}, []int{5, 7}, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	// Output:
	// [1 3]
	// []
}
```
IntersectSet 只能处理 comparable 类型，而 IntersectSetFunc 可以处理任意类型。

使用注意事项：
- IntersectSet 和 IntersectSetFunc 的返回值都已经被去重了
- IntersectSet 返回值中的元素顺序，和它在 src 中的顺序不一致
- IntersectSetFunc 本身采用循环来处理，所以如果 src 或者 dst 元素很多的时候，性能会比较差

## 并集

并集将返回 src 和 dst 中的所有元素：
```go
func ExampleUnionSet() {
	res := slice.UnionSet[int]([]int{1, 3, 4, 5}, []int{1, 4, 7})
	sort.Ints(res)
	fmt.Println(res)
	// Output:
	// [1 3 4 5 7]
}

func ExampleUnionSetFunc() {
	res := slice.UnionSetFunc[int]([]int{1, 3, 4, 5}, []int{1, 4, 7}, func(src, dst int) bool {
		return src == dst
	})
	sort.Ints(res)
	fmt.Println(res)
	// Output:
	// [1 3 4 5 7]
}
```
UnionSet 只能处理 comparable 类型，而 UnionSetFunc 可以处理任意类型。

使用注意事项：
- UnionSet 和 UnionSetFunc 的返回值都已经被去重了
- UnionSet 返回值中的元素顺序，和它在 src 中的顺序不一致
- UnionSetFunc 本身采用循环来处理，所以如果 src 或者 dst 元素很多的时候，性能会比较差

## 下标查找
我们提供了三组方法用于查找 src 中某个元素的下标。

Index 和 IndexFunc 用于从前往后查找元素，将会返回找到的第一个元素的下标。在没有找到的情况下，会返回 -1。使用例子：
```go
func ExampleIndex() {
	res := slice.Index[int]([]int{1, 2, 3}, 1)
	fmt.Println(res)
	res = slice.Index[int]([]int{1, 2, 3}, 4)
	fmt.Println(res)
	// Output:
	// 0
	// -1
}

func ExampleIndexFunc() {
	res := slice.IndexFunc[int]([]int{1, 2, 3}, 1, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	res = slice.IndexFunc[int]([]int{1, 2, 3}, 4, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	// Output:
	// 0
	// -1
}
```
注意 Index 只能处理 comparable 类型，而 IndexFunc 可以处理任意类型。

LastIndex 和 LastIndexFunc 返回 src 中目标元素的最后一个下标。换句话来说，返回从后往前遍历，找到的第一个元素的下标。如果没有找到，会返回 -1。使用例子：
```go
func ExampleLastIndex() {
	res := slice.LastIndex[int]([]int{1, 2, 3, 1}, 1)
	fmt.Println(res)
	res = slice.LastIndex[int]([]int{1, 2, 3}, 4)
	fmt.Println(res)
	// Output:
	// 3
	// -1
}

func ExampleLastIndexFunc() {
	res := slice.LastIndexFunc[int]([]int{1, 2, 3, 1}, 1, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	res = slice.LastIndexFunc[int]([]int{1, 2, 3}, 4, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	// Output:
	// 3
	// -1
}
```
注意 LastIndex 只能处理 comparable 类型，而 LastIndexFunc 可以处理任意类型。

IndexAll 和 IndexAllFunc 会返回所有命中的元素下标。使用例子：
```go
func ExampleIndexAll() {
	res := slice.IndexAll[int]([]int{1, 2, 3, 4, 5, 3, 9}, 3)
	fmt.Println(res)
	res = slice.IndexAll[int]([]int{1, 2, 3}, 4)
	fmt.Println(res)
	// Output:
	// [2 5]
	// []
}

func ExampleIndexAllFunc() {
	res := slice.IndexAllFunc[int]([]int{1, 2, 3, 4, 5, 3, 9}, 3, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	res = slice.IndexAllFunc[int]([]int{1, 2, 3}, 4, func(src, dst int) bool {
		return src == dst
	})
	fmt.Println(res)
	// Output:
	// [2 5]
	// []
}
```
IndexAll 只能处理 comparable 类型，而 IndexAllFunc 可以处理任意类型。

## map reduce

目前我们还没有设计 reduce 接口，但是 map 接口我们已经设计出来了。使用 Map 方法可以将一种类型的切片转化为另一种类型的切片：
```go
func ExampleMap() {
	src := []int{1, 2, 3}
	dst := slice.Map(src, func(idx int, src int) string {
		return strconv.Itoa(src)
	})
	fmt.Println(dst)
	// Output: [1 2 3]
}
```

类似地，还有一个 FilterMap 方法，与 Map 方法比起来，调用者可以决定是否忽略某些元素：
```go

func ExampleFilterMap() {
	src := []int{1, -2, 3}
	dst := slice.FilterMap[int, string](src, func(idx int, src int) (string, bool) {
		return strconv.Itoa(src), src >= 0
	})
	fmt.Println(dst)
	// Output: [1 3]
}
```
FilterMap 的传入的方法的第二个返回值是 false，那么意味着对应的返回值会被忽略掉。因此可以注意到在例子里面我们输出的是 "[1 3]"，也就是 -2 已经被我们忽略了。


## 删除
切片的删除还是稍微有点棘手的，所以我们封装了一下对切片的删除操作，提供了一个 Delete 方法：
```go
func ExampleDelete() {
	res, _ := slice.Delete[int]([]int{1, 2, 3, 4}, 2)
	fmt.Println(res)
	_, err := slice.Delete[int]([]int{1, 2, 3, 4}, -1)
	fmt.Println(err)
	// Output:
	// [1 2 4]
	// ekit: 下标超出范围，长度 4, 下标 -1
}
```
需要注意的是，你一定要重新处理 Delete 的返回值。如果你肯定你的下标不会出现问题，那么可以忽略第二个返回值。

## 翻转

我们提供了两个方法用于将一个切片翻转：
- Reverse：**会创建一个新的切片**，新切片的元素顺序和原本的元素顺序是相反的
- ReverseSelf：会直接调整原本切片中元素的位置

使用例子：
```go
func ExampleReverse() {
    res := slice.Reverse[int]([]int{1, 3, 2, 2, 4})
    fmt.Println(res)
    res2 := slice.Reverse[string]([]string{"a", "b", "c", "d", "e"})
    fmt.Println(res2)
    // Output:
    // [4 2 2 3 1]
    // [e d c b a]
}


func ExampleReverseSelf() {
	src := []int{1, 3, 2, 2, 4}
	slice.ReverseSelf[int](src)
	fmt.Println(src)
	src2 := []string{"a", "b", "c", "d", "e"}
	slice.ReverseSelf[string](src2)
	fmt.Println(src2)
	// Output:
	// [4 2 2 3 1]
	// [e d c b a]
}
```



