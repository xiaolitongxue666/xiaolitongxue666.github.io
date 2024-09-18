# Clion remote development

参考:

[Remote Development with Clion](https://www.youtube.com/watch?v=g1zPcja3zAU&t=4s)

[Remote development](https://www.jetbrains.com/help/clion/remote-development.html)

[Clion远程调试](https://blog.csdn.net/qq_43003442/article/details/114003799)

[基于CLion和gdbserver实现远程调试c程序](http://threelambda.com/2020/09/08/remote-debug-with-clion/)

IDEA系列软件,使用相同的架构,在我们开发的过程中,项目可以被分为以下四个组件

![image](https://user-images.githubusercontent.com/35646108/146504494-838157ed-e363-46f0-a840-84ff2f71fd11.png)


* **源代码** - Source code(编码)
* **编译工具** - Tools chain(编译)
* **可执行文件** - Binaries(部署)
* **调试符号** - Debug symbols(调试)) 

**可以在windows进行编码,然后同步代码到Ubuntu进行交叉编译,再将编译出的可执行文件下载到开发板,通过gdbserver运行进行调试**

## 开发环境的不同模式:

### 本地开发
* 本地编码编译调试执行 
 [编码(Local)]
 [编译(Local)]
 [调试(Local)]
 [部署(Local)]
 
![image](https://user-images.githubusercontent.com/35646108/146504616-d2c5b5ab-d785-424f-b4a2-d704830b7f4e.png)

### 远程开发
#### 场景讲解

* 直接将本地编译好的二进制文件,拷贝到部署设备,直接运行

![image](https://user-images.githubusercontent.com/35646108/146504726-0bb96491-aeba-4553-81a8-015d3168d936.png)

* 不仅仅满足于直接部署在远程设备运行,还希望能在部署设备上进行调试,将代码,可执行文件,和调试符号同步到部署设备

![image](https://user-images.githubusercontent.com/35646108/146504876-a858e08f-9f9f-429c-a20e-3d665b95168b.png)
这里可以看到,会有许多同步工作需要做,为了避免错误,可以使用工具async和SCP来进行,Clion也提供同步的功能.

为了让远程开发,更加自动化简单化,Clion提供了两种远程Debug模式
1. Remote Debug
2. Remote GDB Server

![image](https://user-images.githubusercontent.com/35646108/146505024-f68b1fc3-b9fa-4354-9b2d-3594a46ddbc6.png)

Clion还提供了组件可以通过网络通信的方式,使用远程的gdb server来进行调试

* 同步来同步去感觉还是显得麻烦,还可以直接通过ssh访问部署设备进行开发

![image](https://user-images.githubusercontent.com/35646108/146505136-77b253db-1d9b-412a-aa59-a9d7dfb46d87.png)

此时本地设备只有源代码,更像是一个单纯的代码编辑器,部署设备上有源代码,编译工具,可执行代码,和调试符号.

**小结**

* 如果部署机器性能比较差,例如树莓派等嵌入式设备,就可以在本地设备进行开发,然后交叉编译产生部署设备平台的可执行文件,然后同步相关组件到部署设备,进行调试.
* 反之,可以在本地,只针对源代码进行编码工作,然后同步到部署设备,在部署设备进行编译生成可执行文件,然后调试.

**主要区别技术在哪里执行编译这个比较消耗资源的操作.**

## Remote development

**全局设置**
windowns下idea修改配置

![image](https://user-images.githubusercontent.com/35646108/146505296-996bd29a-eb55-4dd7-afc1-d3f9e1c87e56.png)

![image](https://user-images.githubusercontent.com/35646108/146505342-769d2a42-b46e-485e-8dad-4fc07dd34091.png)

### Full remote mode

* **Local machine** : Windows
* **Remote machine** : Ubuntu
* **Clion path** : Local
* **Source code path** : Local, automatic synchronization to remote host(FTP/SFTP)
* **Compiler tools** : CMake/Makefile
* **Compiler path** : Any platform can compiler target bin
* **GDB client path** : Local
* **GDB server path** : Remote
* **Run bin path** : Remote

全远程模式,主要是通过SSH连接到目标设备进行开发

**常规流程**
1. 代码保存在本地设备,通过同步工具,同步到目标设备
2. Clion调用远端编译工具,编译可执行文件
3. Clion调用远端gdb,执行调试

#### Full remote mode demo

##### 添加配置ToolChain

**目标** : 为了调用远程编译工具编译远程平台的可执行文件
**注意** : 如果需要root登录需要修改server的ssh配置
参考: [Ubuntu 20.04 配置ssh可以用root登录](https://www.cnblogs.com/xlizi/p/13553060.html)

![image](https://user-images.githubusercontent.com/35646108/146505483-459ea07d-91d6-4060-a062-dacc67ce9aa6.png)

![image](https://user-images.githubusercontent.com/35646108/146505523-5bc65891-bd84-474f-9f62-ef928bd3c5c6.png)

![image](https://user-images.githubusercontent.com/35646108/146505559-a7798d6e-03bc-405e-9e07-f56c30060528.png)

#### 创建相应的CMake配置文件
因为在上步骤将新建的Remote ToolsChain设置为默认了
这里就会自动连接到远端设备的Cmake/Make

如果没有设置默认ToolsChains
就需要手动设置配置一下Cmake
[CMakeProfile](https://www.jetbrains.com/help/clion/cmake-profile.html)
**注意: 这里其实就是选择用哪里的什么编译器来编译当前的代码**

#### 在 Makefile 设置中选择远程工具链
因为在上步骤将新建的Remote ToolsChain设置为默认了
这里就会自动连接到远端设备的Cmake/Make

![image](https://user-images.githubusercontent.com/35646108/146505650-11d26034-e98a-4763-a7f2-84e1f657d894.png)

#### 检查和验证部署配置

![image](https://user-images.githubusercontent.com/35646108/146505705-eb176b13-e349-48f0-a0a3-f72daa37f1c1.png)

![image](https://user-images.githubusercontent.com/35646108/146505729-5089d1d3-0ffe-40b4-b7e7-90e6ffb573d6.png)

#### 排除路径
默认情况下，CLion 会索引并同步 CMakeLists.txt 中列出的所有目录。 但是，如果您使用将目录标记为 | 来排除目录。 排除动作，远程部署会被标记为排除路径，不会与远程机器同步。 当您在配置远程工具链之前排除文件夹时，会自动执行此操作。

您可以在部署条目设置的专用选项卡中检查和调整排除的路径
按需进行设置

![image](https://user-images.githubusercontent.com/35646108/146508509-fb1f1992-9305-4b9a-91dd-bf4e48ca250c.png)

#### Resync头文件搜索路径
Clion 会将目标平台用到的所有头文件,包括标准库的头文件都同步到本地
CLion 仅在初始文件传输时自动执行。 之后，它不会由 CMake 或 Makefile 重新加载触发。 因此，每次切换编译器或更改项目依赖项时，请确保通过调用 Tools | 手动更新头搜索路径。 与远程主机重新同步
**注意 : 自动同步即可**

#### 编译,运行,调试
#####  CMake
在选择远程ToolChains后
执行编译

![image](https://user-images.githubusercontent.com/35646108/146508106-35238e5d-135d-45b1-8f3d-942968c3479e.png)

会看到选择的是远端设备的Cmke进行编译的执行运行

##### Makefile
[makefiles-support](https://www.jetbrains.com/help/clion/makefiles-support.html)

添加Makefile配置

Run -> Edit Configurations ...

![image](https://user-images.githubusercontent.com/35646108/146506134-a9bdaf32-175c-4929-aa64-cce583c5126a.png)

![image](https://user-images.githubusercontent.com/35646108/146506192-9edd0a58-8011-451d-9599-7caec5cc8622.png)

回到Clion设置断点调试

![image](https://user-images.githubusercontent.com/35646108/146508947-c052f354-a4b5-4e93-96e3-26ec88ac10bc.png)

成功~!

### Remote debug via gdbserver/lldb-server

通过gdbserver/lldb-server远程调试在如下场景特别有用:
* 目标设备搭建较为花销资源和成本
* 目标设备没有条件搭建

在目标设备上,通过server命令运行可执行文件(注意:编译可执行文件的时候必须带有完整的调试信息)

Clion 提供了两种远程调试模式:
* Remote GDB Server(只支持GDB) : 
    -> CMake
    -> 自动编译和上传可执行文件到目标设备
    -> 自动执行gdbserver
    
**注意: 如果想在本机编辑非本机平台可执行文件,需要配置修改ToolsChain**

* Remote Debug(支持GDB和LLDB) :
    -> 如果已经有了可执行文件和符号文件,**不要CLion进行编译**。此配置独立于特定的构建系统或项目格式
    -> 需要手动同步文件并在 gdbserver/lldb-server 下启动您的程序
    
**注意: 上述情况,可以理解为,Clion作为代码编辑器和gdb client 调试工具, 编译工作并不是Clion来执行**    

#### Remote GDB Server
* **Local machine** : Windows
* **Remote machine** : Ubuntu
* **Clion path** : Local
* **Source code path** : Local
* **Compiler path** : Local
* **GDB client path** : Local
* **GDB server path** : Remote
* **Run bin path** : Remote

**常规流程**
1. 在本地编辑代码
2. 在本地编译代码
3. 上传可执行文件到远端
4. 远端执行gdbserver
5. 本地Clion gdb client 调试

##### Remote GDB Server Demo
[remote-gdb-server](https://www.jetbrains.com/help/clion/remote-gdb-server.html)

**注意 : 感觉这种远程方式应用场景较少,不做详细测试了**

#### Remote Debug
* **Local machine** : Windows
* **Remote machine** : Ubuntu
* **Clion path** : Local
* **Source code path** : Local, automatic synchronization to remote host
* **Compiler path** : Any platform can compiler target bin
* **GDB client path** : Local
* **GDB server path** : Remote
* **Run bin path** : Remote

**常规流程**:

1. 准备好正确编译的带调试信息的可执行文件(以下均称为可执行文件),需要注意编译平台,目标平台可能和Clion的工作平台并不一致
2. 目标设备上有可执行文件,本地设备上同步的相同的可执行文件(同步机制下一节讲解)
3. Clion创建一个Remote Debug的调试配置,指定好可执行文件(主要目的是为了调试信息),在Clion设置断点等.
4. 在目标设备上通过gdbserver/lldb-server运行可执行文件
5. 返回本地设备的Clion设置断点进行调试

##### Remote Debug Demo

* 构建一个简单地CMake & C++项目

参考: [Cmake&C++ Demo](http://derekmolloy.ie/hello-world-introductions-to-cmake)

![image](https://user-images.githubusercontent.com/35646108/146509371-5dce420b-76ee-42f6-9034-2086787b820c.png)

* 代码同步

![image](https://user-images.githubusercontent.com/35646108/146506704-a642438c-c7fc-43c6-843d-9dc151e050f3.png)

![image](https://user-images.githubusercontent.com/35646108/146506747-3f70887d-5539-419a-b726-455334a88e7e.png)

设置上传/下载/自动同步,按需操作

![image](https://user-images.githubusercontent.com/35646108/146506828-8660ecaa-1711-4301-93ee-19b585563012.png)

* 在目标设备上编译带调试信息的可执行文件

![image](https://user-images.githubusercontent.com/35646108/146506949-e96e6e91-20ea-42d5-b737-5103d90027ce.png)

![image](https://user-images.githubusercontent.com/35646108/146507110-faad136e-05d0-437c-a75a-2b867dafcbed.png)

* 配置远程调试
确认目标设备编译的可执行文件同步回到本地设备

![image](https://user-images.githubusercontent.com/35646108/146507214-4f36e68e-3c08-467a-8692-1c4259abd31a.png)

* 返回本地设备的Clion点击右上角编辑调试配置

![image](https://user-images.githubusercontent.com/35646108/146507334-0aa35f57-5714-4259-a02e-1c2728c13516.png)

目标是要在目标设备上运行此段代码并进行调试

* 设置Debug配置
点击左上角的 + 号
选择Remote Debug
具体配置如下
![image](https://user-images.githubusercontent.com/35646108/146507531-7d2b8c5d-898f-46fb-81e1-68d6f91862b0.png)

然后在目标设备上运行gdbserver

```bash
root@leonli-System-Product-Name:/home/sftp/<path>/build# gdbserver localhost:8080 ./<bin_file>
Process ./<bin_file> created; pid = 501801
Listening on port 8080
```

Clion上设置断点并点击调试

![image](https://user-images.githubusercontent.com/35646108/146507732-26c7be4c-b4d9-47d1-b463-82d1c1e71756.png)


成功~!

















