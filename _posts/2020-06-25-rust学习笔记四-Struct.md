---
layout: default
title:  "Rust学习笔记（四）Ownership"
date:   2020-06-25 14:27:04 +0800
categories: 
---

# Rust 学习笔记 （四）Struct
#ProgrammingLanguage/Rust

**define and  instantiating structs**
struct 和 tuple的异同点：
相同点： 两者都可以由不同的类型的参数构成
不同点： 不像tuple，struct 可以组成的每一个类型数据，进行命名。

``` rust
let tup: (i32, f64, u8) = (500, 6.4, 1);
```

可以不再依赖数据的构成顺序，直接通过名字进行访问。

``` rust
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}

//可以不用按定义顺序
let mut user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };
```
与元组不同，结构图需要为每个变量命名，以便清楚地知道这些值的含义。 由于使用了这些名称，因此结构比元组更灵活：不必依赖数据的顺序来指定或访问实例的值。

注意整个实例必须是可变的。 Rust不允许我们仅将某些字段标记为可变字段。 与任何表达式一样，我们可以将结构的新实例构造为函数主体中的最后一个表达式，以隐式返回该新实例。

用与struct字段相同的名称来命名函数参数是有意义的，但是必须重复email和username字段的名称和变量有点乏味。 如果该结构具有更多字段，则重复每个名称将变得更加烦人。 幸运的是，这里有一个方便的简写！

**using the field init shorthand when variables and fields have the same name**

![rust_struct](/assets/images/posts/2020/2020-06-25-rust学习笔记四-Struct/2020-06-25-rust学习笔记四-Struct_0001.png)

![rust_struct](/assets/images/posts/2020/2020-06-25-rust学习笔记四-Struct/2020-06-25-rust学习笔记四-Struct_0002.png)

形参和结构体变量名完全一致，就可以用简略的写法，对结构体变量赋值。不必在重复书写。


**creating instances from other instances with struct update syntax**

![rust_struct](/assets/images/posts/2020/2020-06-25-rust学习笔记四-Struct/2020-06-25-rust学习笔记四-Struct_0003.png)

更新结构体部分变量数据可以简写为

![rust_struct](/assets/images/posts/2020/2020-06-25-rust学习笔记四-Struct/2020-06-25-rust学习笔记四-Struct_0004.png)

**tuple structs**
当您想给整个元组起一个名字并使元组成为与其他元组不同的类型时，元组结构很有用。
```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);
let black = Color(0, 0, 0); let origin = Point(0, 0, 0);
```

如何在调试场景中打印出整个struct
```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}
fn main() {
	let rect1 = Rectangle { width: 30, height: 50 };
	println!("rect1 is {:?}", rect1); 
}

--------------------------------------------------------------
oputput:
rect1 is Rectangle { width: 30, height: 50 }
```
如果将**{:#?}** 换成 **{:?}**
输出会变成这样
```rust
rect1 is Rectangle {
	width: 30,
	height: 50 
}
```

rust为我们提供了许多特征，可以与衍生注释一起使用，这些特征可以为我们的自定义类型添加有用的行为。

**method**
method和函数类似，但是不同在于，method是定义在struct（或者enum, trait object）的上下文中, 并且第一个参数一定是self,它表示正在调用方法的struct的实例。
```rust
#[derive(Debug)]
struct Rectangle {
		 width: u32,
       height: u32,
 }
􏰨impl Rectangle {
􏰩	fn area(&self) -> u32 {
		self.width * self.height 
	}
}
fn main() {
	let rect1 = Rectangle { width: 30, height: 50 };
	println!(
		"The area of the rectangle is {} square pixels.",
􏰪 		rect1.area() );
}
```
为了在struct的上下文中定义函数，我们启动了一个impl(实现)块。将面积计算函数移到块中。

method也可以获取到控制权，所以使用&self。

method接收多参数：
```rust
impl Rectangle {
	fn area(&self) -> u32 {
		self.width * self.height 
	}
	fn can_hold(&self, other: &Rectangle) -> bool {
		self.width > other.width && self.height > other.height
	}
}
```

**associated functions**
Impl block( implement<实现>块)，还有一个有用的功能，就是可以在实现块里，定义函数并且不用把self当作参数。这个功能被叫做associated funcitons结构关联函数。

关联函数常常用于构建并返回一个结构体实体。

调用关联还函数格式是  ‘结构体名字：：’ 语法。

**multiple impl  blocks**
每一个结构体，允许使用多个实现块。可以在一个impl下也可以分开书写。
```rust
impl Rectangle {
fn area(&self) -> u32 {
self.width * self.height }
}
impl Rectangle {
fn can_hold(&self, other: &Rectangle) -> bool {
self.width > other.width && self.height > other.height }
}
```

关联的函数使您可以使用特定于结构的名称空间功能，而无需使用实例。

通过结构，可以创建对您的域有意义的自定义类型。通过使用结构，可以使关联的数据段相互连接，并为每个数据块命名以使代码清晰。 方法可以指定结构实例的行为，而关联函数可以在没有实例可用的情况下使用特定于结构的名称空间功能。 impl  Rectangle  {} 括号内 就是 Rectangle 的命名空间.

``` rust
let sq = Rectangle::square(3);
```














