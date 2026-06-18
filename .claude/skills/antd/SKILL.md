---
name: antd
description: >-
  涉及 Ant Design (antd) 的任务都用它：写 antd 组件、查 antd API/props/token/demo、排查 antd 报错、
  跨大版本迁移、分析项目里的 antd 用法。触发于 antd 相关代码、`from 'antd'` 导入、或任何 antd 问题。
  核心理念：写 antd 前先用 `npx antd` 命令查证，别凭记忆猜 API。
allowed-tools: Bash(npx antd *) Bash(antd *)
metadata:
  cli: "@ant-design/cli"
---

# antd 使用助手

借助 `@ant-design/cli`（已作 devDep 安装）的 `npx antd` 命令查询、校验、迁移 antd——**先查再写**。命令统一加 `--format json` 便于解析。

## 铁律
写任何 antd 代码前**先查 API**，不要凭记忆猜 props/行为：
```bash
npx antd info <Component> --format json
```

## 写组件
1. 查 API：`npx antd info Button --format json`
2. 取 demo 模板：`npx antd demo Button basic --format json`
3. 查样式 token：`npx antd token Button --format json` · `npx antd semantic Button --format json`

## 排查
- 环境快照：`npx antd env --format json`
- 指定版本校验：`npx antd info Select --version 6.0.0 --format json`
- 弃用/可达性/性能检查：`npx antd lint ./src --only deprecated|a11y|performance --format json`
- 项目体检：`npx antd doctor --format json`

## 迁移（大版本）
- 迁移清单：`npx antd migrate 5 6 --format json`
- 指定组件：`npx antd migrate 5 6 --component Select --format json`
- 破坏性变更：`npx antd changelog 5.0.0 6.0.0 --format json`

## 分析
- 用量统计：`npx antd usage ./src --format json`

## 提交前
`npm run lint`（Biome + tsc）通过后，再跑 `npx antd lint ./src --format json` 查 antd 弃用与问题。
