---
layout: default
author: xiaoli
---
# 在archlinux上安装dwm

**强制更新系统**
```pacman -Syyu```

**安装软件**
```pacman -S man```
```pacman -S base-devel````

**添加用户**
刚装完archlinux的时候,应该只有一个root用户.
```useradd -m -G wheel xiaoli #添加组 添加家目录``` 
```passwd xiaoli``
```visudo```
```%wheel ALL=(ALL) ALL```

**安装图形界面**
```
pacman -S xorg xorg-server xorg-init
#cd in each dir, and run 'make' 'make 
git clone git://git.suckless.org/dwm install' 
git clone git://git.suckless.org/st
git clone git://git.suckless.org/dmenu
```

**设置X11启动**
```
nvim /etc/X11/xinit/xinitrc

exec dwm

#twm&
#xclock-geometry 50x50-1_1 &
...
```

**命令行启动**
```startx```

**dwm下怎么打开终端**
```
[Shift]+[Alt]+[Enter] - launch terminal
[Alt]+[p] - dmenu for running programs like the x-www-browser
```


