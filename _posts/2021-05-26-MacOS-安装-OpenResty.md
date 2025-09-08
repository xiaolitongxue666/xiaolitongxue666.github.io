---
layout: default
title:  "MacOS 安装 OpenResty"
date:   2021-05-26 12:59:04 +0800
categories: 
---

# MacOS 安装 OpenResty
#openresty #Lua #nginx

## 安装OpenResty
[OpenResty - Installation](https://openresty.org/en/installation.html)
https://segmentfault.com/q/1010000019781462

Mac OS:
```shell
brew update
brew install pcre openssl curl
brew install openresty/brew/openresty
```

```shell
$ openresty -v
nginx version: openresty/1.19.3.1
```

## 初次使用OpenResty
```shell
cd ~
mkdir OpenResty
cd OpenResty
mkdir logs/ conf/
```

```nginx
# File: ~/OpenResty/conf/nginx.conf
 worker_processes  1;
 error_log logs/error.log;
 events {
     worker_connections 1024;
 }
 http {
     server {
         listen 8080;
         location / {
             default_type text/html;
             content_by_lua_block {
                 ngx.say("<p>hello, world</p>")
             }
         }
     }
 }
```

启动配置
⚠️ 如果在系统中之前有安装过nginx ,就需要注意,这里测试需要使用的是OpenResty下的nginx

```shell
$ openresty -V
nginx version: openresty/1.19.3.1
built by clang 12.0.5 (clang-1205.0.22.9)
built with OpenSSL 1.1.1k  25 Mar 2021
TLS SNI support enabled
configure arguments: --prefix=/usr/local/Cellar/openresty/1.19.3.1_1/nginx --with-cc-opt='-O2 -I/usr/local/include -I/usr/local/opt/pcre/include -I/usr/local/opt/openresty-openssl111/include' --add-module=../ngx_devel_kit-0.3.1 --add-module=../echo-nginx-module-0.62 --add-module=../xss-nginx-module-0.06 --add-module=../ngx_coolkit-0.2 --add-module=../set-misc-nginx-module-0.32 --add-module=../form-input-nginx-module-0.12 --add-module=../encrypted-session-nginx-module-0.08 --add-module=../srcache-nginx-module-0.32 --add-module=../ngx_lua-0.10.19 --add-module=../ngx_lua_upstream-0.07 --add-module=../headers-more-nginx-module-0.33 --add-module=../array-var-nginx-module-0.05 --add-module=../memc-nginx-module-0.19 --add-module=../redis2-nginx-module-0.15 --add-module=../redis-nginx-module-0.3.7 --add-module=../ngx_stream_lua-0.0.9 --with-ld-opt='-Wl,-rpath,/usr/local/Cellar/openresty/1.19.3.1_1/luajit/lib -L/usr/local/lib -L/usr/local/opt/pcre/lib -L/usr/local/opt/openresty-openssl111/lib' --pid-path=/usr/local/var/run/openresty.pid --lock-path=/usr/local/var/run/openresty.lock --conf-path=/usr/local/etc/openresty/nginx.conf --http-log-path=/usr/local/var/log/nginx/access.log --error-log-path=/usr/local/var/log/nginx/error.log --with-pcre-jit --with-ipv6 --with-stream --with-stream_ssl_module --with-stream_ssl_preread_module --with-http_v2_module --without-mail_pop3_module --without-mail_imap_module --without-mail_smtp_module --with-http_stub_status_module --with-http_realip_module --with-http_addition_module --with-http_auth_request_module --with-http_secure_link_module --with-http_random_index_module --with-http_geoip_module --with-http_gzip_static_module --with-http_sub_module --with-http_dav_module --with-http_flv_module --with-http_mp4_module --with-http_gunzip_module --with-threads --with-stream --with-http_ssl_module
```

其中安装路径
```shell
configure arguments: --prefix=/usr/local/Cellar/openresty/1.19.3.1_1/nginx 
```
就是需要使用的nginx

```shell
# 这里使用绝对路径
/usr/local/Cellar/openresty/1.19.3.1_1/nginx/sbin/nginx -p `pwd`/ -c conf/nginx.conf
```

```shell
$ ps -ax | grep nginx
33325 ??         0:00.00 nginx: master process /usr/local/Cellar/openresty/1.19.3.1_1/nginx/sbin/nginx -p /Users/liyong/Code/OpenResry/ -c conf/nginx.conf
```
此时服务已经启动

```shell
$ curl http://localhost:8080/
<p>hello, world</p>
```
成功获取到网页数据









