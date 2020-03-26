---
layout: post
author: xiaoli
---
# 在家里老旧的笔记本上安装arch Linux(BIOS+MBR)
**参考资料**
https://wiki.archlinux.org/index.php/Installation_guide_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)
https://zhuanlan.zhihu.com/p/60915575
https://www.viseator.com/2017/05/17/arch_install/
https://www.bilibili.com/video/BV11J411a7Tp

**准备工作**
首先准备一个大于8G的U盘,从官网 https://www.archlinux.org/download/ 下载最新版操作镜像,通过软件 https://rufus.ie/ 制作安装盘.将U盘插入需要安装的电脑,启动后进入BIOS,将U盘设置为优先启动.

**修改字体(可选步骤 推荐)**
如果你启动进入命令行控制以后,觉得字体比较小,可以通过以下命令进性设置:
``` setfont /user/share/kbd/consolefonts/LatGrkCyr-12x12.psfu.gz ```

**修改键位布局(可选步骤)**
如果你习惯了常规键位,此步骤可以跳过.
修改键位交换Esc和Caps_Lock方法如下:
首先编辑一个键位配置文件(名字自选) ``` vim keys.conf ```
编辑内容:

```
keycode 1 = Caps_Lock
keycode 58 = Escape
```
然后键入 ``` loadkeys keys.conf ```是之生效.

**设置网络链接** (PS:如果是直接插入网线,可以直接跳到**动态分配IP地址**)
键入 ``` ip link ``` 查看你当前电脑的网络硬件.
一般会看到有一个 wlan0 的无线网卡.
键入 ``` ip link set wlan0 up ``` 开启无线网卡.
再次键入 ``` ip link ``` 查看该无线网卡是否开启,如果开启会显示 **UP**.
键入 ``` iwlist wlan0 scan | grep ESSID ``` 搜索周围的WiFi网络.

**生成已知网络的配置文件**
键入 ``` wpa_passphrase WIFI_NAME PASSWD > FILE_NAME ```

**连接网络**
键入``` wpa_supplicant -c FILE_NAME -i wlan0 &```通过后台运行连接想要链接的WiFi.

**动态分配IP地址**
键入``` dhcpcd & ```

**同步电脑时间**
键入 ``` timedatectl set-ntp true ```

**查看自己电脑的系统引导方式**
```ls /sys/firmware/efi/efivars```
如果返回
```
ls:cannot access '/sys/firmware/efi/efivars': No such file or firectory 
```
说明你的电脑是以BIOS方式进性引导的,否则就是以UEFI方式引导的.

**查看电脑硬盘信息**
键入 ``` fdisk -l  ```

**硬盘分区**
键入 ``` fdisk /dev/sda ``` 进入对该硬盘的分区控制操作.
进入 fdisk 控制后命令之后, 键入```m```获取帮助信息.
键入``` p``` 查看硬盘当前的分区情况
键入 ```g ```删除硬盘所有分区(这里是按照一个完全的新硬盘操作的,如果已经有分区,可以视情况操作此步骤)

**创建一个全新的MBR分区表(这步非常重要)**
键入```o```创建新的空DOS分区MBR.

```
Command (m for help): o
Created a new DOS disklabel with disk xxx 0x5b5b1a91
```

**创建主分区**
键入 ```n```开始分区
```
Command (m for help): n
Partition type
    p primary (0 primary, 0 extended, 4 free)
    e extended (container for xxx)
Select (default p): 回车默认

Using default response p.
Partition number (1-4, def 1): 默认回车
First sector （xxx-xxx, def 2048）: 默认
Last sector, +/-sectors or +size{K,M,G,T,P} (xxx def 62914559): 默认
```

键入```w```保存分区设置.

**制作文件系统(给硬盘分区指定格式)**
键入 ```mkfs.ext4 /dev/sd1```

**配置pacman源**

```bash
vim /etc/pacman.conf #编辑此文件
/Color #查找此Option,删除行首的'#'号,保存退出.
vim /etc/pacman.d/mirrorlist #编辑此文件,修改pacman的源.
/China #查找所有总过的源服务器,并剪切到文件头部,目的是为了优先使用这些源,保存退出.
```
**安装系统**
键入``` mount /dev/sda1 /mnt ```挂在目标硬盘的主分区(其实就是```/```)到当前U盘live系统下..
键入``` pacstrap /mnt base linux linux-firmware```安装,基础软件,内核,linux框架.
键入``` genfstab -U /mnt >> /mnt/etc/fstab```生成fstab文件(文件系统的静态信息的文件).
键入``` arch-chroot /mnt ``` 进入到硬盘上的系统.
键入``` ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime  ```修改时区.
键入 ``` hwclock --systohc  ```同步系统时间.

```bash
exit #回到USB live系统.

vim /mnt/etc/locale.gen #编辑本地化生成文件.
/en_US #查找并使能该option

arch-chroot /mnt #切换到硬盘系统.

locale-gen #生成本地化配置

exit #回到USB live系统.

vim /mnt/etc/locale.conf #编辑本地化配置文件
LANG=en_US.UTF-8

vim /mnt/etc/vconsole.conf #编辑硬盘系统上的键位修改配置文件(可选步骤)
keycode 1 = Caps_Lock
keycode 58 = Escape

vim /mnt/etc/hostname 
xiaoli

vim /mnt/etc/hosts
127.0.0.1	localhost
::1       	localhost
127.0.0.1	xiaoli.localdomain	xiaoli

arch-chroot /mnt #切换到硬盘系统.

passwd #设置root密码.

#安装Bootloader(系统引导)
pacman -S grub intel-ucode os-prober #grub引导软件 intel-ucode是CPU驱动 os-probe多系统查找工具.
grub-install --target=i386-pc /dev/sda #注意这里是/dev/sda指定的是硬盘不是分区.
grub-mkconfig -o /boot/grub/grub.cfg

pacman -S neovim vi zsh wpa_supplicant dhcpcd #安装一些必备的软件

exit #回到USB live系统.

killall wpa_supplicant dhcpcd #停止后台运行的程序

umount -R /mnt #不再挂载硬盘

reboot #重启电脑

```
拔下U盘等待电脑启动,如果看到```grub```就算成功了.
