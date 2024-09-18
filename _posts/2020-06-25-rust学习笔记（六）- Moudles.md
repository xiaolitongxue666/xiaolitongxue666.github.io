---
layout: default
title:  "Rust学习笔记（六）Modules"
date:   2020-06-25 15:19:04 +0800
categories: 
---

# Rust 学习笔记（六）Modules 
#ProgrammingLanguage/Rust

一个模块就是一个命名空间，可以包含函数定义或者类型，也可以通过设置public或者private让外部是否可以访问到。

**mod and filesystem**
* 如果一个模块没有子模块，只需要声明一个模块名的文件.rs。
* 如果一个模块有子模块，需创建一个模块名的文件夹，并将模块文件重命名为mod.rs，放在模块名的文件夹下。

**controlling visibility with pub**
* 如果是public，就可以被所有父模块访问
* 如果是private，就只能被直接父模块和父模块的所有同级模块访问（所有兄弟模块）。

**bring names into scope with the use keyword**
如果从顶层模块一直向下一级调用，会让代码显得很冗长。
```rust
pub mod a {
    pub mod series {
        pub mod of {
            pub fn nested_modules() {}
		} 
	}
}

--------------------------------------------------------------
use a::series::of;

fn main() {
    of::nested_modules();
}
```
use关键字仅将我们指定的内容带入范围； 它不会将模块的子级纳入范围。
这也是为什么我们仍需要使用of。

我们可以选择通过在使用中指定函数来将函数纳入范围内，如下所示
``` rust
use a::series::of::nested_modules;

fn main() {
    nested_modules();
}
```

``` rust
enum TrafficLight {
  Red,
	Yellow,
	Green, 
}

use TrafficLight::{Red, Yellow};

fn main() {
	let red = Red;
	let yellow = Yellow;
	let green = TrafficLight::Green; 
}
```

**bringing all names into scope with a glob**
```rust
enum TrafficLight {
  Red,
	Yellow,
	Green, 
}
use TrafficLight::*;

fn main() {
	let red = Red;
	let yellow = Yellow;
	let green = Green; 
}
```

```rust
use TrafficLight::*;
```

**using super to access a parent module**
⚠️路径始终相对于当前模块
``` rust
pub mod client;

pub mod network;

#[cfg(test)]
mod tests{
    #[test]
    fn it_work(){
        assert_eq!(2+2. 4);
        client::connect();//error : this line is same as test::client::connect()
        ::client::connect();//right : this line is same as {ROOT}::client::connect()
        super::client::connect();//right : 我们可以使用super在我们的层次结构中向上移动一个模块
    }
}
```

通过Packages和Crates,Modules来管理大型项目的结构

Cargo将crate的根目录,传递给rustc进行编译,为库或者二进制文件.

如果一个package 包含 src_main.rs 和 src_lib.rsm,那么这个packet就会有两个crates,一个库和一个二进制文件,两者都和packet同一个名字.一个package中,可以包含复数个二进制文件,在src/bin目录下.每一个文件就是一个单独的二进制crate.

Module可以让我们将一个crate的代码进行分组,以提高代码的阅读性和重用性.

我们将定义函数的申明，但将函数的主体留空以专注于代码的组织，而不是实际在代码中写完实现部分。

为了以与实际设计相同的方式构造crates，我们可以将函数申明到嵌套模块中。
```rust
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}

        fn seat_at_table() {}
    }

    mod serving {
        fn take_order() {}

        fn serve_order() {}

        fn take_payment() {}
    }
}

fn main() {}

```

模块还可以保存其他项目的定义，例如结构，枚举，常量，traits.
```
crate
 └── front_of_house
     ├── hosting
     │   ├── add_to_waitlist
     │   └── seat_at_table
     └── serving
         ├── take_order
         ├── serve_order
         └── take_payment
```
如果模块A包含在模块B内，则我们说模块A是模块B的子级，而模块B是模块A的父级

请注意，整个模块树都植根于名为crate的隐式模块下。

path:绝对路径 和 相对路径从当前模块开始,在当前模块中使用self，super或标识符 .

两种方式都需要使用得到 ::
```rust
mod front_of_house {
    mod hosting { //需要添加pub
        fn add_to_waitlist() {} //需要添加pub
    }
}

pub fn eat_at_restaurant() {
    // Absolute path
    crate::front_of_house::hosting::add_to_waitlist();

    // Relative path
    front_of_house::hosting::add_to_waitlist();
}
```
我们倾向于指定绝对路径，因为它更有可能彼此独立地移动代码定义和项目调用。

模块不仅仅对组织代码有用。他们还定义了Rust的隐私边界：封装了外部代码的实施细节的行不允许知道，调用或依赖。 因此，如果要将项目设为函数或结构私有，则将其放在模块中。

Items in a parent module can’t use the private items inside child modules, but items in child modules can use the items in their ancestor modules.
父模块中的项目不能使用子模块中的私有项目，但是子模块中的项目可以使用其祖先模块中的项目。

但是，可以使用pub关键字将某个项目的内部代码公开给外部祖先模块。

公开该模块不会公开其内容。模块上的pub关键字仅允许其祖先模块中的代码引用它
```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // Absolute path
    crate::front_of_house::hosting::add_to_waitlist();

    // Relative path
    front_of_house::hosting::add_to_waitlist();
}

fn main() {}

```
绝对路径下:front_of_house模块不是公开的 但是由于eat_at_restaurant函数是在与front_of_house相同的模块中定义的（也就是说，eat_at_restaurant和front_of_house是同级的） 我们可以从eat_at_restaurant引用front_of_house ,接下来的 host 是公开的.最后，将add_to_waitlist函数标记为pub，我们可以访问其父模块，因此此函数调用有效！

相对路径下:front_of_house模块与eat_at_restaurant在同一模块中定义，因此从定义eat_at_restaurant的模块开始的相对路径有效 .

相对路径中使用super:

我们还可以通过在路径的开头使用super来构造从父模块开始的相对路径。 这就类似我们在文件系统中调用 ../ 来表示上一级路径.
```rust
fn serve_order() {}

mod back_of_house {
    fn fix_incorrect_order() {
        cook_order();
        super::serve_order();
    }

    fn cook_order() {}
}

fn main() {}

```
fix_incorrect_order函数通过指定以super开头的serve_order路径来调用serve_order函数 ,这就可以是,子一级调用上一级的模块.

公开结构和枚举

我们在结构定义之前使用pub，将结构公开，但结构的字段仍为私有。我们可以根据具体情况公开或不公开每个领域
```rust
#![allow(unused_variables)]
fn main() {
    mod back_of_house {
        pub struct Breakfast {
            pub toast: String,
            seasonal_fruit: String,
        }

        impl Breakfast {
            pub fn summer(toast: &str) -> Breakfast {
                Breakfast {
                    toast: String::from(toast),
                    seasonal_fruit: String::from("peaches"),
                }
            }
        }
    }

    pub fn eat_at_restaurant() {
        // Order a breakfast in the summer with Rye toast
        let mut meal = back_of_house::Breakfast::summer("Rye");
        // Change our mind about what bread we'd like
        meal.toast = String::from("Wheat");
        println!("I'd like {} toast please", meal.toast);

        // The next line won't compile if we uncomment it; we're not allowed
        // to see or modify the seasonal fruit that comes with the meal
        // meal.seasonal_fruit = String::from("blueberries");
	}
}

```
我们定义了一个公共的back_of_house :: Breakfast结构，其中包含一个公共的toast字段，但一个私有的season_fruit字段。

因为back_of_house :: Breakfast有一个私有字段，所以该结构需要提供一个公共的关联函数来构造Breakfast实例

相反，如果我们将一个枚举公开，则其所有变体都将公开。我们只需要在enum关键字之前使用pub
```rust

#![allow(unused_variables)]
fn main() {
    mod back_of_house {
        pub enum Appetizer {
            Soup,
            Salad,
        }
    }

    pub fn eat_at_restaurant() {
        let order1 = back_of_house::Appetizer::Soup;
        let order2 = back_of_house::Appetizer::Salad;
    }
}

```
枚举变量的默认设置是公开的

通过关键字,讲路径引入范围内:

如果在较多的地方使用绝对路径,会显得比较冗长

我们可以一次将一个路径带入一个范围，然后使用use关键字将该路径中的项目称为本地项目
```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting; //类似C++的 using spacename

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
}

fn main() {}

```
在crates根目录中使用crate :: front_of_house :: hosting，host现在是该范围内的有效名称

还可以通过使用和相对拍打将项目纳入范围 如何指定相对路径以获得相同的效果
```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use self::front_of_house::hosting; //use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
}

fn main() {}

```
尽快使用了关键字,引入了范围,但是还是建议使用  hosting::add_to_waitlist(); 不推荐直接使用 add_to_waitlist,考虑到模块有重名的,这样能比较好定位代码调用的函数所在的crate.

另一方面，在使用结构，枚举和其他项时，习惯上指定完整路径。
```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}
```

将模块分解到各个文件:
```rust
//mod front_of_house {
//    pub mod hosting {
//        pub fn add_to_waitlist() {}
//    }
//}
mod front_of_house; //这里很像C的include

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
    hosting::add_to_waitlist();
}

fn main() {}

```
将front_of_house模块移至其自己的文件src / front_of_house

src/front_of_house.rs
```rust
pub mod hosting {
    pub fn add_to_waitlist() {}
}
```
在mod front_of_house之后使用分号（而不是使用块）会告诉Rust从另一个与模块同名的文件中加载模块的内容。 (注意 文件名字和模块名字同名)

进一步的分解模块

src/front_of_house.rs
```rust

#![allow(unused_variables)]
fn main() {
pub fn add_to_waitlist() {}
}

```
Rust使您可以将一个包分成多个crates，然后将一个crates分成多个模块，以便可以从另一个模块引用一个模块中定义的项目。



























