---
layout: default
title: "MCP Model Context Protocol 模型上下文协议"
date: 2025-02-27 12:00:00 +0800
categories: [AI, MCP]
tags: [ai, mcp]
---

# MCP Model Context Protocol 模型上下文协议

#ai #mcp 

- Refernces
	- https://www.nazha.co/posts/what-is-mcp-and-how-to-use
	- https://www.youtube.com/watch?v=Y_kaQmhGmZk

近段时间，LLM 表现出强大的学习能力和规划能力，能够处理更加复杂、抽象的任务。这种强大的能力，让我们看到了 LLM 在 AGI（通用人工智能）中的巨大潜力。但同时，LLM 也不是万能的，它缺失了很多能力。<font color="#e36c09">LLM 可以作为[[智能体]]的大脑，外部工具就是智能体的手和脚，协助智能体执行决策</font>。

> 一个典型的 Agent 的设计，LLM 充当大脑模块，通过多模态输入，处理信息，然后做出决策和规划行动。

MCP 就是想要通过一个开放的协议，为外部工具（或数据源）提供统一和 LLM 交互的统一集成。

> MCP 就是手脚连接身体的“关节”。

主要有以下几个概念：

- **MCP Host**：LLM 的宿主应用，比如 [Cursor](https://docs.cursor.com/advanced/model-context-protocol)、Cline 等等，**是处理一个或多个 MCP Server 的应用程序**。
- **MCP Client**：Host 内部专门用于与 MCP Server 建立和维持一对一连接的模块。它负责按照 MCP 协议的规范发送请求、接收响应和处理数据。简单来说，MCP Client 是 Host 内部处理 RPC 通信的“代理”，专注于与一个 MCP Server 进行标准化的数据、工具或 prompt 的交换。
- **MCP Server**：提供外部能力或数据的工具，比如实时获取天气、浏览网页等等能力

MCP Client 更多是一个[底层技术术语](https://github.com/modelcontextprotocol/specification/discussions/135)，是关于 MCP Server 连接到 MCP Host 的底层细节，不用过于区分 MCP Host 和 MCP Client。

看了[nazha](https://www.nazha.co/)大佬上面的概念介绍,下面让我尝试在cursor中使用mcp fetch

启动cursor后,首先进行mcp fetch的安装

```shell
pip3 install --user mcp-server-fetch
```

因为我是在iterm2中使用的fish,添加对应的配置

```shell
echo 'set -gx PATH $PATH $HOME/.local/bin' >> ~/.config/fish/config.fish

source ~/.config/fish/config.fish
```

在cursor或者独立终端中启动mcp-server-fetch

```shell
mcp-server-fetch
```

直接编辑cursor配置文件

```shell
mkdir -p ~/Library/Application\ Support/Cursor/config/

echo '{"mcpServers":{"fetch":{"command":"mcp-server-fetch","args":[]}}}' > ~/Library/Application\ Support/Cursor/config/settings.json
```

这里需要重启cursor,新用户不用担心,cursor会保留chat历史

重启cursor后可能需要重新启动mcp-server-fetch

现在让我们测试一下功能是否正常工作。您可以在 Cursor 中尝试以下操作：

1. 简单测试：

请在 Cursor 中问我："请帮我获取并总结 GitHub 首页的内容"

2. 如果这个测试成功了，您就可以使用更多高级功能，比如：

- "请帮我查看并总结某个特定网页的内容"

- "请帮我查找某个技术文档中的特定信息"

- "请帮我获取某个 GitHub 仓库的 README 内容"

3. 实际使用场景：

- 在编程时需要查看文档

- 需要参考其他项目的实现

- 需要获取最新的技术资讯

现在可以试试看，问我那个问题，测试一下 MCP 是否正常工作。

在cursor中输入如下要求

```shell
请帮我查看这个blog地址@https://weinan.io/  
2025年的post并按照时间顺序排列出来  
针对每个post给一个简介
```

得到如下回答

---

好的，我来帮您整理 weinan.io 2025年的博客文章，按时间从新到旧排序：

1. **2025年2月22日** - [The usage of const component in Vue](https://weinan.io/)
   - 简介：介绍了 Vue 中 const 组件的使用方法和最佳实践。这是一个关于 Vue.js 性能优化的技术文章。

2. **2025年2月20日** - [Using LangChain4j to connect with locally deployed DeepSeek](https://weinan.io/)
   - 简介：讲解如何使用 LangChain4j 框架连接本地部署的 DeepSeek 模型，这是一个关于 AI 模型集成的实践教程。

3. **2025年2月17日** - [Installing Tensorflow on MacOS](https://weinan.io/)
   - 简介：详细介绍了在 MacOS 系统上安装 Tensorflow 的步骤和注意事项。

4. **2025年2月6日** - [Install DeepSeek locally on an Apple M4 Pro chip based computer](https://weinan.io/)
   - 简介：介绍了如何在搭载 Apple M4 Pro 芯片的电脑上本地部署 DeepSeek AI 模型。

5. **2025年1月17日** - [Enable the PostgreSQL SQL log output in MacOS](https://weinan.io/)
   - 简介：讲解了如何在 MacOS 系统上启用和配置 PostgreSQL 的 SQL 日志输出功能。

6. **2025年1月3日** - [Override the proxy setting of podman in MacOS](https://weinan.io/)
   - 简介：详细说明了如何在 MacOS 中覆盖 podman 的代理设置。

7. **2025年1月2日** - [Fix the config of fish shell when using ghostty](https://weinan.io/)
   - 简介：解决在使用 ghostty 终端时 fish shell 配置的相关问题。

这些文章主要集中在以下几个技术领域：
- AI/机器学习（DeepSeek, Tensorflow）
- 开发工具配置（PostgreSQL, podman）
- 前端开发（Vue.js）
- MacOS 系统配置
- 终端工具（fish shell, ghostty）

看起来这位博主在 2025 年初主要关注 AI 相关技术和各种开发工具的配置优化。如果您对某个具体主题感兴趣，我可以帮您深入了解相关内容。

---

这就是mcp fetch的简单使用的一个例子

目前有[很多客户端](https://modelcontextprotocol.io/clients)已经支持 MCP Servers 的使用，比如 Cline、[Cursor](https://docs.cursor.com/advanced/model-context-protocol)，可以直接在这些客户端中使用[社区开发好的 Servers](https://github.com/modelcontextprotocol/servers/tree/main?tab=readme-ov-file)。下面是一些收集 MCP Servers 的网站：

- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main?tab=readme-ov-file) 官方社区维护
- [Smithery](https://smithery.ai/)
- [PluseMCP](https://www.nazha.co/posts/pulsemcp)




