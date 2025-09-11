---
layout: default
title: "Vagrant quick start"
date: 2021-11-11 12:00:00 +0800
categories: [Vagrant]
tags: [vagrant, quick-start]
---

# Vagrant quick start

参考 
https://learn.hashicorp.com/tutorials/vagrant/getting-started-index?in=vagrant/getting-started
https://www.vagrantup.com/docs/index

## 安装VirtualBox 和 Vagrant

VirutalBox : https://www.virtualbox.org/
Vagrant : https://www.vagrantup.com/docs/installation

## 快速开始

### 初始化Vagrant

```bash
vagrant init hashicorp/bionic64

Vagrant failed to initialize at a very early stage:

The version of powershell currently installed on this host is less than
the required minimum version. Please upgrade the installed version of
powershell to the minimum required version and run the command again.

  Installed version: N/A
  Minimum required version: 3
```
解决办法:
https://stackoverflow.com/questions/58122639/vagrant-error-the-version-of-powershell-on-this-host-is-less-than-required
https://stackoverflow.com/questions/19902239/how-to-upgrade-powershell-version-from-2-0-to-3-0

```bash
vagrant init hashicorp/bionic64

A `Vagrantfile` has been placed in this directory. You are now
ready to `vagrant up` your first virtual environment! Please read
the comments in the Vagrantfile as well as documentation on
`vagrantup.com` for more information on using Vagrant.

Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-a----        2021/11/8     16:19           3094 Vagrantfile
```

### 启动虚拟机

```bash
vagrant up

Bringing machine 'default' up with 'virtualbox' provider...
==> default: Box 'hashicorp/bionic64' could not be found. Attempting to find and install...
    default: Box Provider: virtualbox
    default: Box Version: >= 0
==> default: Loading metadata for box 'hashicorp/bionic64'
    default: URL: https://vagrantcloud.com/hashicorp/bionic64
==> default: Adding box 'hashicorp/bionic64' (v1.0.282) for provider: virtualbox
    default: Downloading: https://vagrantcloud.com/hashicorp/boxes/bionic64/versions/1.0.282/providers/virtualbox.box
==> default: Box download is resuming from prior download progress
    default:
==> default: Successfully added box 'hashicorp/bionic64' (v1.0.282) for 'virtualbox'!
==> default: Importing base box 'hashicorp/bionic64'...
==> default: Matching MAC address for NAT networking...
==> default: Checking if box 'hashicorp/bionic64' version '1.0.282' is up to date...
==> default: Setting the name of the VM: vagrant_quick_start_default_1636360032542_91493
==> default: Clearing any previously set network interfaces...
==> default: Preparing network interfaces based on configuration...
    default: Adapter 1: nat
==> default: Forwarding ports...
    default: 22 (guest) => 2222 (host) (adapter 1)
==> default: Booting VM...
==> default: Waiting for machine to boot. This may take a few minutes...
    default: SSH address: 127.0.0.1:2222
    default: SSH username: vagrant
    default: SSH auth method: private key
    default: Warning: Connection reset. Retrying...
    default: Warning: Remote connection disconnect. Retrying...
    default: Warning: Connection aborted. Retrying...
    default: Warning: Connection reset. Retrying...
    default: Warning: Connection aborted. Retrying...
    default:
    default: Vagrant insecure key detected. Vagrant will automatically replace
    default: this with a newly generated keypair for better security.
    default:
    default: Inserting generated public key within guest...
    default: Removing insecure key from the guest if it's present...
    default: Key inserted! Disconnecting and reconnecting using new SSH key...
==> default: Machine booted and ready!
==> default: Checking for guest additions in VM...
    default: The guest additions on this VM do not match the installed version of
    default: VirtualBox! In most cases this is fine, but in rare cases it can
    default: prevent things such as shared folders from working properly. If you see
    default: shared folder errors, please make sure the guest additions within the
    default: virtual machine match the version of VirtualBox you have installed on
    default: your host and reload your VM.
    default:
    default: Guest Additions Version: 6.0.10
    default: VirtualBox Version: 6.1
==> default: Mounting shared folders...
    default: /vagrant => D:/my_code/vagrant/vagrant_dev_enviroment/vagrant_quick_start
```

如果启动成功,此时打开VirtualBox就会看到运行起来的虚拟机

### 登录虚拟机
```bash
vagrant ssh

Welcome to Ubuntu 18.04.3 LTS (GNU/Linux 4.15.0-58-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Mon Nov  8 08:36:40 UTC 2021

  System load:  0.08              Processes:           88
  Usage of /:   2.5% of 61.80GB   Users logged in:     0
  Memory usage: 11%               IP address for eth0: 10.0.2.15
  Swap usage:   0%

 * Super-optimized for small spaces - read how we shrank the memory
   footprint of MicroK8s to make it the smallest full K8s around.

   https://ubuntu.com/blog/microk8s-memory-optimisation

0 packages can be updated.
0 updates are security updates.


vagrant@vagrant:~$
```

### 退出虚拟机
```bash
logout

Connection to 127.0.0.1 closed.
```

### 销毁虚拟机
```bash
vagrant destory

    default: Are you sure you want to destroy the 'default' VM? [y/N]
==> default: Forcing shutdown of VM...
==> default: Destroying VM and associated drives...
```

* * *

### 初始化一个项目目录

### 创建好一个项目目录,并进入目录
```bash
mkdir vagrant_getting_started 
cd vagrant_getting_started
```

### 初始化目录
```bash
vagrant init <box_name>
```
初始化成功会生成一个Vagrantfile描述文件

### 单独安装Box但是并不创建Vagrantfile
可以理解为,单独下载好Box,多个虚拟机都可以调用
Vagrant 会提示你选择一个提供者。键入 2 并按 Enter 以选择 Virtualbox。
```bash
vagrant box add hashicorp/bionic64
```
**hashicorp/bionic64** 分别是 **用户名/box名**
add 后也可以添加Box的URL或者本地文件路径

### 使用Box
编辑修改Vagrantfile
```bash
Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/bionic64"
end

Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/bionic64"
  config.vm.box_version = "1.0.282"
end

Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/bionic64"
  config.vm.box_url = "https://vagrantcloud.com/hashicorp/bionic64"
end
```

### 删除Box
```bash
vagrant box list

hashicorp/bionic64 (virtualbox, 1.0.282)

vagrant box remove hashicorp/bionic64

Removing box 'hashicorp/bionic64' (v1.0.282) with provider 'virtualbox'...
```

### 同步虚拟机和宿主机的文件夹
默认情况下，Vagrant 将您的项目目录（包含 Vagrantfile 的目录）共享到您的客户机中的 /vagrant 目录。
```bash
ls /vagrant

Vagrantfile
```

### 配置虚拟机
在虚拟机中配置一个简单地web服务器
```bash
mkdir html
```

```html
<!DOCTYPE html>
<html>
  <body>
    <h1>Getting started with Vagrant!</h1>
  </body>
</html>
```

```bash
#!/usr/bin/env bash

apt-get update
apt-get install -y apache2
if ! [ -L /var/www ]; then
  rm -rf /var/www
  ln -fs /vagrant /var/www
fi
```

### 配置Vagrantfile
配置启动运行脚本
```bash
Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/bionic64"
  config.vm.provision :shell, path: "bootstrap.sh"
end
```
**注意: 文件路径相对于项目根目录的位置（Vagrantfile 所在的位置）。**

### 配置网络端口转发
达到访问host的port 110 就相当于 访问虚拟机的 120的效果
```bash
Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/bionic64"
  config.vm.provision :shell, path: "bootstrap.sh"
  config.vm.network :forwarded_port, guest: 80, host: 4567
end
```

### Vagrant 共享环境
Vagrant Share是一个插件，可以让你分享你的Vagrant环境到世界各地的任何人与互联网连接。它会给你一个URL，可以从世界上任何连接到互联网的设备直接路由到你的Vagrant环境。

简而言之,有点像给虚拟机设置了一个域名

安装插件
```bash
vagrant plugin install vagrant-share

Installing the 'vagrant-share' plugin. This can take a few minutes...
Fetching vagrant-share-1.1.10.gem
nstalled the plugin 'vagrant-share (1.1.10)'!
```
启动共享
```bash
vagrant share

##... output truncated ...
==> default: Creating Vagrant Share session...
==> default: HTTP URL: http://b1fb1f3f.ngrok.io
##... output truncated ...
```

关闭共享
```bash
$ ^C
==> default: Halting Vagrant share!
```

### 虚拟机控制

* 暂停虚拟机: vagrant suspend
* 恢复虚拟机: vagrant up
* 停止虚拟机: vagrant halt
* 删除虚拟机: vagrant destory
* 快照 vagrant snapshot



