---
name: project-conventions
description: >-
  本仓（umi-pro-stencil，基于 @umijs/max + Ant Design Pro v6 技术栈）的开发约定与目录规范。
  在本仓新增或修改任何前端代码前都应先查阅——包括加页面 page、写组件 component、调接口 API/service、
  写 hook、写工具函数 util、加常量 constant、写样式 style、引依赖。它规定各类代码该放哪个目录、命名与
  文件结构，以及强制的技术栈约定（antd6 / pro-components 3 / antd-style + Tailwind + CSS Modules /
  React Query / Biome / 统一 from '@umijs/max' 导入 / dayjs）。只要你在这个 umi/antd 项目里写代码，
  就用它，即使用户没明说"约定/规范"二字。
---

# umi-pro-stencil 开发约定

本仓是 `@umijs/max`（umi 4）+ **Ant Design Pro v6** 技术栈的项目模板。下列约定让所有人（含 AI）写出风格一致、放置正确的代码。**动手前先想清楚：你要加的东西属于哪一类、该放哪个目录、该用哪种范式。** 拿不准时，照着仓里已有的"参照文件"模仿，比凭空发挥更可靠。

## 技术栈（默认遵循，不要降级或替换）
- 框架：`@umijs/max` 4.6（umi 4）· React 19 · TypeScript 6 · 打包器 **utoopack**（`.umirc.ts` 里 `utoopack: {}`）
- UI：**antd 6** · **@ant-design/pro-components 3** · **@ant-design/icons 6**
- 样式：**Tailwind v4 + antd-style + CSS Modules**（禁止 less）
- 数据：**@tanstack/react-query**（经 umi 内置 `reactQuery` 插件）
- 质量：**Biome**（格式化 + lint）· **Vitest**（测试）· conventional commits · `react-doctor`

## 目录职责：什么代码放哪里

每一类代码都有唯一归属。按下表放置，不要随手塞进页面文件。

| 目录 | 放什么 | 怎么放（含参照文件） |
| --- | --- | --- |
| `src/services/<模块>/` | **接口调用** | 请求函数写在 `XxxController.ts`；API 出入参类型写在 `typings.d.ts`（挂在全局 `API` 命名空间下）；`index.ts` 汇总导出。用 `@umijs/max` 的 `request`。参照 `src/services/demo/`。 |
| `src/components/<Name>/` | **跨页面共享组件** | 一个组件一个目录，入口 `index.ts(x)`。参照 `src/components/Guide/`、`src/components/QueryDemo/`。 |
| `src/hooks/` | **自定义 React hooks** | 一个 hook 一个文件，命名 `useXxx.ts`。跨页面复用的逻辑钩子都集中在此，**不要散落在组件文件里**。 |
| `src/pages/<Page>/` | **路由页面** | 页面入口 `index.tsx`；**仅该页使用的组件**放 `<Page>/components/`（参照 `src/pages/Table/components/`）。页面需在 `.umirc.ts` 的 `routes` 注册。 |
| `src/models/` | **全局状态** | umi model（导出一个 hook），用 `useModel('名字')` 消费。参照 `src/models/global.ts`。 |
| `src/utils/` | **纯工具函数** | 无副作用、可单测的纯函数。参照 `src/utils/format.ts`。 |
| `src/constants/` | **常量 / 枚举** | 集中魔法值、字典、枚举，避免硬编码散落各处。参照 `src/constants/index.ts`。 |
| `src/access.ts` | **权限定义** | 配合 umi `access` 插件，用 `useAccess()` / `<Access>` 消费。 |
| `src/app.ts(x)` | **运行时配置** | `getInitialState`、`layout`、`rootContainer` 等运行时钩子。 |
| `.umirc.ts` | **构建/插件配置** | 路由 + 插件（antd / access / model / request / reactQuery / tailwindcss / utoopack）。 |

> 判断口诀：这是**接口**？**组件**？**hook**？**纯函数**？**常量**？**全局状态**？对号入座。

## 样式：三件套分工（禁止 less）

按"该用哪种"选择，不要混用错位：

- **Tailwind v4** —— 布局、间距、尺寸、flex 等原子化场景，直接 `className="pt-20 flex gap-2"`。
- **antd-style `createStyles`** —— 需要读 antd **主题 token**（颜色/圆角随主题变）的组件样式。参照 `src/components/Guide/Guide.tsx`。
- **CSS Modules（`*.module.css`）** —— 组件级、需要隔离的自定义样式：`import styles from './index.module.css'` → `className={styles.x}`。参照 `src/components/QueryDemo/`。
- ❌ 不写 `.less`，不引入 less 相关依赖。

为什么分三种：原子类省去命名负担、token 方案让主题切换自动生效、CSS Modules 解决命名冲突——各管一摊、不重叠。

## 数据请求：React Query

- 服务端状态用 `@tanstack/react-query`：`import { useQuery, useMutation } from '@umijs/max'`（umi `reactQuery` 插件已挂好全局 Provider，无需自己包）。参照 `src/components/QueryDemo/`。
- 请求函数本身仍写在 `src/services/<模块>/`，由 `useQuery` 的 `queryFn` 调用——**职责分离**：services 管"怎么请求"，组件管"何时用、怎么缓存"。
- 表格用 `ProTable` 自带的 `request` 属性即可（它不是 useRequest），不必再套 React Query。参照 `src/pages/Table/index.tsx`。
- ❌ 不用 ahooks 的 `useRequest`。

## 导入与基础约定

- 框架能力一律从 **`@umijs/max`** 导入（`useModel` / `useQuery` / `request` / `history` / `Access` / `getLocale` 等），**不要从 `'umi'` 导入**。
- 用 **`@/`** 别名指向 `src`（如 `import { trim } from '@/utils/format'`），不要写一长串相对路径。
- 日期用 **dayjs**（antd 6 默认），不用 moment。
- 组合 className 用 **clsx**。

## 工具链与提交

- **格式化 / lint 用 Biome**：`npm run format`（写入修复）、`npm run lint`（biome + `tsc`）。不引入 prettier / eslint / stylelint。
- **测试用 Vitest**：测试文件与被测源码**同目录**，命名 `*.test.tsx`（参照 `src/components/Guide/Guide.test.tsx`）。`npm test` 运行。
- **提交信息**走 conventional commits（`feat:` / `fix:` / `refactor:` / `chore:` / `test:` / `docs:` …），`max verify-commit` 会在 commit-msg 阶段校验，不合规会被拦。
- 可选 `npm run doctor`（react-doctor）做 React 反模式 / 性能 / 可达性体检。

## 新增东西的快速配方

- **加一个页面**：`src/pages/<Page>/index.tsx` 写页面 → `.umirc.ts` 的 `routes` 注册 → 该页私有组件放 `<Page>/components/`。
- **加一个接口**：`src/services/<模块>/XxxController.ts` 写请求函数 + `typings.d.ts` 补 `API.*` 类型 → 组件里用 `useQuery`/`useMutation` 调用。
- **加一个共享组件**：`src/components/<Name>/index.tsx`（需隔离样式再加 `index.module.css`）。
- **加一个 hook**：`src/hooks/useXxx.ts`。
- **加工具 / 常量**：分别进 `src/utils/`、`src/constants/`。

## 反模式（不要做）

- 把接口请求散写在组件/页面里 → 应进 `src/services/`。
- 把可复用 hook 写在组件文件里 → 应进 `src/hooks/`。
- 用 `.less` 或在组件里堆内联样式 → 用三件套。
- 用 `useRequest` / `moment` / `from 'umi'`。
- 引入 prettier / eslint / stylelint → 统一用 Biome。
- 降级 antd / pro-components / React 大版本，或绕开 utoopack。
