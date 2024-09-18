---
layout: default
title:  "Docker multistage"
date:   2021-05-26 01:17:04 +0800
categories: 
---

# Docker multistage
#docker #docker_multistage

- [ ] [YouTube](https://www.youtube.com/watch?v=V9egJMknKtM&t=1s)
- [ ] [YouTube](https://www.youtube.com/watch?v=KLOdisHW8rQ)
- [ ] https://www.katacoda.com/ionbazan/scenarios/03-multistage-docker-images

## 使用场景
在使用容器的搭建服务环境的时候,常常会因为安装过程中,产生的文件让容器变得非常臃肿,或者是在搭建编译环境编译代码后,我们只需要使用编译后的可执行文件,并不需要编译环境,以上情况,使用multistage的方式i就可以有效的给容器瘦身.

## 编写一个简单的应用
```go
package main

import (
	"fmt"
	"log"
	"net/http"
)

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello from the webserver")
}

func main(){
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
```

## 编写Dockerfile
⚠️ WORKDIR [WORKDIR 指定工作目录 - Docker —— 从入门到实践](https://yeasy.gitbook.io/docker_practice/image/dockerfile/workdir)
使用 WORKDIR 指令可以来指定工作目录（或者称为当前目录），以后各层的当前目录就被改为指定的目录，如该目录不存在，WORKDIR 会帮你建立目录。
```dockerfile
FROM golang:1.8

WORKDIR /go/src/app
COPY main.go .

RUN go build -o webserver .

CMD ["./webserver"]
```

## 生成Image
进入到Dockerfile所在文件夹后执行如下命令, -t 是给生成的image指定一个tag
```shell
$ docker build -t webserver .
```

## 运行容器
-p 指定host和容器之间的端口映射,访问host的8080端口就是访问容器中的8080端口
```shel
$ docker run  -p "8080:8080" webserver
```

## 查看当前Image的大小
```shell
$ docker images | grep webserver
```
会看到一个很简单的webserver居然有几百兆

如果把Dockerfile的基础镜像切换为alpine,可以做一些减少,不过还是有上百兆.
```dockerfile
FROM golang:alpine
```

## 编写MultiStage Dockerfile
```dockerfile
FROM golang:alpine AS builder # 第一阶段 搭建编译环境并编译可执行文件

WORKDIR /go/src/app
COPY main.go .

RUN go build -o webserver .

FROM alpine # 第二阶段 运行环境 
WORKDIR /app
COPY --from=builder /go/src/app/ /app/ # 将第一阶段编译生成的可执行文件和运行必要的其他文件 拷贝到第二阶段中

CMD ["./webserver"]
```

生成Image并测试,再查看Image大小
```shell
$ docker build -t webserver .
$ docker run  -p "8080:8080" webserver
$ docker images | grep webserver
```

⚠️ 编译环境最好喝运行环境是匹配的,就是说你不能在windows上编译出一个可执行文件,然后咋第二阶段用MacOS来运行.

## 如何确定哪些文件需要COPY到需要的阶段呢
- [ ] https://docs.docker.com/engine/reference/commandline/diff/
- [ ] https://docs.docker.com/engine/reference/commandline/container_diff/
- [ ] [YouTube](https://www.youtube.com/watch?v=iCI69VWD4OQ) create docker container, diff docker container and copy file into container

关键的命令有两个 
* **docker diff** :docker diff: List the changed files and directories in a container᾿s filesystem since the container was * _created_ *. 
* **docker container diff**: docker container diff, Inspect changes to files or directories on a container’s filesystem. docker container * _exec_ *, Run a command in a running container.




