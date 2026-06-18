---
name: project-conventions
description: >-
  本仓（umi-pro-stencil，基于 @umijs/max + Ant Design Pro v6 技术栈）的开发约定与目录规范。
  在本仓新增或修改任何前端代码前都应先查阅——包括加页面 page、写组件 component、调接口 API/service、
  写 hook、写工具函数 util、加常量 constant、写样式 style、配路由/权限 route/access、写 mock、引依赖。
  它规定各类代码放哪个目录、命名与文件结构、后端响应信封怎么取数判错，以及强制的技术栈约定（antd6 /
  pro-components 3 / antd-style + Tailwind + CSS Modules / React Query / Biome / 统一 from '@umijs/max'
  导入 / dayjs）。只要你在这个 umi/antd 项目里写代码，就用它，即使用户没明说"约定/规范"二字。
license: Proprietary (internal template)
metadata:
  repo: umi-pro-stencil
  stack: "@umijs/max(umi4) + Ant Design Pro v6"
---

# umi-pro-stencil 开发约定

本仓是 `@umijs/max`（umi 4）+ **Ant Design Pro v6** 技术栈的项目模板。下列约定让所有人（含 AI）写出风格一致、放置正确的代码。**动手前先想清楚：你要加的东西属于哪一类、放哪个目录、用哪种范式。** 拿不准时，照仓里的"参照文件"模仿，比凭空发挥更可靠。代码细节范式见 `references/patterns.md`。

## 技术栈（默认遵循，不要降级或替换）
- 框架：`@umijs/max` 4.6（umi 4）· React 19 · TypeScript 6 · 打包器 **utoopack**（`.umirc.ts` 里 `utoopack: {}`）
- UI：**antd 6** · **@ant-design/pro-components 3** · **@ant-design/icons 6**
- 样式：**Tailwind v4 + antd-style + CSS Modules**（禁止 less）
- 数据：**@tanstack/react-query**（经 umi 内置 `reactQuery` 插件）
- 质量：**Biome**（格式化 + lint）· **Vitest**（测试）· conventional commits · `react-doctor`
- 国际化：**未启用 i18n**（`app.ts` 里 `menu.locale: false`）；如需启用再配 umi `locale` 插件、文案进 `src/locales/`。

## 目录职责：什么代码放哪里

每一类代码都有唯一归属。按下表放置，不要随手塞进页面文件。

| 目录 | 放什么 | 怎么放（含参照文件） |
| --- | --- | --- |
| `src/services/<模块>/` | **接口调用（手写）** | 请求函数写在 `XxxController.ts`（`request<API.XxxResult>(url, {...})`）；API 类型写在 `typings.d.ts`（`declare namespace API`）；`index.ts` 默认导出 `{ XxxController }`。参照 `src/services/demo/`。详见 references/patterns.md。 |
| `src/components/<Name>/` | **跨页面共享组件** | 一个组件一个目录，入口 `index.ts(x)`。参照 `src/components/Guide/`、`src/components/QueryDemo/`。 |
| `src/hooks/` | **自定义 React hooks** | 一个 hook 一个文件，命名 `useXxx.ts`。跨页面复用的逻辑钩子集中此处，**不要散落在组件文件里**。 |
| `src/pages/<Page>/` | **路由页面** | 入口 `index.tsx`；**仅该页用的组件**放 `<Page>/components/`（参照 `src/pages/Table/components/`）。页面需在 `.umirc.ts` 的 `routes` 注册。 |
| `src/models/` | **全局/跨组件客户端状态** | umi model（导出 hook），`useModel('名字')` 消费。参照 `src/models/global.ts`。 |
| `src/utils/` | **纯工具函数** | 无副作用、可单测。参照 `src/utils/format.ts`。 |
| `src/constants/` | **常量 / 枚举** | 集中魔法值、字典。参照 `src/constants/index.ts`。 |
| `src/assets/` | **静态资源** | 图片、svg 等。 |
| `src/access.ts` | **权限定义** | 基于 `getInitialState` 返回权限对象，路由 `access` 字段 / `useAccess()` / `<Access>` 消费。 |
| `src/app.ts(x)` | **运行时配置** | `getInitialState`、`layout`、`request`（拦截器/统一错误）、`rootContainer` 等。 |
| `.umirc.ts` | **构建/插件/路由配置** | 插件（antd/access/model/request/reactQuery/tailwindcss/utoopack）+ `routes`。 |
| `mock/` | **本地接口 mock** | `mock/<模块>API.ts`，`export default { 'GET /api/...': handler }`，响应遵循后端信封。 |

> 判断口诀：这是**接口**？**组件**？**hook**？**纯函数**？**常量**？**全局状态**？**路由/权限**？对号入座。

## 接口与后端响应信封（手写 service）

- 请求一律 `import { request } from '@umijs/max'`，在 `src/services/<模块>/XxxController.ts` 里**手写** `request<API.XxxResult>(url, { method, params, data, headers })`。
  - 注：`src/services/demo/*` 文件头的 “OneAPI 自动生成” 是模板遗留——本项目接口**手写**，照 demo 的 `request` 写法即可（可删掉那行误导性注释）。
- **后端统一响应信封**：`{ code: number; data: T; message: string }`，**`code === 200` 为成功**；成功取 `data`，失败用 `message` 提示。
- 推荐在 `src/app.ts` 配 umi `request` 的 `errorConfig`，按 `code === 200` 统一解包/抛错，让业务层只拿 `data`、错误集中提示（模板当前为默认 `request: {}`，这是团队可加的统一层）。
- 列表分页结构：`{ current, pageSize, total, list }`。
- 详细写法（含 `errorConfig`、ProTable `request` 适配、API 类型范式）见 `references/patterns.md`。

## 样式：三件套分工（禁止 less）

按"该用哪种"选择，不要混用错位：
- **Tailwind v4** —— 布局、间距、尺寸、flex 等原子化场景，直接 `className="pt-20 flex gap-2"`。
- **antd-style `createStyles`** —— 需要读 antd **主题 token**（颜色/圆角随主题变）的组件样式。参照 `src/components/Guide/Guide.tsx`。
- **CSS Modules（`*.module.css`）** —— 组件级、需要隔离的自定义样式：`import styles from './index.module.css'` → `className={styles.x}`。参照 `src/components/QueryDemo/`。
- ❌ 不写 `.less`，不引入 less 相关依赖。

## 数据请求：React Query

- 服务端状态用 `@tanstack/react-query`：`import { useQuery, useMutation } from '@umijs/max'`（umi `reactQuery` 插件已挂好全局 Provider）。参照 `src/components/QueryDemo/`。
- `queryFn` 调 `src/services/<模块>/` 里的请求函数——**职责分离**：services 管"怎么请求"，组件管"何时用、怎么缓存"。
- 表格用 `ProTable` 自带的 `request` 属性（它不是 useRequest），其返回需是 `{ data: 列表, success: boolean, total }`——把后端 `code===200`→`success`、`data.list`→`data`、`data.total`→`total`。参照 `src/pages/Table/index.tsx`。
- ❌ 不用 ahooks 的 `useRequest`，不用裸 `fetch`/`axios`（统一走 umi `request`）。

## 路由 / 菜单 / 权限

- 路由在 `.umirc.ts` 的 `routes`：`{ path, name(菜单名), component, access(权限名), routes(嵌套), redirect }`。
- 权限在 `src/access.ts` 定义（基于 `app.ts` 的 `getInitialState` 初始数据），路由用 `access: '权限名'` 守卫，元素级用 `useAccess()` / `<Access>`。
- 详见 `references/patterns.md`。

## 命名与类型

- 组件目录与组件名 **PascalCase 且一致**；hook `useXxx`；service controller `XxxController`，请求函数动词开头 camelCase（`queryXxx`/`addXxx`/`modifyXxx`/`deleteXxx`）。
- 组件 props 用 `interface XxxProps`；API 出入参类型挂 `declare namespace API`（`typings.d.ts`），请求体用 `XxxVO`；枚举用字符串字面量联合（如 `'MALE' | 'FEMALE'`）。
- 常量用对象/`as const` 或 `UPPER_SNAKE`。少用 `any`（必要时局部）。

## 状态选型（选对工具）
- **服务端数据**（来自接口）→ React Query。
- **跨组件客户端状态** → `src/models/`（umi model）。
- **局部状态** → `useState` / `useReducer`。

## UI 优先用 ProComponents
表格 → `ProTable`；表单 → `ProForm` / `ModalForm`；详情 → `ProDescriptions`；页容器 → `PageContainer`。能用 Pro 组件就不手搓。

## 导入与基础约定
- 框架能力一律从 **`@umijs/max`** 导入（`useModel`/`useQuery`/`request`/`history`/`Access` 等），**不要从 `'umi'` 导入**。
- 用 **`@/`** 别名指向 `src`（如 `import { trim } from '@/utils/format'`）。
- 日期用 **dayjs**（不用 moment）；组合 className 用 **clsx**。

## 工具链与提交
- **格式化/lint 用 Biome**：`npm run format`、`npm run lint`（biome + `tsc`）。不引 prettier/eslint/stylelint。
- **测试用 Vitest**：测试文件与源码**同目录**，命名 `*.test.tsx`（参照 `src/components/Guide/Guide.test.tsx`）。`npm test` 运行。
- **提交**走 conventional commits（`feat:`/`fix:`/`refactor:`/`chore:`/`test:`/`docs:`…），`max verify-commit` 在 commit-msg 阶段校验。
- 可选 `npm run doctor`（react-doctor）做 React 反模式体检。

## 新增东西的快速配方
- **加页面**：`src/pages/<Page>/index.tsx` → `.umirc.ts` `routes` 注册（按需加 `access`）→ 页内私有组件放 `<Page>/components/`。
- **加接口**：`src/services/<模块>/XxxController.ts` 手写请求函数 + `typings.d.ts` 补 `API.*` 类型（含 `Result` 信封）→ 组件用 `useQuery`/`useMutation` 调用。
- **加共享组件**：`src/components/<Name>/index.tsx`（需隔离样式再加 `index.module.css`）。
- **加 hook**：`src/hooks/useXxx.ts`。
- **加工具/常量**：分别进 `src/utils/`、`src/constants/`。

## 反模式（不要做）
- 把接口请求散写在组件/页面里 → 应进 `src/services/`；裸 `fetch`/`axios` → 用 umi `request`。
- 把可复用 hook 写在组件文件里 → 应进 `src/hooks/`。
- 用 `.less` 或在组件里堆内联样式 → 用三件套。
- 用 `useRequest` / `moment` / `from 'umi'`。
- 引入 prettier/eslint/stylelint → 统一用 Biome。
- 降级 antd / pro-components / React 大版本，或绕开 utoopack。
