---
layout: default
author: xiaoli
---
# 软件调试的艺术 读书笔记(未完待续)
#### 基础操作
PS:进入gdb会话中,仍可以执行编译命令不用退出gdb,这样就可以保留值钱设置的断点和监控等.

命令缩写:
break : b
infor break : i b
condition : cond
run : r
next : n
step : s
continue : c
print : p
backtrace  : bt
finsh : fin

**编译选项**:在通过make或者直接调用gcc进行编译的时候,需要添加编译选项`-g[level]`将编译信息加入到最终生成的可执行代码中,建议使用debug/release版本进行区别是否执行.

**启动调试**:`gdb exec_file`

**设置断点**:
`break [line number]`在该行设置断点
`break [function name]`在该函数的第一行设置断点
`break + offset` or `break - offset`:可以在当前选中栈帧中正在执行的源代码行前或后设置断点偏移行数.
`break *address` 这种形式可以用来在虚拟内存地址处设置断点.这对于程序没有调试信息的部分(比如当源代码不可用时,或者对于共享库)是必须的.

**临时断点**:`tbreak` temp break 临时断点,只在首次到达断点的时候暂停程序,随后删除该断点.

**删除断点**:
`delete [break point list]`
删除断点使用数值标识符. 如果没有数值标识符即删除所有断点.
`clear [function]`
`clear [filename:function]`
`clear [line number]`
`clear [filename:line number]`
清除GDB将执行的下一个指令处的断点,这种方式适用于要删除GDB已经到达的断点的情况.没有参数表示 删除当前行的断点.

**禁用/启用断点**:`disable/enable [break point list]`
PS:不带任何参数将会禁用/启用所有断点

**断点条件**:`condition [breakpoint number] [var =/>/<]`
设置完断点后会显示一个断点号,针对该断点号设置暂停的条件

**断点命令列表**:每次到达某个断电的时候自动执行一组命令便于变量的查看.推荐和条件中断一起使用.
```
commands [break point number]
...
commands
...
end
```

**使用宏命令创建宏**:
```
(gdb) define print_and_go
Redefine commadn "print_and_go"? (y or n)y
Type commands for definition of "print_and_go".
End with a line saying just "end".
>prinf $arg0, $arg1
>confinue
>end
(gdb) commadns 1
Type commands for definition of "print_and_go".
End with a line saying just "end".
>silent
>print_and_go "fibonacci() was passed %d.\n" , n
>end
```
PS:设置好的宏可以再代码任何地方使用,并且可以将宏保存在.gdbinit文件中

**显示所有宏的列表**:`show user`

**条件断点设置**:`break [line numbwe] if [var =/>/<]`
即是 设置断点和断点条件的合并 推荐使用

**显示断点信息**:`info break`:显示断点位置和暂停次数等信息

**单步调试**:`step`

**逐过程调试**:`next` next 是在单步执行时，在函数内遇到子函数时不会进入子函数内单步执行，而是将子函数整个执行完再停止，也就是把子函数整个作为一步。在其他调试器中相当于step-over，作用是在同一个调用栈层中移动到下一个可执行的代码行。调试器不会进入函数体。如果当前行是函数的最后一行，则，next将进入下一个栈层，并在调用函数的下一行停止。

**重新运行程序**:`run`

**继续/运行**:`continue` 恢复并继续运行,直到遇到下一个断点.

**恢复程序执行**:`finish` 恢复执行,直到当前栈帧完成后为止.即运行到当前函数执行完成.
PS:如果在一个递归函数中,finish将会进入到带入到上一层递归,不推荐在递归函数中使用.

**跳出循环**:`until`执行程序,直到到达当前循环体外的下一行源代码.
PS:`until` 命令也可以接收源代码中的位置作为参数.例如 `until 17` `until swap` `until swapflaw.c:17`

#### 状态检查
**检查变量**:`print j` 输出变量j的当前值
PS:`print`可以直接打印结构体

**每次暂停打印指定条目**:每次暂停后自动显示,不用在输入print
`display [var]/[struct entry]`
`dis disp 1` 禁用条目1
`enable disp 1` 启用条目1
`undisp 1` 完全删除条目1
`info disp` 显示disp信息

**监视变量**:`watch z`监控变量z值的变化;`watch (z >28)`当监控变量z大于28时暂停程序.
`watich z`全局监视变量z,一旦有变化马上暂停.
只能监视存在且在作用域内的变量.一旦变量不存在与调用栈的任何帧中,gdb会自动删除监视点.

**查看栈帧**:`frame [number]`在GDB执行frame命令的时候,当前正在被执行的函数被编号为0,其父帧被编号为1,父帧的父帧被编号为2,以此类推.GDB的命令`up`和`down`会分别将你带到调用栈的下一个父帧和反向帧,类似于vs里面的前进和后退,方便查看程序的调用流程.

**显示上下文**:
`list`:显示当前暂停行上下文
`list [function name]` 显示某个函数代码

**显示整个栈**:`backtrace`显示整个栈,即当前存在的所有帧的集合.

**联机帮助**:`help breakpoints` 在GDB中可以使用该命令显示关于断点的帮助文档.

**GDB启动文件**:
如果必须要退出GDB但是有不想重复的出入各种断点和监控设置,就可以使用GDB启动文件`.gdbini`可以将一个文件放在主目录用于通用的设置,另一个文件放在调试的项目的目录中. 主目录中可以开发一些红,类似共享库的作用. 指定特定的GDB启动文件输入命令`$gdb -command=z [file name]`

**调试过程中调用代码函数**:
`call [function name]`

**打印动态内存段**: *pointer@number_of_elements
```
int *x = (int *) malloc(25*sizeof(int));

(gdb) p *x@25
```

**浏览类或者数据结构**:`ptype [class name]/[struct name]`

**监视局部变量**:`info locals`

**设置变量**:`set [var] = x`

**使用历史值**`p [var]` 和 `p $1` 效果是一样的,类似Linux终端里面按 '↑' 的效果 不过不是针对命令 是针对变量.