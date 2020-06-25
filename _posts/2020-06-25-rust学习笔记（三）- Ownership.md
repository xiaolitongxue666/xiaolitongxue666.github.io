---
layout: default
title:  "Rust学习笔记（三）Ownership"
date:   2020-06-25 14:27:04 +0800
categories: 
---

# Rust 学习笔记（三）Ownership 
#ProgrammingLanguage/Rust

**ownership**:

参考：[“Level Up Your Concurrency Skills With Rust” by David Sullins - YouTube](https://www.youtube.com/watch?v=oIikwmeGVYY&t=1378s)

Rust的核心特点就是ownership，保证了rust的内存安全，而不需要垃圾收集机制。还需要理解几个相关的概念：borrowing, slices。以及rust怎么在内存中布置数据。

rust中，内存是通过所有权系统管理的，该系统具有一组规则，编译器会在编译时检查这些规则。不会像垃圾回收机制一样，降低运行速度和效率。

**ownership rules**:
* Rust中的每个值都有一个变量，称为其owner。
* 同一时间，只会有一个owner。
* 当owner超出范围，该值会被丢弃删除

```rust
let s = String::from("hello"); //另一种初始化String变量的办法
```

**variable scope**
``` rust
{		// s is not valid here; it's not yet declared 
	let s = "hello"; // s is valid from this point forward
		// do stuff with s
}		// this scope is now over, and s is no longer valid

``` 

**memory and allocation**
当一个String变量超出域（使用范围），rust会调用一个特殊的函数drop，也就是在此刻，String变量占用的内存被回收。（PS: 类比C++的RAII）。

```rust
let s1 = String::from("hello");
let s2 = s1;
println!("{}, world!", s1);
```
一个字符串变量，在内存中由三个部分组成：
1. 一个指向字符串内容的指针
2. 所指向数据的长度（byte）
3. 当前已使用的长度（byte）
⚠️ (len >= capacity)
![](https://github.com/xiaolitongxue666/blog_image_2020_01/blob/master/2020-06-25-rust%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%EF%BC%88%E4%B8%89%EF%BC%89-%20Ownership/1.png?raw=true)

代码中第二行，执行时并不会进行内容的复制，而是会如下图所示
![](https://github.com/xiaolitongxue666/blog_image_2020_01/blob/master/2020-06-25-rust%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%EF%BC%88%E4%B8%89%EF%BC%89-%20Ownership/2.png?raw=true)

一旦执行了第二行代码，就不能使用s1，进行操作了，类似shadow.
执行到第三行代码的时候，实际的数据情况入下图所示
![](https://github.com/xiaolitongxue666/blog_image_2020_01/blob/master/2020-06-25-rust%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%EF%BC%88%E4%B8%89%EF%BC%89-%20Ownership/3.png?raw=true)

以上的操作，被叫做**shallow  copy（浅拷贝）**

如果在实际编写代码的时候，需要对数据进行真是的复制，即**deep copy(深拷贝)**，就需要使用到一个常见的方法，**clone**.
```rust
let s2 = s1.clone();
```

⚠️以上的操作都是针对，类似String变量这种，长度不能在运行前确认的情况，其他可变数据结构同理。

针对类似int, float,这类已知数据长度的变量，在变编译的是时候，即可进行快速的拷贝和部署，所以情况和可变长度变量不同。
```rust
let x = 5; let y = x;
println! ("x = {}, y = {}", x, y);
```
以上代码，在赋值后，仍可以访问变量x。

Rust具有一个特殊的注释，称为复制特征，我们可以将其放置在存储在堆栈中的像int,float这类固定长度的变量类型上。如果一个类型具有**Copy trait（复制特征）**，则在分配后仍然可以使用较旧的变量。

可以使用Copy的变量如下：
* 所有的整型变量，比如u32
* 布尔型变量
* 所有的浮点变量，比如f64
* 以上变量组成的Tuples（元组）变量。
总结就是，固定长度的变量，单一或者复合使用，仍然是具有复制特征的，但是变长的数据类型比如String,就没有此特性。

**ownership and functions**
```rust
fn main() {
    let mut s = String::from("Hello");
    s.push_str(", world");
    println!("{}" , s);

    let s1 = String::from("hello");
    let s2 = s1.clone();
    println!("s1 = {}, s2 = {}", s1, s2);

    let s = String::from("hello");// s comes into scope

    takes_ownership(s); // s's value moves into the function and so is no longer valid here

    let x = 5; makes_copy(x);//x would move into the function, but i32 is Copy, so it's okay to still use x afterward
}

fn takes_ownership(some_string: String) { // some_string comes into scope
    println!("{}", some_string);
}   // Here, some_string goes out of scope and `drop` is called. The backing
    // memory is freed.

fn makes_copy(some_integer: i32) { // some_integer comes into scope
    println!("{}", some_integer);
}   // Here, some_integer goes out of scope. Nothing special happens.

```

```rust
fn main() {
    let s1 = String::from("hello");
    let (s2, len) = calculate_length(s1);
    println!("The length of '{}' is {}.", s2, len);
}

fn calculate_length(s: String) -> (String, usize){
    let length = s.len();
    (s, length)
}
```
以上代码有个什么问题呢，我们的主函数，如果还需要继续在主函数中使用变量s1，就需要函数calculate_length，返回变量s.

⚠️ **变量的所有权每次都遵循相同的模式：将值分配给另一个变量将其移动。 当包含堆上数据的变量超出范围时，将删除该值，除非该数据已移至另一个变量所有。**

**references and borrowing**
为了解决上面代码，必须返回，变量所有权的问题，我们来介绍reference。

reference和C++的引用和C语言的参数指针类似。
```rust
fn main() {
	let s1 = String::from("hello");
	let len = calculate_length(&s1);
	println!("The length of '{}' is {}.", s1, len); 
}
fn calculate_length(s: &String) -> usize { 
	s.len()
}
```

![](https://github.com/xiaolitongxue666/blog_image_2020_01/blob/master/2020-06-25-rust%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%EF%BC%88%E4%B8%89%EF%BC%89-%20Ownership/4.png?raw=true)


我们将calculate_length这种有reference作为参数的函数叫做borrowing。
reference 默认是不可变的，即不可修改所指向的内容。
如果需要修改，需要添加mut关键字。

可变引用有一个很大的限制：只能在一个特定范围内对一个特定的数据段进行一个可变引用。

可以理解为，一块特定的内存或变量不能同时指向两个指针，或者同时被两个引用引用。
```rust
let mut s = String::from("hello");
let r1 = &mut s; 
let r2 = &mut s;

--------------------------------------------------------------
error[E0499]: cannot borrow `s` as mutable more than once at a time --> borrow_twice.rs:5:19
```

使用大括号创建新的范围，从而允许多个可变引用。
```rust
let mut s = String::from("hello");
{
	let r1 = &mut s;
} // r1 goes out of scope here, so we can make a new reference with no // problems.
let r2 = &mut s;

```

如果是不可变引用和可变引用同时使用呢，答案也是不行的。多个不可变引用是可以的。
```rust
let mut s = String::from("hello");
let r1 = &s; // no problem
let r2 = &s; // no problem
let r3 = &mut s; // BIG PROBLEM

--------------------------------------------------------------
error[E0502]: cannot borrow `s` as mutable because it is also borrowed as immutable
```

小结：
1. 只有一个可变引用或者多个不可变引用。
2. 引用必须一直有效，类似C语言不能使用指向非法地址的指针。（涉及到后面章节中的生命周期概念）

**the slice type**
没有所有权的数据类型，被称为slice。
slice可以引用集合中连续的元素序列，而不是整个集合

⚠️ 对迭代器的简单理解
For now, know that iter is a method that returns each element in a collection and that enumerate wraps the result of iter and returns each element as part of a tuple instead. The first element of the tuple returned from enumerate is the index, and the second element is a reference to the element. This is a bit more convenient than calculating the index ourselves.

现在，知道**迭代器**是一种方法，该方法返回集合中的每一个元素，并对返回的每一个元素进行封装，将每一个元素封装成一个元组，元组的第一个元素是索引，第二个元素是对实际返回元素的索引。这样会比自己判断索引方便一些。
![](https://github.com/xiaolitongxue666/blog_image_2020_01/blob/master/2020-06-25-rust%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%EF%BC%88%E4%B8%89%EF%BC%89-%20Ownership/5.png?raw=true)


```rust
 fn first_word(s: &String) -> usize {
    let bytes = s.as_bytes(); //通过 as_byts 将String 转变为 数组
    //tuple(index , point to data)
    //for（）将返回的tuple拆分     
    //bytes.iter() 创建数组bytes的iterator迭代器
    for(i, &item) in bytes.iter().enumerate(){ 
	  	  //.iter().enumerate()返回元素的引用
        if item == b' ' { // b' ' 表示 代表一个空格的byte
            return i;
        }
    }
    s.len();
}
```

**string slices**
一个string slices是对String的一部分的引用。
```rust
let s = String::from("hello world");
let hello = &s[0..5]; 􏰨
let world = &s[6..11];
```

实际运行时内存的结构如下图
![](https://github.com/xiaolitongxue666/blog_image_2020_01/blob/master/2020-06-25-rust%E5%AD%A6%E4%B9%A0%E7%AC%94%E8%AE%B0%EF%BC%88%E4%B8%89%EF%BC%89-%20Ownership/6.png?raw=true)


```rust
fn first_word(s: &String) -> &str {
    let bytes = s.as_bytes(); //通过 as_byts 将String 转变为 数组

    //tuple(index , point to data)
    //for（）将返回的tuple拆分     //bytes.iter() 创建数组bytes的iterator迭代器
    for(i, &item) in bytes.iter().enumerate() { //.iter().enumerate()返回元素的引用
        if item == b' ' { // b' ' 表示 代表一个空格的byte
            return &s[0..i];
        }
    }
    &s[..]
}
```








