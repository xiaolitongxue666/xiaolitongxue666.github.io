---
layout: default
title:  "在CentOS Stream 搭建自己的OpenResry Docker Image"
date:   2021-05-26 01:12:04 +0800
categories: 
---

# 在CentOS Stream 搭建自己的OpenResry Docker Image
#docker #openresty #centos

- [ ] [Docker Hub](https://hub.docker.com/r/tgagor/centos-stream)
- [ ] https://blog.csdn.net/abc564643122/article/details/90904156
- [ ] https://blog.csdn.net/weixin_30533797/article/details/97822414
- [ ] [命令说明 - Docker —— 从入门到实践](https://yeasy.gitbook.io/docker_practice/compose/commands)
- [ ] https://blog.csdn.net/u013042707/article/details/83754791
- [ ] [YouTube](https://www.youtube.com/watch?v=MVIcrmeV_6c&list=PLy7NrYWoggjzfAHlUusx2wuDwfCrmJYcs&index=9)
- [ ] [openresty  docker 安装运行 HelloWord_简单技术-CSDN博客](https://blog.csdn.net/abc564643122/article/details/90904156)

## Dockerfile
```dockerfile
FROM tgagor/centos-stream

RUN dnf -y install wget \
&&  wget 'https://openresty.org/package/centos/openresty.repo' \
&&  mv openresty.repo /etc/yum.repos.d/ \ 
&&  dnf check-update > /dev/null 2>&1 \
&&  dnf -y install openresty

EXPOSE 9090

VOLUME /Users/liyong/Code/Docker/CentOsSteam/OpenRestry/nginx_conf:/usr/local/openresty/nginx/conf

```

## 测试脚本
```bash
#!/bin/sh

# Stop all running containers
docker container ls | grep -E "centos_stream_openresty" | awk '{print $1}' | uniq | xargs -I {} docker container stop {}

# Delete all stop container 
docker container ls -a | grep -E "centos_stream_openresty_container" | awk '{print $1}' | uniq | xargs -I {} docker container rm {}

# Delete all old images
docker images | grep -E "centos_stream_openresty" | awk '{print $3}' | uniq | xargs -I {} docker rmi --force {}

# Use docker file build image
#docker build -t centos_stream_openresty .

#ContainerID=`docker run -itd -p 9090:9090 -v /Users/liyong/Code/Docker/CentOsSteam/OpenRestry/nginx_conf:/usr/local/openresty/nginx/conf --rm --privileged centos_stream_openresty /usr/sbin/init`

# Enter container
#docker exec -it $ContainerID /bin/bash

```

## docker-compose
⚠️**docker-compose启动容器后自动退出**
https://blog.csdn.net/qq_41980563/article/details/88880719

[docker笔记5-使用docker-compose build image像并启动应用_猿份哥-CSDN博客](https://blog.csdn.net/u013042707/article/details/83754791)

[Docker-compose 如何进入容器](https://juejin.cn/post/6887758813202481159)

```yaml
version: '3'
services:
    openrestry:
        build:
            context: .
            dockerfile: Dockerfile
        image: centos_stream_openresty
        container_name: centos_stream_openresty_container
        tty: true
        volumes: 
            - /Users/liyong/Code/Docker/CentOsSteam/OpenRestry/nginx_conf:/usr/local/openresty/nginx/conf
        ports:
            - 9090:9090
```

## OpenResty配置测试

在volume的文件夹下编写如下配置
```nginx
worker_processes  1;
 error_log logs/error.log;
 events {
     worker_connections 1024;
 }
 http {
     server {
         listen 9090;
         location / {
             default_type text/html;
             content_by_lua_block {
                 ngx.say("<p>hello, world</p>")
             }
         }
     }
 }
```

测试
```shell
$ curl http://localhost:9090/
<p>hello, world</p>
```

在容器中启动服务
```shell
$ /usr/local/openresty/nginx/sbin/nginx -p `pwd`/ -c conf/nginx.conf
```





