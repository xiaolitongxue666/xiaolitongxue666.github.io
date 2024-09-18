---
layout: default
title:  "在CentOs Stream容器中安装使用OpenResty"
date:   2021-05-26 12:59:04 +0800
categories: 
---

# 在CentOs Stream容器中安装使用OpenResty
#docker #openresty #centos

[Docker Hub](https://hub.docker.com/r/tgagor/centos-stream)
[通过 dnf 在 CentOS 8 上安装 OpenResty_哔哩哔哩 (゜-゜)つロ 干杯~-bilibili](https://www.bilibili.com/video/BV1aZ4y1G73x)
https://www.cnblogs.com/infoo/p/11900607.html
[在 CentOS 8 上通过 dnf 安装 OpenResty - OpenResty 官方博客](https://blog.openresty.com.cn/cn/centos8-or-install/?src=bb)
[resty 命令行工具演示 - OpenResty 官方博客](https://blog.openresty.com.cn/cn/resty-cmd/)

## 拉取镜像
⚠️ 目前没有官方镜像
```shell
$ docker pull tgagor/centos-stream
```

启动容器
⚠️下面的启动命令是有问题的,会无法使用systemctl
```shell
$ docker run -it tgagor/centos-stream bash
```
正确的启动命令
⚠️ 使用 —name 命名容器会更方便
```shell
$ docker run -itd --privileged tgagor/centos-stream /usr/sbin/init
c161ded46af895dd63bb4ed1ec90cc7c720850b0c70cec4b00982a12331af087

$ docker container ls -a
CONTAINER ID        IMAGE                       COMMAND                  CREATED             STATUS                     PORTS                    NAMES
c161ded46af8        tgagor/centos-stream        "/usr/sbin/init"         22 seconds ago      Up 21 seconds                                       inspiring_ptolemy

$ docker exec -it c161ded46af8 /bin/bash
```

进入容器后
```shell
$ cat /etc/os-release
NAME="CentOS Stream"
VERSION="8"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="8"
PLATFORM_ID="platform:el8"
PRETTY_NAME="CentOS Stream 8"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:8"
HOME_URL="https://centos.org/"
BUG_REPORT_URL="https://bugzilla.redhat.com/"
REDHAT_SUPPORT_PRODUCT="Red Hat Enterprise Linux 8"
REDHAT_SUPPORT_PRODUCT_VERSION="CentOS Stream"
```

## 安装OpenResty
安装wget
```shell
$ dnf -y install wget
CentOS Stream 8 - AppStream                                            2.6 MB/s | 8.5 MB     00:03
CentOS Stream 8 - BaseOS                                               1.5 MB/s | 2.7 MB     00:01
CentOS Stream 8 - Extras                                               3.6 kB/s |  13 kB     00:03
Dependencies resolved.
=======================================================================================================
 Package                           Architecture     Version                  Repository           Size
=======================================================================================================
Installing:
 wget                              x86_64           1.19.5-10.el8            appstream           734 k
Installing dependencies:
 libpsl                            x86_64           0.20.2-6.el8             baseos               61 k
 publicsuffix-list-dafsa           noarch           20180723-1.el8           baseos               56 k

Transaction Summary
=======================================================================================================
Install  3 Packages

Total download size: 851 k
Installed size: 2.9 M
Downloading Packages:
(1/3): libpsl-0.20.2-6.el8.x86_64.rpm                                   90 kB/s |  61 kB     00:00
(2/3): publicsuffix-list-dafsa-20180723-1.el8.noarch.rpm                82 kB/s |  56 kB     00:00
(3/3): wget-1.19.5-10.el8.x86_64.rpm                                   399 kB/s | 734 kB     00:01
-------------------------------------------------------------------------------------------------------
Total                                                                  188 kB/s | 851 kB     00:04
Running transaction check
Transaction check succeeded.
Running transaction test
Transaction test succeeded.
Running transaction
  Preparing        :                                                                               1/1
  Installing       : publicsuffix-list-dafsa-20180723-1.el8.noarch                                 1/3
  Installing       : libpsl-0.20.2-6.el8.x86_64                                                    2/3
  Installing       : wget-1.19.5-10.el8.x86_64                                                     3/3
  Running scriptlet: wget-1.19.5-10.el8.x86_64                                                     3/3
  Verifying        : wget-1.19.5-10.el8.x86_64                                                     1/3
  Verifying        : libpsl-0.20.2-6.el8.x86_64                                                    2/3
  Verifying        : publicsuffix-list-dafsa-20180723-1.el8.noarch                                 3/3

Installed:
  libpsl-0.20.2-6.el8.x86_64  publicsuffix-list-dafsa-20180723-1.el8.noarch  wget-1.19.5-10.el8.x86_64

Complete!
```

使用wget从官网下载openresty.repo文件
```shell
$ wget 'https://openresty.org/package/centos/openresty.repo'
--2021-05-22 14:13:16--  https://openresty.org/package/centos/openresty.repo
Resolving openresty.org (openresty.org)... 120.24.93.123
Connecting to openresty.org (openresty.org)|120.24.93.123|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 267 [text/plain]
Saving to: ‘openresty.repo’

openresty.repo            100%[====================================>]     267  --.-KB/s    in 0s

2021-05-22 14:13:17 (297 MB/s) - ‘openresty.repo’ saved [267/267]
```

将文件移动到yum仓库的配置目录中
```shell
$ mv openresty.repo /etc/yum.repos.d/
```

更新yum索引数据库
```shell
$ dnf check-update > /dev/null 2>&1
```

安装openresty RPM
```shell
$ dnf -y install openresty
Last metadata expiration check: 0:02:07 ago on Sat 22 May 2021 02:23:43 PM UTC.
Dependencies resolved.
=======================================================================================================
 Package                        Architecture     Version                     Repository           Size
=======================================================================================================
Installing:
 openresty                      x86_64           1.19.3.1-1.el8              openresty           1.1 M
Installing dependencies:
 openresty-openssl111           x86_64           1.1.1k-1.el8                openresty           1.6 M
 openresty-pcre                 x86_64           8.44-1.el8                  openresty           169 k
 openresty-zlib                 x86_64           1.2.11-3.el8                openresty            59 k

Transaction Summary
=======================================================================================================
Install  4 Packages

Total download size: 2.9 M
Installed size: 8.1 M
Downloading Packages:
(1/4): openresty-pcre-8.44-1.el8.x86_64.rpm                            122 kB/s | 169 kB     00:01
(2/4): openresty-zlib-1.2.11-3.el8.x86_64.rpm                          248 kB/s |  59 kB     00:00
(3/4): openresty-1.19.3.1-1.el8.x86_64.rpm                             444 kB/s | 1.1 MB     00:02
(4/4): openresty-openssl111-1.1.1k-1.el8.x86_64.rpm                    188 kB/s | 1.6 MB     00:08
-------------------------------------------------------------------------------------------------------
Total                                                                  346 kB/s | 2.9 MB     00:08
warning: /var/cache/dnf/openresty-9bb47c2efe3dbf62/packages/openresty-1.19.3.1-1.el8.x86_64.rpm: Header V4 RSA/SHA256 Signature, key ID d5edeb74: NOKEY
Official OpenResty Open Source Repository for CentOS                   2.6 kB/s | 1.6 kB     00:00
Importing GPG key 0xD5EDEB74:
 Userid     : "OpenResty Admin <admin@openresty.com>"
 Fingerprint: E522 18E7 0878 97DC 6DEA 6D6D 97DB 7443 D5ED EB74
 From       : https://openresty.org/package/pubkey.gpg
Key imported successfully
Running transaction check
Transaction check succeeded.
Running transaction test
Transaction test succeeded.
Running transaction
  Preparing        :                                                                               1/1
  Installing       : openresty-zlib-1.2.11-3.el8.x86_64                                            1/4
  Installing       : openresty-openssl111-1.1.1k-1.el8.x86_64                                      2/4
  Installing       : openresty-pcre-8.44-1.el8.x86_64                                              3/4
  Installing       : openresty-1.19.3.1-1.el8.x86_64                                               4/4
  Running scriptlet: openresty-1.19.3.1-1.el8.x86_64                                               4/4
  Verifying        : openresty-1.19.3.1-1.el8.x86_64                                               1/4
  Verifying        : openresty-openssl111-1.1.1k-1.el8.x86_64                                      2/4
  Verifying        : openresty-pcre-8.44-1.el8.x86_64                                              3/4
  Verifying        : openresty-zlib-1.2.11-3.el8.x86_64                                            4/4

Installed:
  openresty-1.19.3.1-1.el8.x86_64                openresty-openssl111-1.1.1k-1.el8.x86_64
  openresty-pcre-8.44-1.el8.x86_64               openresty-zlib-1.2.11-3.el8.x86_64

Complete!
```

## 测试使用
```shell
$ which openresty
/usr/bin/openresty
```

⚠️使用的嘴上叫数字自左侧的符号,不是单引号
```shell
file `which openresty`
/usr/bin/openresty: symbolic link to /usr/local/openresty/nginx/sbin/nginx
```

检查版本
```shell
$ openresty -V
nginx version: openresty/1.19.3.1
built by gcc 8.3.1 20191121 (Red Hat 8.3.1-5) (GCC)
built with OpenSSL 1.1.1h  22 Sep 2020 (running with OpenSSL 1.1.1k  25 Mar 2021)
TLS SNI support enabled
configure arguments: --prefix=/usr/local/openresty/nginx --with-cc-opt='-O2 -DNGX_LUA_ABORT_AT_PANIC -I/usr/local/openresty/zlib/include -I/usr/local/openresty/pcre/include -I/usr/local/openresty/openssl111/include' --add-module=../ngx_devel_kit-0.3.1 --add-module=../echo-nginx-module-0.62 --add-module=../xss-nginx-module-0.06 --add-module=../ngx_coolkit-0.2 --add-module=../set-misc-nginx-module-0.32 --add-module=../form-input-nginx-module-0.12 --add-module=../encrypted-session-nginx-module-0.08 --add-module=../srcache-nginx-module-0.32 --add-module=../ngx_lua-0.10.19 --add-module=../ngx_lua_upstream-0.07 --add-module=../headers-more-nginx-module-0.33 --add-module=../array-var-nginx-module-0.05 --add-module=../memc-nginx-module-0.19 --add-module=../redis2-nginx-module-0.15 --add-module=../redis-nginx-module-0.3.7 --add-module=../ngx_stream_lua-0.0.9 --with-ld-opt='-Wl,-rpath,/usr/local/openresty/luajit/lib -L/usr/local/openresty/zlib/lib -L/usr/local/openresty/pcre/lib -L/usr/local/openresty/openssl111/lib -Wl,-rpath,/usr/local/openresty/zlib/lib:/usr/local/openresty/pcre/lib:/usr/local/openresty/openssl111/lib' --with-cc='ccache gcc -fdiagnostics-color=always' --with-pcre-jit --with-stream --with-stream_ssl_module --with-stream_ssl_preread_module --with-http_v2_module --without-mail_pop3_module --without-mail_imap_module --without-mail_smtp_module --with-http_stub_status_module --with-http_realip_module --with-http_addition_module --with-http_auth_request_module --with-http_secure_link_module --with-http_random_index_module --with-http_gzip_static_module --with-http_sub_module --with-http_dav_module --with-http_flv_module --with-http_mp4_module --with-http_gunzip_module --with-threads --with-compat --with-stream --with-http_ssl_module
```

启动默认的openresty服务器
```shell
$ systemctl start openresty
```

查看服务进程
```shell
$ ps aux|grep nginx
root         196  0.0  0.0  36164  1372 ?        Ss   14:51   0:00 nginx: master process /usr/local/openresty/nginx/sbin/nginx
nobody       197  0.0  0.2  55456  5432 ?        S    14:51   0:00 nginx: worker process
root         199  0.0  0.0  12132  1076 pts/1    S+   14:52   0:00 grep --color=auto nginx
```

访问默认页面
```shell
$ curl 127.0.0.1/
<!DOCTYPE html>
<html>
<head>
<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
<meta content="utf-8" http-equiv="encoding">
<title>Welcome to OpenResty!</title>
<style>
    body {
        width: 35em;
        margin: 0 auto;
        font-family: Tahoma, Verdana, Arial, sans-serif;
    }
</style>
</head>
<body>
<h1>Welcome to OpenResty!</h1>
<p>If you see this page, the OpenResty web platform is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to our
<a href="https://openresty.org/">openresty.org</a> site<br/>
Commercial support is available at
<a href="https://openresty.com/">openresty.com</a>.</p>
<p>We have articles on troubleshooting issues like <a href="https://blog.openresty.com/en/lua-cpu-flame-graph/?src=wb">high CPU usage</a> and
<a href="https://blog.openresty.com/en/how-or-alloc-mem/">large memory usage</a> on <a href="https://blog.openresty.com/">our official blog site</a>.
<p><em>Thank you for flying <a href="https://openresty.org/">OpenResty</a>.</em></p>
</body>
</html>
```

**如果只是使用OpenResty到这里就可以了,如果需要使用额外的功能和调试可以安装下面的包**

## 安装resty命令行工具
⚠️这个工具比较大
```shell
$ dnf -y install openresty-resty
```

```shell
$ which resty
/usr/bin/resty
```

测试
```shell
$ resty -e 'print("Hello Resty")'
Hello Resty
```

## 使用restydoc安装openresty-doc包
```shell
$ dnf -y install openresty-doc
Last metadata expiration check: 0:20:00 ago on Sat 22 May 2021 02:51:04 PM UTC.
Dependencies resolved.
=======================================================================================================
 Package                   Architecture       Version                      Repository             Size
=======================================================================================================
Installing:
 openresty-doc             noarch             1.19.3.1-1.el8               openresty             600 k

Transaction Summary
=======================================================================================================
Install  1 Package

Total download size: 600 k
Installed size: 2.7 M
Downloading Packages:
openresty-doc-1.19.3.1-1.el8.noarch.rpm                                279 kB/s | 600 kB     00:02
-------------------------------------------------------------------------------------------------------
Total                                                                  279 kB/s | 600 kB     00:02
Running transaction check
Transaction check succeeded.
Running transaction test
Transaction test succeeded.
Running transaction
  Preparing        :                                                                               1/1
  Installing       : openresty-doc-1.19.3.1-1.el8.noarch                                           1/1
warning: Unable to get systemd shutdown inhibition lock: Unit systemd-logind.service is masked.

  Verifying        : openresty-doc-1.19.3.1-1.el8.noarch                                           1/1

Installed:
  openresty-doc-1.19.3.1-1.el8.noarch

Complete!
```

```shell
$ restydoc -s content_by_lua_file
   content_by_lua_file
       syntax: content_by_lua_file <path-to-lua-script-file>

       context: location, location if

       phase: content

       Equivalent to content_by_lua, except that the file specified by
       "<path-to-lua-script-file>" contains the Lua code, or, as from the
       "v0.5.0rc32" release, the "LuaJIT bytecode" to be executed.

       Nginx variables can be used in the "<path-to-lua-script-file>" string
       to provide flexibility. This however carries some risks and is not
       ordinarily recommended.

       When a relative path like "foo/bar.lua" is given, they will be turned
       into the absolute path relative to the "server prefix" path determined
       by the "-p PATH" command-line option while starting the Nginx server.

       When the Lua code cache is turned on (by default), the user code is
       loaded once at the first request and cached and the Nginx config must
       be reloaded each time the Lua source file is modified.  The Lua code
       cache can be temporarily disabled during development by switching
       lua_code_cache "off" in "nginx.conf" to avoid reloading Nginx.

       Nginx variables are supported in the file path for dynamic dispatch,
       for example:

            # CAUTION: contents in nginx var must be carefully filtered,
            # otherwise there'll be great security risk!
            location ~ ^/app/([-_a-zA-Z0-9/]+) {
                set $path $1;
                content_by_lua_file /path/to/lua/app/root/$path.lua;
            }

       But be very careful about malicious user inputs and always carefully
       validate or filter out the user-supplied path components.



OpenResty                         2021-05-22                ngx_lua-0.10.19(7)
(END)
```

