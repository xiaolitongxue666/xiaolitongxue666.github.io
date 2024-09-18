---
layout: default
title:  "Rust学习笔记（七） common collections"
date:   2020-06-25 15:19:04 +0800
categories: 
---

# Rust学习笔记 （七） common collections
#ProgrammingLanguage/Rust

大多数数据类型代表一种特定的值，但是collections可以包含不同的值。

常用的三种collections：
* vector: 允许保存可以变长度的数据链
* string：字符串
* hash map; 哈希表

**creating a new vector**
```rust
let v: Vec<i32> = Vec::new();

let v = vec![1, 2, 3]; //vec! 是宏
```

因为vector是一个连续的链表，添加元素，只能通过push操作。
```rust
let mut v = Vec::new();

v.push(5);
v.push(6);
v.push(7);
v.push(8);
```

读取一个vector
```rust
let v = vec![1, 2, 3, 4, 5];

let third: &i32 = &v[2]; //序号0，1，2

let third: Option<&i32> = v.get(2);
```

规定在同一范围内不能有可变且不变的引用。
```rust
let mut v = vec![1, 2, 3, 4, 5];
let first = &v[0];
v.push(6);
```
所以上述代码，因为 first 这个引用是不可变的，因此最后一句报错，无法执行。

**遍历vector**
``` rust
let v = vec![100, 32, 57]; 
for i in &v {
	println!("{}", i); 
}

let mut v = vec![100, 32, 57]; 
for i in &mut v {
	*i += 50; 
}
```

**using an enum to store multiple types**
可以定义一个枚举，其变量包含不同的值类型，然后所有枚举变量被视为相同的类型：枚举变量。
然后我们，就可以创建一个vector来包含这些枚举变量。
此举的目的就是为了，让vector可以每个元素的实际变量类型不同。
```rust
enum SpreadsheetCell {
  Int(i32),
	Float(f64),
  Text(String),
}
let row = vec![
	SpreadsheetCell::Int(3),
  SpreadsheetCell::Text(String::from("blue")),
  SpreadsheetCell::Float(10.12),
];
```

**storing UTF-8  encoded text with strings**
```rust
let mut s = String::new();

let data = "initial contents"; 

let s = data.to_string();

// the method also works on a literal directly: 
let s = "initial contents".to_string();

let s = String::from("initial contents");

```

修改更新string
```rust
let mut s = String::from("foo"); 
s.push_str("bar");

//单个字符使用push
let mut s = String::from("lo"); 
s.push('l');

let s1 = String::from("Hello, ");
let s2 = String::from("world!");
let s3 = s1 + &s2; // note s1 has been moved here and can no longer be used

```

如果你要把多个字符串连接起来，+操作会比较沉重，效率较低。
建议使用format!宏。
```rust
let s1 = String::from("tic"); 
let s2 = String::from("tac"); 
let s3 = String::from("toe");

let s = format!("{}-{}-{}", s1, s2, s3);
```
使用format,让代码更易阅读，并且不会获取所有权。

**indexing into strings**
string 是一个 Vec<u8>的封装。

**Bytes and Scalar Values and Grapheme Clusters!**
Rust不允许我们索引到String中以获取字符的最后一个原因是，索引操作总是需要恒定的时间（O（1））。

**分割字符串**
``` rust
let hello = "􏱤􏱥􏱦􏱧􏱨abcdefg􏱣􏱤􏱥􏱦􏱧􏱨􏱩􏱧􏱪􏱫􏱩􏱬"; 
let s = &hello[0..4];
```

**迭代获取字符**
```rust
for c in "abcdefghi".chars() {
	println!("{}" , c);
}

for c in "abcdefghi".bytes() {
	println!("{}" , c);
}
```

**hash maps**
```rust
use std::collections::HashMap; 
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10); scores.insert(String::from("Yellow"), 50);


let teams = vec![String::from("Blue"),String::from("Yellow")]; 
let initial_scores = vec![10, 50];
let scores: HashMap<_, _> = teams.iter().zip(initial_scores.iter()).collect();

```

哈希表的所有权：
```rust
use std::collections::HashMap;
let field_name = String::from("Favorite color"); 
let field_value = String::from("Blue");
let mut map = HashMap::new();
map.insert(field_name, field_value);
// field_name and field_value are invalid at this point, try using them and see what compiler error you get!
```

**accessing values  in a hash map**
```rust
use std::collections::HashMap; 
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10); scores.insert(String::from("Yellow"), 50);
let team_name = String::from("Blue"); 
let score = scores.get(&team_name);

for (key, value) in &scores { 
	println!("{}: {}", key, value);
}
```

**overwriting a value**
```rust
use std::collections::HashMap;
let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10); scores.insert(String::from("Blue"), 25);
println!("{:?}", scores);
```

**only inserting a value if the key has no value**
```rust
use std::collections::HashMap;
let mut scores = HashMap::new(); scores.insert(String::from("Blue"), 10);
scores.entry(String::from("Yellow")).or_insert(50); scores.entry(String::from("Blue")).or_insert(50);
println!("{:?}", scores);
```

**update a value based on the old value**
```rust
use std::collections::HashMap;
let text = "hello world wonderful world"; 
let mut map = HashMap::new();
for word in text.split_whitespace() {
	let count = map.entry(word).or_insert(0); 
	*count += 1;
}
println!("{:?}", map);
```

































