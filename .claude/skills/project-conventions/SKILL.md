---
name: project-conventions
description: >-
  umi-pro-stencil（@umijs/max + Ant Design Pro v6）Web 端开发标准。在本仓写/改任何前端代码前先查阅：
  加页面、写组件、调接口、写 hook/工具/常量/类型、写表单表格、配路由权限、写样式、处理加载/错误/空态、引依赖。
  规定代码归位、组件/页面内部结构、ProComponents/antd 用法（优先现成、不造轮子）、后端信封怎么取数判错，
  及强制栈（antd6 / pro-components3 / antd-style+Tailwind / React Query / Biome / 统一 @umijs/max 导入 / dayjs）。
  在这个 umi/antd 项目里写代码就用它，无需用户点名。antd 组件细节另见 antd skill。
license: Proprietary
metadata:
  repo: umi-pro-stencil
  scope: web
---

# umi-pro-stencil 开发标准（Web）

`@umijs/max`(umi 4) + **Ant Design Pro v6** 后台模板。写代码前先确认：**① 放哪个目录；② 能用 Pro/antd 现成的就别自己写。** 目录结构图见 [assets/directory-structure.html](assets/directory-structure.html)，可抄代码见 [references/patterns.md](references/patterns.md)，antd 组件用法见 **antd skill**（先 `npx antd info` 查再写）。

## 速查

| 我要… | 怎么做 |
| --- | --- |
| 调接口 | `services/<模块>/XxxController.ts` 手写 `request`；信封 `{code,data,message}`、`code===200` 成功 |
| 做表格 | `ProTable`（别自造）；`request` 返回 `{data,success,total}` |
| 做表单 | `ProForm` / `ModalForm`（别自造） |
| 写 antd 组件 | 先 `npx antd info <X>`（antd skill），别凭记忆猜 API |
| 加组件 | 先找 Pro/antd 现成；确需自定义也**基于 antd 基础组件改造/封装**，建 `components/<Name>/` |
| 弹提示/确认 | `App.useApp()` 的 `message`/`modal`（非静态） |
| 写样式 | 组件样式→`index.style.ts`(antd-style)；布局/间距→Tailwind；禁 less |
| 取数据 | React Query `useQuery`/`useMutation`（非 useRequest） |
| 加 hook/类型/常量 | 跨范围复用→`hooks/`·`types/`·`constants/`；私有→组件/页面内 `hook.ts`/`type.ts`/`constant.ts` |
| 配路由/权限 | `config/routes.ts` + `src/access.ts` |
| 导入 | 一律 `from '@umijs/max'`；`@/` 指 `src` |

## 技术栈（默认遵循，不降级）
React 19 · TS 6 · antd 6 · @ant-design/pro-components 3 · @ant-design/icons 6 · 打包 utoopack · 数据 @tanstack/react-query · 样式 antd-style + Tailwind · 质量 Biome + Vitest · 日期 dayjs · i18n 未启用。

## 一、代码归位

| 目录 | 放什么 |
| --- | --- |
| `src/pages/<Page>/` | 路由页面（入口 `index.tsx`），私有内容就近（见 §二） |
| `src/components/<Name>/` | 跨页面复用的**业务组件**（antd/Pro 组合封装，见 §二、§三） |
| `src/services/<模块>/` | 接口：`XxxController.ts`(手写 request) + `typings.d.ts`(`API.*`) + `index.ts` |
| `src/hooks/` | 跨组件复用 hook（`useXxx.ts`） |
| `src/models/` | 全局/跨组件状态（umi model + `useModel`） |
| `src/types/` | 全局/跨模块 TS 类型（`*.d.ts`） |
| `src/utils/` · `src/constants/` · `src/assets/` | 全局纯函数 · 常量/枚举 · 静态资源 |
| `src/access.ts` · `src/app.tsx` | 权限定义 · 运行时（getInitialState/layout/request errorConfig） |
| `config/` | `config.ts`(主) + `routes.ts` + `defaultSettings.ts` + `proxy.ts` |
| `mock/` | 本地接口 mock（遵循信封） |

## 二、组件 / 页面内部结构

**私有就近、复用上提**：只在某组件/页面用的就放它目录内（单数文件 + 子组件平铺）；≥2 处复用才提到 `src/` 公共目录。

```
components/Alert/                 pages/Article/
├─ index.tsx        入口          ├─ index.tsx        页面入口（config/routes.ts 注册）
├─ Alert.tsx        主组件         ├─ ArticleModal.tsx 私有子组件（直接平铺）
├─ AlertItem.tsx    私有子组件      ├─ hook.ts          私有方法/逻辑
├─ hook.ts          私有方法/逻辑   ├─ util.ts          私有工具
├─ util.ts          私有工具        ├─ constant.ts      私有常量
├─ constant.ts      私有常量        ├─ type.ts          私有类型
├─ type.ts          私有类型        └─ index.style.ts   样式（antd-style）
└─ index.style.ts   样式（antd-style）
```
- **私有子组件直接平铺**（`AlertItem.tsx`），**不套 `components/` 子目录**。
- **私有文件用单数**：`hook.ts` / `util.ts` / `constant.ts` / `type.ts`（顶层 `src/` 公共目录仍复数）。
- 外部只从入口引（`@/components/Alert`），**不深引内部文件**。极简组件可只留 `index.tsx`。

## 三、组件铁律（能用现成的就不自己写）
- 优先级 **ProComponents → antd → 自定义（万不得已）**。后台 UI（表格/表单/弹窗/抽屉/详情/布局/上传）Pro+antd 几乎全覆盖，**禁止重复造已有组件**。
- `components/` 放**业务组件**——antd/Pro 的组合封装，不是重写基础 UI。
- 即便要自定义，也**优先基于 antd 基础组件改造/封装**（如基于 `Card`/`List`/`Table`/`Form` 扩展），不从零用裸 div 手搓。
- 写 antd 前先用 **antd skill**（`npx antd info <X>`）查 API，别凭记忆。

## 四、接口与响应信封
- 手写在 `src/services/<模块>/XxxController.ts`：`request<API.XxxResult>(url,{method,params,data})` from `@umijs/max`。
- 信封 **`{ code, data, message }`**：`code===200` 成功取 `data`，失败用 `message`。
- 列表分页 `{ current, pageSize, total, list }`；`ProTable` 的 `request` 返回 `{ data, success, total }`。
- 统一解包/报错配在 `src/app.tsx` 的 `request` errorConfig（或独立 `src/requestErrorConfig.ts`）。
- ❌ 不裸用 `fetch`/`axios`。

## 五、样式（禁 less）
- **组件样式 → `index.style.ts`**：antd-style `createStyles`，读主题 token（颜色/圆角随主题）。
- **布局/间距/尺寸 → Tailwind** 原子类。
- **CSS Modules（`*.module.css`）** 仅作隔离场景的备选。
- 颜色走 token / cssVar，**不硬编码**；不堆静态内联样式。

## 六、数据请求（React Query）
- 服务端状态 `useQuery`/`useMutation`（from `@umijs/max`，`reactQuery` 插件已挂 Provider）；`queryFn` 调 `services/`。
- `queryKey` 用数组含参；写操作后 `invalidateQueries` 刷新；表格直接用 `ProTable` 的 `request`。
- ❌ 不用 `useRequest`。

## 七、类型
- 全局/跨模块 → `src/types/`；接口出入参 → `services/<模块>/typings.d.ts`（`declare namespace API`，请求体 `XxxVO`，枚举用字符串字面量联合）；组件私有 → 组件内 `type.ts`（props 用 `interface XxxProps`）。少用 `any`。

## 八、路由 / 权限
- 路由在 `config/routes.ts`：`{ path, name(菜单), component, access, routes, redirect }`。
- 权限在 `src/access.ts` 定义；路由 `access` 守卫，元素级 `useAccess()` / `<Access>`。

## 九、状态选型
服务端数据 → React Query · 跨组件客户端态 → `src/models/` · 局部 → `useState`/`useReducer`。

## 十、命名
| 类别 | 约定 |
| --- | --- |
| 组件目录/组件 | PascalCase 且一致（`UserCard/UserCard.tsx`） |
| 自定义 hook | `useXxx` |
| service / 请求函数 | `XxxController` / 动词开头 camelCase（`queryUserList`） |
| props / API / 请求体 | `XxxProps` / `API.Xxx` / `XxxVO` |
| 常量 | `UPPER_SNAKE` 或 `as const` 对象 |
| 顶层公共目录 / 内部私有文件 | 复数（`hooks/`）/ **单数**（`hook.ts`） |
| 普通文件 / 路由 path | camelCase / kebab-case |

## 十一、错误 / 加载 / 空态
加载 → `Skeleton`/`Spin`（表格交给 ProTable）；空 → `Empty`（Pro 自带）；错误 → 接口经 errorConfig 统一提示、渲染期用错误边界、表单走字段校验。

## 十二、性能
路由分包 umi 自动；`memo`/`useMemo`/`useCallback` 按需用（热路径/稳定引用/重计算）；列表用稳定 `key`（id，非 index）；用 React Query 缓存/`staleTime` 减重复请求。

## 十三、导入与工具链
- 一律 `from '@umijs/max'`（非 `'umi'`）；`@/` 指 `src`；日期 dayjs；className 用 clsx；只用函数组件。
- **Biome** 格式化+lint（`npm run format`/`lint`，非 prettier/eslint/stylelint）；**Vitest**（`*.test.tsx` 同目录）；提交走 conventional commits（`max verify-commit`）；`npm run doctor`（react-doctor）。

## 十四、依赖与安全
加依赖前先问 antd/Pro/umi/原生是否已有，**能不加就不加**；包管理 pnpm；密钥走环境变量；慎用 `dangerouslySetInnerHTML`；提交前清 `console.log`。

## ✅ / ❌ 易错对照
- ✅ `from '@umijs/max'` ❌ `from 'umi'`
- ✅ `App.useApp().message` ❌ 静态 `message.xxx`
- ✅ `ProTable`/`ProForm` ❌ 自己写表格/表单
- ✅ `from 'antd'` ❌ `from 'antd/es/...'`
- ✅ 私有子组件平铺 `AlertItem.tsx` ❌ 套 `components/AlertItem.tsx`
- ✅ 接口进 `services/` ❌ 组件里裸 `fetch`
- ✅ 组件样式 `index.style.ts` ❌ `.less` / 静态内联

## 反模式
裸写接口请求 · 重复造 antd/Pro 已有组件 · 深引 `antd/es/...` · 静态 `message` · `.less`/静态内联 · `useRequest`/`moment`/`from 'umi'` · 用 model 存接口数据 · prettier/eslint/stylelint · 降级 antd/Pro/React 大版本或绕开 utoopack。

## 新增配方
- **页面**：`pages/<Page>/index.tsx` → `config/routes.ts` 注册 → 私有内容就近平铺。
- **接口**：`services/<模块>/XxxController.ts` + `typings.d.ts` → 组件 `useQuery`/`useMutation` 调。
- **组件**：先确认 Pro/antd 无现成，再建 `components/<Name>/`（结构见 §二）。
- **hook/类型/常量**：复用进 `hooks/`·`types/`·`constants/`；私有就近 `hook.ts`/`type.ts`/`constant.ts`。
