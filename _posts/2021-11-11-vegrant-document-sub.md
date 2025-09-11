---
layout: default
title: "Vagrant Document Sub"
date: 2021-11-11 12:00:00 +0800
categories: [Vagrant]
tags: [vagrant, document]
---

# Vagrant Document Sub
参考:
https://www.vagrantup.com/docs/vagrantfile

## Vagrantfile
### 文件默认寻址路径
```bash
# If you run vagrant in path "/home/mitchellh/projects/foo"
# , lookup path is like blow
/home/mitchellh/projects/foo/Vagrantfile
/home/mitchellh/projects/Vagrantfile
/home/mitchellh/Vagrantfile
/home/Vagrantfile
/Vagrantfile
```
可以通过将 VAGRANT_CWD 环境变量设置为其他路径来更改 Vagrant 查找 Vagrantfile 的起始目录。

### 加载顺序和合并
Vagrant 这里和Docker类似,都是多层次,向上集成合并的形式.
在每个 Vagrantfile 中，可以指定多个 Vagrant.configure 块。
所有配置都将按照定义的顺序合并到一个 Vagrantfile 中。

### 配置使用的Vagrant的版本
```ruby
Vagrant.configure("2") do |config|
  # ...
end
```

### 版本要求
```ruby
Vagrant.require_version ">= 1.3.5"
Vagrant.require_version ">= 1.3.5", "< 1.4.0"
```

### 循环定义多台虚拟机
**注意是ruby语法**
```ruby
(1..3).each do |i|
  config.vm.define "node-#{i}" do |node|
    node.vm.provision "shell",
      inline: "echo hello from node #{i}"
  end
end
```

### 在 ssh 会话中覆盖主机语言环境
```ruby
ENV["LC_ALL"] = "en_US.UTF-8"

Vagrant.configure("2") do |config|
  # ...
end
```

### config.*
config.vm 中的设置修改了 Vagrant 管理的机器的配置。

参考:
https://www.vagrantup.com/docs/vagrantfile/machine_settings
https://www.vagrantup.com/docs/vagrantfile/ssh_settings
https://www.vagrantup.com/docs/vagrantfile/winrm_settings
https://www.vagrantup.com/docs/vagrantfile/winssh_settings
https://www.vagrantup.com/docs/vagrantfile/vagrant_settings

* config.vagrant : config.vagrant 中的设置修改了 Vagrant 本身的行为。
1. config.vagrant.host
2. config.vagrant.plugs
3. config.vagrant.sensitive

### 创建一个Box

一个基础Box通常只包含一组用于 Vagrant 运行的最少软件。

* Package manageer
* SSH
* SSH user so Vagrant can conect
* Perhap Chef, Puppet (Optional)

基础Box
参考:https://www.vagrantup.com/docs/boxes/base

Docker Base Boxes

Hyper-V Base Boxes

VMware Base Boxes

VirtualBox Base Boxes
强烈建议使用 Packer 为基础Box创建可重现的构建，以及自动化构建。

Box还应该包含对如下信息的描述
* 磁盘空间
* 内存大小
* 外设(可选)
* 默认用户信息
* vagrant 用户(用户SSH登录的)
* Root Password: "vagrant"
* 无密码sudo
等等

设置好以上信息好还需要如下步骤
* 打包Box
* 分发Box
* 测试Box

## Provisioning

Vagrant 中的 Provisioners 允许您在机器上自动安装软件、更改配置等，作为 vagrant up 过程的一部分。

### 基础使用

#### Options
* name : provisioner的名字
* type : 要配置的类型
* before 
* after
* communicator_required

#### 配置

首先，使用 config.vm.provision 方法调用在 Vagrantfile 中配置每个provisioner 。
例如:
```ruby
Vagrant.configure("2") do |config|
  # ... other configuration

  config.vm.provision "shell", inline: "echo hello"
end
```

每个provisioner都有一个类型，例如“shell”，用作provision配置的第一个参数。接下来是配置该特定provisioner的基本**键/值**。

也可以用更易读的语法

```ruby
Vagrant.configure("2") do |config|
  # ... other configuration

  config.vm.provision "shell" do |s|
    s.inline = "echo hello"
  end
end
```

provisioner在1.7.0版本之后是可以命名的
```ruby
Vagrant.configure("2") do |config|
  # ... other configuration

  config.vm.provision "bootstrap", type: "shell" do |s|
    s.inline = "echo hello"
  end
end
```
#### 运行中的provisioner

Provisioners 在三种情况下运行：初始 vagrant up、vagrant provision 和 vagrant reload --provision。

不想运行配置程序，可以将 --no-provision 标志传递给 up 并重新加载。同样，您可以通过 --provision 来强制配置

#### Run Once, Always or Never
默认情况下，provisioners 只运行一次，在自上次 vagrant 销毁以来的第一次 vagrant up 期间，除非设置了 --provision 标志，如上所述。
```ruby
Vagrant.configure("2") do |config|
  config.vm.provision "shell", inline: "echo hello",
    run: "always"
end
```

#### 多个Provisioners
```ruby
Vagrant.configure("2") do |config|
  config.vm.provision "shell", inline: "echo foo"

  config.vm.define "web" do |web|
    web.vm.provision "shell", inline: "echo bar"
  end

  config.vm.provision "shell", inline: "echo baz"
end
```

#### 覆盖 Provisioner 设置

要覆盖设置，您必须为您的Provisioner分配一个名称。
```ruby
Vagrant.configure("2") do |config|
  config.vm.provision "foo", type: "shell",
    inline: "echo foo"

  config.vm.define "web" do |web|
    web.vm.provision "foo", type: "shell",
      inline: "echo bar"
  end
end
```
在上面，只有“bar”会被回显，因为内联设置使外部provisioner被覆盖

### File Provisioner
Vagrant 文件配置器允许您将文件或目录从主机上传到来宾机器。
文件配置是一种简单的方法，例如，将您的本地 ~/.gitconfig 复制到来宾计算机上的 vagrant 用户的主目录，这样您就不必在每次配置新 VM 时运行 git config --global。
```ruby
Vagrant.configure("2") do |config|
  # ... other configuration

  config.vm.provision "file", source: "~/.gitconfig", destination: ".gitconfig"
end
```

```ruby
Vagrant.configure("2") do |config|
  # ... other configuration

  config.vm.provision "file", source: "~/path/to/host/folder", destination: "$HOME/remote/newfolder"
end
```
**注意，与同步文件夹不同，上传的文件或目录不会保持同步。**

### Shell
File是上传文件,Shell就是执行一段脚本

#### inline (string) - 指定要在远程机器上执行的内联 shell 命令
```ruby
Vagrant.configure("2") do |config|
  config.vm.provision "shell",
    inline: "echo Hello, World"
end
```
```ruby
$script = <<-'SCRIPT'
echo "These are my \"quotes\"! I am provisioning my guest."
date > /etc/vagrant_provisioned_at
SCRIPT

Vagrant.configure("2") do |config|
  config.vm.provision "shell", inline: $script
end
```

####  path (string) - 要上传和执行的 shell 脚本的路径。
```ruby
Vagrant.configure("2") do |config|
  config.vm.provision "shell", path: "script.sh"
end
```

#### 脚本参数
参数数组
```ruby
Vagrant.configure("2") do |config|
  config.vm.provision "shell" do |s|
    s.inline = "echo $1"
    s.args   = ["hello, world!"]
  end
end
```

## Networking
虚拟机常见的几种网络设置
* NAT
* 桥接
* host

### 基础使用

#### 端口映射
```ruby
Vagrant.configure("2") do |config|
  # ...
  config.vm.network "forwarded_port", guest: 80, host: 8080
end
```
#### 多个网络(网口)

可以通过在 Vagrantfile 中调用多个 config.vm.network 来定义多个网络

#### 设置Hostname
```ruby
Vagrant.configure("2") do |config|
  # ...
  config.vm.hostname = "myhost.local"
end
```
将条目 127.0.X.1 myhost myhost.local 添加到 /etc/hosts。

```ruby
Vagrant.configure("2") do |config|
  # ...
  config.vm.hostname = "myhost.local"
  config.vm.network "public_network", ip: "192.168.0.1", hostname: true
  config.vm.network "public_network", ip: "192.168.0.2"
end
```

#### DHCP
```ruby
Vagrant.configure("2") do |config|
  config.vm.network "private_network", type: "dhcp"
end
```
```ruby
Vagrant.configure("2") do |config|
  config.vm.network "public_network"
end
```

#### 静态IP
```ruby
Vagrant.configure("2") do |config|
  config.vm.network "private_network", ip: "192.168.50.4"
end
```
```ruby
config.vm.network "public_network", ip: "192.168.0.17"
```

#### 默认网络接口
```ruby
config.vm.network "public_network", bridge: "en1: Wi-Fi (AirPort)"
#注意 这里是桥接
```

#### 默认路由
```ruby
Vagrant.configure("2") do |config|
  config.vm.network "public_network", ip: "192.168.0.17"

  # default router
  config.vm.provision "shell",
    run: "always",
    inline: "route add default gw 192.168.0.1"

  # default router ipv6
  config.vm.provision "shell",
    run: "always",
    inline: "route -A inet6 add default gw fc00::1 eth1"

  # delete default gw on eth0
  config.vm.provision "shell",
    run: "always",
    inline: "eval `route -n | awk '{ if ($8 ==\"eth0\" && $2 != \"0.0.0.0\") print \"route del default gw \" $2; }'`"
end
```

## 同步文件夹
### 基础使用
#### 使能
```ruby
config.vm.synced_folder ".", "/vagrant", disabled: true
```

#### 修改Onwer/Group
```ruby
config.vm.synced_folder "src/", "/srv/website",
  owner: "root", group: "root"
```

### NFS(性能占用少)
#### 启用NFS
```ruby
Vagrant.configure("2") do |config|
  config.vm.synced_folder ".", "/vagrant", type: "nfs"
end
```

### Samba
参考:
https://www.vagrantup.com/docs/synced-folders/smb

## 硬盘
### 基础使用
#### 调整主磁盘的大小
```ruby
Vagrant.configure("2") do |config|
  config.vm.define "hashicorp" do |h|
    h.vm.box = "hashicorp/bionic64"
    h.vm.provider :virtualbox

    h.vm.disk :disk, size: "100GB", primary: true
  end
end
```

#### 添加除默认硬盘,以外新的硬盘
```ruby
Vagrant.configure("2") do |config|
  config.vm.define "hashicorp" do |h|
    h.vm.box = "hashicorp/bionic64"
    h.vm.provider :virtualbox

    (0..3).each do |i|
      h.vm.disk :disk, size: "5GB", name: "disk-#{i}"
    end
  end
end
```

## 其他
### 环境变量
参考:
https://www.vagrantup.com/docs/other/environmental-variables

## GUI
参考:
https://stackoverflow.com/questions/20227140/can-i-bring-up-the-gui-for-a-vagrant-managed-virtual-box-while-the-box-is-runnin
https://www.vagrantup.com/docs/providers/virtualbox/configuration
```ruby
config.vm.provider "virtualbox" do |v|
  v.gui = true
end
```
