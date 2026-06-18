---
name: project-conventions
description: >-
  umi-pro-stencil 的 PC/Web 端开发标准——建立在 umi skill（通用基线）之上，只补 PC 专属约定。
  在本仓写/改 Web 端代码、做后台页面/表格/表单/布局、选 UI 组件、写桌面样式时查阅。
  规定 PC 栈（antd 6 / @ant-design/pro-components 3 / @ant-design/icons 6 / antd-style + Tailwind），
  组件铁律（优先 ProComponents→antd、不造轮子、自定义也基于 antd 改造），桌面样式与 token 用法。
  在这个 Web 后台项目里写代码就用它（连同 umi skill）。antd 组件细节见 antd skill。
license: Proprietary
metadata:
  repo: umi-pro-stencil
  scope: web (PC)
  builds-on: umi
---

# umi-pro-stencil PC/Web 标准

本仓是 **Web/PC 端**后台标准，建立在 **umi skill**（所有 umi 项目的通用基线：代码归位、内部结构、services/信封、React Query、路由/权限、命名、导入、工具链）之上——**先遵 umi skill，本文只补 PC 专属**。antd 组件用法见 **antd skill**（先 `npx antd info` 查再写）。PC 代码范式见 [references/pc-patterns.md](references/pc-patterns.md)。

## PC 技术栈（在 umi 基线 React19/TS6/utoopack/RQ/Biome/Vitest 之上）
**antd 6** · **@ant-design/pro-components 3** · **@ant-design/icons 6** · 样式 **antd-style + Tailwind**。

## 一、组件铁律（能用现成的就不自己写）
- 优先级 **ProComponents → antd → 自定义（万不得已）**。后台 UI（表格/表单/弹窗/抽屉/详情/布局/上传）Pro+antd 几乎全覆盖，**禁止重复造已有组件**。
- 即便要自定义，也**优先基于 antd 基础组件改造/封装**（`Card`/`List`/`Table`/`Form` 等），不从零裸 div 手搓。
- 写 antd 前先用 **antd skill**（`npx antd info <X>`）查 API。

## 二、PC 组件速查
| 场景 | 用 |
| --- | --- |
| 表格 | `ProTable`（`request` 返回 `{data,success,total}`） |
| 表单 | `ProForm` / `ModalForm` / `DrawerForm` |
| 详情 | `ProDescriptions` |
| 页容器 / 布局 | `PageContainer` / `ProLayout` |
| 提示 / 确认 | `App.useApp()` 的 `message`/`modal`（非静态） |

## 三、样式（PC）
- 组件样式 → **`index.style.ts`**（antd-style `createStyles`，读主题 token）。
- 布局/间距/尺寸 → **Tailwind** 原子类。
- 颜色走 token / cssVar，**不硬编码**；不堆静态内联；**禁 less**。

## 四、antd 基础约定
- 组件从 **`antd` 顶层**引，**不深引 `antd/es/...`**；图标 `@ant-design/icons`。
- `message`/`modal`/`notification` 用 **`App.useApp()`**（umi `antd:{appConfig:{}}` 已挂 `<App>`）。
- antd 6 已开 cssVar；表单用 `Form.useForm()` 实例驱动。

## ✅ / ❌（PC）
- ✅ `ProTable`/`ProForm` ❌ 自己写表格/表单
- ✅ `App.useApp().message` ❌ 静态 `message.xxx`
- ✅ `from 'antd'` ❌ `from 'antd/es/...'`
- ✅ 组件样式 `index.style.ts`(antd-style) ❌ `.less` / 静态内联
- ✅ 自定义基于 antd 改造 ❌ 裸 div 从零手搓

## 反模式（PC）
重复造 antd/Pro 已有组件 · 深引 `antd/es/...` · 静态 `message` · `.less`/静态内联 · 降级 antd/Pro 大版本。
（通用反模式——裸 fetch、useRequest、from 'umi' 等——见 umi skill。）
