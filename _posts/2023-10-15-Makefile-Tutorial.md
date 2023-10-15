#make #makefile 

[github](https://github.com/theicfire/makefiletutorial)
[web](https://makefiletutorial.com/#top)
[code](https://github.com/xiaolitongxue666/makefiletutorial)
[A Super-Simple Makefile for Medium-Sized C/C++ Projects](https://spin.atomicobject.com/2016/08/26/makefile-c-projects/)

ehco会显示命令本身
```shell
echo "hello world"
```
```shell
echo "hello world"
hello world
```

@echo 隐藏命令本身
```shell
@echo "hello world"
```
```shell
hello world
```

```shell
blah: blah.c 
	cc blah.c -o blah
```
- make一般默认选择第一个目标为默认目标
- 先决条件为blah.c
- Make 决定是否应该运行 blah 目标。仅当 blah 不存在或 blah.c 比 blah 新时才会运行


[Reference](https://www.cnblogs.com/wanqieddy/archive/2011/09/21/2184257.html)
- = 是最基本的赋值  
- := 是覆盖之前的值  
- ?= 是如果没有被赋值过就赋予等号后面的值  
- += 是添加等号后面的值

声明变量并赋值
```shell
files := file1 file2
```

使用 ${} 或 $() 引用变量
```shell
$(files)
```

```shell
$@  表示目標文件
$^  表示所有的依賴文件
$<  表示第一個依賴文件
$?  表示比目標還要新的依賴文件列表
```

通配符
\* :  在你的文件系统中搜索匹配的文件
- \* 可以用在目标、先决条件或通配符函数中
- 危险： * 不能直接用在变量定义中
- 危险：当 * 不匹配任何文件时，保持原样（除非在通配符函数中运行）

% :  确实很有用，但有点令人困惑，因为它可以用于多种情况
- 当用于“匹配”模式时，它匹配字符串中的一个或多个字符。
- 当在“替换”模式下使用时，它会采用匹配的词干并替换字符串中的词干
- % 最常用于规则定义和一些特定函数中

**隐式规则**
- 编译 C 程序：n.o 是通过 $(CC) -c $(CPPFLAGS) $(CFLAGS) $^ -o $@ 形式的命令从 n.c 自动生成的
- 编译 C++ 程序：n.o 是通过 $(CXX) -c $(CPPFLAGS) $(CXXFLAGS) $^ -o $@ 形式的命令从 n.cc 或 n.cpp 自动生成的
- 链接单个目标文件：通过运行命令 $(CC) $(LDFLAGS) $^ $(LOADLIBES) $(LDLIBS) -o $@ 从 n.o 自动生成 n

隐式规则使用的重要变量是：
- CC：编译C程序的程序；默认cc
- CXX：编译C++程序的程序；默认g++
- CFLAGS：提供给 C 编译器的额外标志
- CXXFLAGS：提供给 C++ 编译器的额外标志
- CPPFLAGS：提供给 C 预处理器的额外标志
- LDFLAGS：当编译器应该调用链接器时提供给编译器的额外标志

静态模式规则
语法如下:
```shell
targets...: target-pattern: prereq-patterns ... 
	commands
```

本质是给定的目标与目标模式匹配（通过 % 通配符）
匹配的任何东西都称为 stem
然后将stem替换为先决条件模式，以生成目标的先决条件。

一个典型的用例是将 .c 文件编译为 .o 文件。这是手动方式
```shell
objects = foo.o bar.o all.o

all: $(objects)

# These files compile via implicit rules
foo.o: foo.c
bar.o: bar.c
all.o: all.c

all.c:
    echo "int main() { return 0; }" > all.c

%.c:
    touch $@

clean:
    rm -f *.c *.o all
```

这是更有效的方法，使用静态模式规则：
```shell
objects = foo.o bar.o all.o

all: $(objects)

# These files compile via implicit rules
# Syntax - targets ...: target-pattern: prereq-patterns ...
# In the case of the first target, foo.o, the target-pattern matches foo.o and sets the "stem" to be "foo".
# It then replaces the '%' in prereq-patterns with that stem
$(objects): %.o: %.c

all.c:
    echo "int main() { return 0; }" > all.c

%.c:
    touch $@

clean:
    rm -f *.c *.o all
```

**静态模式规则和过滤器**
```shell
obj_files = foo.result bar.o lose.o
src_files = foo.raw bar.c lose.c

all: $(obj_files)

# Note: PHONY is important here. Without it, implicit rules will try to build the executable "all", since the prereqs are ".o" files.
.PHONY: all

# Ex 1: .o files depend on .c files. Though we don't actually make the .o file.
$(filter %.o,$(obj_files)): %.o: %.c
    echo "target: $@ prereq: $<"

# Ex 2: .result files depend on .raw files. Though we don't actually make the .result file.
$(filter %.result,$(obj_files)): %.result: %.raw
    echo "target: $@ prereq: $<"

%.c %.raw:
    touch $@

clean:
    rm -f $(src_files)
```


模式规则
- 定义您自己的隐式规则的方法
- 静态模式规则的更简单形式

```shell
# Define a pattern rule that compiles every .c file into a .o file 
%.o : %.c 
	$(CC) -c $(CFLAGS) $(CPPFLAGS) $< -o $@
```

**双冒号规则**
双冒号规则很少使用，但允许为同一目标定义多个规则。
```shell
all: blah

blah::
    echo "hello"

blah::
    echo "hello again"
```

**每个命令都在新的 shell 中运行**
```shell
all:
    cd ..
    # The cd above does not affect this line, because each command is effectively run in a new shell
    echo `pwd`

    # This cd command affects the next because they are on the same line
    cd ..;echo `pwd`
    # or like
    cd subdir && $(MAKE)

    # Same as above
    cd ..; \
    echo `pwd`
```

默认Shell
```shell
SHELL=/bin/bash

cool:
	echo "Hello from bash"
```

请注意下一个示例中 Makefile 变量和 Shell 变量之间的差异
```shell
make_var = I am a make variable
all:
    # Same as running "sh_var='I am a shell variable'; echo $sh_var" in the shell
    sh_var='I am a shell variable'; echo $$sh_var

    # Same as running "echo I am a make variable" in the shell
    echo $(make_var)
```

使用 -k、-i 和 - 进行错误处理
- 运行 make 时添加 -k，即使出现错误也可以继续运行。如果您想立即查看 Make 的所有错误，这很有帮助。
- 在命令前添加 - 以抑制错误
- 添加 -i 以使每个命令都发生这种情况。

**递归使用make**
要递归调用 makefile，请使用特殊的 $(MAKE) 而不是 make，因为它会为您传递 make 标志，并且本身不会受到它们的影响。
```shell
new_contents = "hello:\n\ttouch inside_file"
all:
    mkdir -p subdir
    printf $(new_contents) | sed -e 's/^ //' > subdir/makefile
    cd subdir && $(MAKE)
clean:
    rm -rf subdir
```

**导出、环境和递归 make**
当 Make 启动时，它会自动从执行时设置的所有环境变量中创建 Make 变量
```shell
# Run this with "export shell_env_var='I am an environment variable'; make"
all:
    # Print out the Shell variable
    echo $$shell_env_var
    
    # Print out the Make variable
    echo $(shell_env_var)
```

导出指令采用一个变量并将其设置为所有配方中所有 shell 命令的环境
```shell
shell_env_var=Shell env var, created inside of Make 
export shell_env_var 
all: 
	echo $(shell_env_var) 
	echo $$shell_env_var
```

因此，当您在 make 内部运行 make 命令时，可以使用导出指令使其可供子 make 命令访问。在此示例中，cooly 被导出，以便 subdir 中的 makefile 可以使用它。
```shell
new_contents = "hello:\n\techo \$$(cooly)"

all:
    mkdir -p subdir
    printf $(new_contents) | sed -e 's/^ //' > subdir/makefile
    @echo "---MAKEFILE CONTENTS---"
    @cd subdir && cat makefile
    @echo "---END MAKEFILE CONTENTS---"
    cd subdir && $(MAKE)

# Note that variables and exports. They are set/affected globally.
cooly = "The subdirectory can see me!"
export cooly
# This would nullify the line above: unexport cooly
clean:
    rm -rf subdir
```

需要导出变量才能让它们在 shell 中运行
```shell
one=this will only work locally
export two=we can run subcommands with this

all: 
	@echo $(one)
	@echo $$one
	@echo $(two)
	@echo $$two
```

**.EXPORT_ALL_VARIABLES 为您导出所有变量。**
```shell
.EXPORT_ALL_VARIABLES:
new_contents = "hello:\n\techo \$$(cooly)"
cooly = "The subdirectory can see me!"
# This would nullify the line above: unexport cooly
all:
    mkdir -p subdir
    printf $(new_contents) | sed -e 's/^ //' > subdir/makefile
    @echo "---MAKEFILE CONTENTS---"
    @cd subdir && cat makefile
    @echo "---END MAKEFILE CONTENTS---"
    cd subdir && $(MAKE)
clean:
    rm -rf subdir
```

有一个很好的选项列表可以从 make 运行。查看 --dry-run、--touch、--old-file。 您可以创建多个目标，即 make clean run test 运行 clean 目标，然后运行，然后测试

变量赋值:
- = : 仅在使用命令时查找变量，而不是在定义命令时查找变量。使用时展开
- := : 直接展开
- ?= : 仅设置尚未设置的变量
- += : 追加
```shell
# Recursive variable. This will print "later" below
one = one ${later_variable}
# Simply expanded variable. This will not print "later" below
two := two ${later_variable}

later_variable = later

all:
    echo $(one)
    echo $(two)
```

**命令行参数和覆盖**

可以使用 override 覆盖来自命令行的变量。这里我们用 make option_one=hi 运行 make
```shell
# Overrides command line arguments
override option_one = did_override
# Does not override command line arguments
option_two = now_override
all:
	echo $(option_one)
	echo $(option_two)
```

目标特定变量 可以为特定目标设置变量
```shell
all: one = cool

all:
    echo one is defined: $(one)
    
other:
    echo one is nothing: $(one)
```

特定于模式的变量 您可以为特定目标模式设置变量
```shell
%.c: one = cool

blah.c:
    echo one is defined: $(one)

other:
    echo one is nothing: $(one)
```

**if / else**
```shell
foo = ok

all:

ifeq ($(foo), ok)
    echo "foo equals ok"
else
    echo "nope"
endif
```

检查变量是否为空
```shell
nullstring =

foo = $(nullstring) # end of line; there is a space here

all:
ifeq ($(strip $(foo)),)
    echo "foo is empty after being stripped"
endif
ifeq ($(nullstring),)
    echo "nullstring doesn't even have spaces"
endif
```

检查变量是否已定义
```shell
bar =
foo = $(bar)

all:
ifdef foo
    echo "foo is defined"
endif
ifndef bar
    echo "but bar is not"
endif
```

**$(MAKEFLAGS)**
此示例向您展示如何使用 findstring 和 MAKEFLAGS 测试 make 标志。使用 make -i 运行此示例以查看它打印出 echo 语句
```shell
all:

# Search for the "-i" flag. MAKEFLAGS is just a list of single characters, one per flag. So look for "i" in this case.
ifneq (,$(findstring i, $(MAKEFLAGS)))
    echo "i was passed to MAKEFLAGS"
endif
```

**函数**
函数主要用于文本处理。使用 $(fn,arguments) 或 ${fn,arguments} 调用函数。 Make 有相当多的内置函数
```shell
bar := ${subst not, totally, "I am not superman"}
all:
    @echo $(bar)
```

如果要替换空格或逗号，请使用变量
```shell
comma := ,
empty:=
space := $(empty) $(empty)
foo := a b c
bar := $(subst $(space),$(comma),$(foo))

all:
    @echo $(bar)
```

**字符串替换**
$(patsubst pattern,replacement,text) 执行以下操作：
“在文本中查找与模式匹配的以空格分隔的单词，并将其替换为替换。此处模式可能包含充当通配符的“%”，匹配单词中任意数量的任何字符。如果替换也包含“%”， '%' 被与模式中 '%' 匹配的文本替换。只有模式和替换中的第一个 '%' 会以这种方式处理；任何后续 '%' 都不会改变。”

```shell
foo := a.o b.o l.a c.o
one := $(patsubst %.o,%.c,$(foo))
# This is a shorthand for the above
two := $(foo:%.o=%.c)
# This is the suffix-only shorthand, and is also equivalent to the above.
three := $(foo:.o=.c)

all:
    echo $(one)
    echo $(two)
    echo $(three)
```

**foreach 函数**
foreach 函数如下所示：$(foreach var,list,text)。它将一个单词列表（用空格分隔）转换为另一个单词列表。 var 设置为列表中的每个单词，并且每个单词的文本都会扩展。 这会在每个单词后面添加一个感叹号：

```shell
foo := who are you
# For each "word" in foo, output that same word with an exclamation after
bar := $(foreach wrd,$(foo),$(wrd)!)

all:
    # Output is "who! are! you!"
    @echo $(bar)
```

实例
```shell
SRCS    = $(notdir $(foreach temp, $(SRCDIR), $(wildcard $(temp)/*.c)))
```

**if 函数**
if 检查第一个参数是否非空。如果是，则运行第二个参数，否则运行第三个参数
```shell
foo := $(if this-is-not-empty,then!,else!)
empty :=
bar := $(if $(empty),then!,else!)

all:
    @echo $(foo)
    @echo $(bar)
```

**调用自建makefile函数**
创建一个变量即可“定义”该函数，但使用参数 $(0)、$(1) 等。然后您可以使用特殊的 call 内置函数来调用该函数。 语法为$(调用变量,参数,参数)。 $(0) 是变量，而 $(1)、$(2) 等是参数
```shell
sweet_new_fn = Variable Name: $(0) First: $(1) Second: $(2) Empty Variable: $(3)

all:
    # Outputs "Variable Name: sweet_new_fn First: go Second: tigers Empty Variable:"
    @echo $(call sweet_new_fn, go, tigers)
```

调用shell函数
```shell
all:
    @echo $(shell ls -la) # Very ugly because the newlines are gone!
```

**包含 Makefile**
include 指令告诉 make 读取一个或多个其他 makefile。 makefile 中的一行如下所示：
```shell
include filenames...
```

**vpath**
使用 vpath 指定某些先决条件集所在的位置
格式为 vpath \<pattern> <目录，空格/冒号分隔> \<pattern> 可以有一个 %，它匹配任何零个或多个字符。您还可以使用变量 VPATH 全局执行此操作

# 注意：即使 blah.h 不在当前目录中，vpath 也允许找到 blah.h
```shell
vpath %.h ../headers ../other-directory

# Note: vpath allows blah.h to be found even though blah.h is never in the current directory
some_binary: ../headers blah.h
    touch some_binary

../headers:
    mkdir ../headers

# We call the target blah.h instead of ../headers/blah.h, because that's the prereq that some_binary is looking for
# Typically, blah.h would already exist and you wouldn't need this.
blah.h:
    touch ../headers/blah.h
    
clean:
    rm -rf ../headers
    rm -f some_binary
```

实例
```shell
VPATH   += $(SRCDIR)
```

换行
```shell
some_file:
    echo This line is too long, so \
        it is broken up into multiple lines
```

**\.phony**
将 .PHONY 添加到目标将防止 Make 将虚假目标与文件名混淆。
```shell
some_file:
    touch some_file
    touch clean

.PHONY: clean
clean:
    rm -f some_file
    rm -f clean
```

 .delete_on_error
 如果命令返回非零退出状态，make 工具将停止运行规则（并将传播回先决条件）
 如果规则以这种方式失败，DELETE_ON_ERROR 将删除规则的目标。
 所有目标都会发生这种情况，而不仅仅是之前的 PHONY 目标。始终使用它是一个好主意，即使 make 由于历史原因而没有这样做。
```shell
 .DELETE_ON_ERROR:
all: one two

one:
    touch one
    false

two:
    touch two
    false
```

Makefile Cookbook
这个 makefile 的巧妙之处在于它会自动为您确定依赖项。您所要做的就是将 C/C++ 文件放入 src/ 文件夹中。
```shell
# Thanks to Job Vranish (https://spin.atomicobject.com/2016/08/26/makefile-c-projects/)
TARGET_EXEC := final_program

BUILD_DIR := ./build
SRC_DIRS := ./src

# Find all the C and C++ files we want to compile
# Note the single quotes around the * expressions. The shell will incorrectly expand these otherwise, but we want to send the * directly to the find command.
SRCS := $(shell find $(SRC_DIRS) -name '*.cpp' -or -name '*.c' -or -name '*.s')

# Prepends BUILD_DIR and appends .o to every src file
# As an example, ./your_dir/hello.cpp turns into ./build/./your_dir/hello.cpp.o
OBJS := $(SRCS:%=$(BUILD_DIR)/%.o)

# String substitution (suffix version without %).
# As an example, ./build/hello.cpp.o turns into ./build/hello.cpp.d
DEPS := $(OBJS:.o=.d)

# Every folder in ./src will need to be passed to GCC so that it can find header files
INC_DIRS := $(shell find $(SRC_DIRS) -type d)

# Add a prefix to INC_DIRS. So moduleA would become -ImoduleA. GCC understands this -I flag
INC_FLAGS := $(addprefix -I,$(INC_DIRS))

# The -MMD and -MP flags together generate Makefiles for us!
# These files will have .d instead of .o as the output.
CPPFLAGS := $(INC_FLAGS) -MMD -MP

# The final build step.
$(BUILD_DIR)/$(TARGET_EXEC): $(OBJS)
    $(CXX) $(OBJS) -o $@ $(LDFLAGS)

# Build step for C source
$(BUILD_DIR)/%.c.o: %.c
    mkdir -p $(dir $@)
    $(CC) $(CPPFLAGS) $(CFLAGS) -c $< -o $@

# Build step for C++ source
$(BUILD_DIR)/%.cpp.o: %.cpp
    mkdir -p $(dir $@)
    $(CXX) $(CPPFLAGS) $(CXXFLAGS) -c $< -o $@

.PHONY: clean
clean:
    rm -r $(BUILD_DIR)

# Include the .d makefiles. The - at the front suppresses the errors of missing
# Makefiles. Initially, all the .d files will be missing, and we don't want those
# errors to show up.
-include $(DEPS)
```
