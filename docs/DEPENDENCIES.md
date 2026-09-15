# 依赖与安全更新

事实来源：根目录 [`package.json`](../package.json) 与 `package-lock.json`。合并 Dependabot 前先读本节。

## overrides

长期只钉 `gray-matter` 的 `js-yaml@3.15.2`。gray-matter 仍依赖 3.x，caret 吃不到 4.x；3.15.2 修了 empty-merge DoS（GHSA-2883）。

不要钉 `sharp`、`svgo`、`smol-toml`、`dompurify`：Astro / mermaid 已是 `^`，精确 pin 会挡住下一轮补丁（2026-09 Dependabot #38–#45 即此原因）。

新 advisory 先看 lock 实际版本；只有 caret 解析不到已修版时才加临时 override，修过后删。

## 合并 Dependabot

1. 看 PR 是否只改 lock，以及 `overrides` 会不会把漏洞版钉回去。
2. 多条安全 PR 会同时改 `package-lock.json`，不要串行点 Merge；在 master 上一次协调升级后关闭其余 PR。
3. 安全更新由 [`.github/dependabot.yml`](../.github/dependabot.yml) 打成一组。

## 验证

```bash
npm audit --audit-level=high
npm run verify:local
```

`verify:local`（[`.github/scripts/dev-verify.sh`](../.github/scripts/dev-verify.sh)）与 Pages CI（`astro-build.yml`）在构建前跑 `npm audit --audit-level=high`。`_data/build.yml` 由脚本生成，不参与 Prettier。

对本站：YAML / TOML / SVG 均在构建期处理受信内容；sharp / astro 图片路径仍应跟补丁，因为 CI 会解码图片。
