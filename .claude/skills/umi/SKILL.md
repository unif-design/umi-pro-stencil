---
name: umi
description: >-
  所有 @umijs/max(umi 4) 项目的通用开发基线——PC 与移动端共享。在任何 umi 项目里写/改代码前先查阅：
  代码归位、组件/页面内部结构、接口与后端信封、React Query 数据、路由/权限、命名、导入、类型、工具链。
  规定各类代码放哪个目录、私有就近+单数+平铺的内部结构、`{code,data,message}` 信封怎么取数判错，
  及强制基线（React 19 / TS 6 / utoopack / React Query / Biome / Vitest / 统一 @umijs/max 导入 / dayjs）。
  在 umi 项目里写代码就用它。平台叠加：PC 见 project-conventions skill，antd 组件用法见 antd skill。
license: Proprietary
metadata:
  scope: shared (PC + mobile)
---

# umi 通用开发基线（PC / 移动端共享）

所有 umi 项目的通用约定。**平台特定的另看：PC/Web → project-conventions skill；antd 组件 → antd skill；移动端 → mobile skill。** 目录结构图见 [assets/directory-structure.html](assets/directory-structure.html)，可抄代码见 [references/patterns.md](references/patterns.md)。

核心：**① 代码放哪个目录；② 私有就近、复用上提。**

## 技术栈基线（所有 umi 项目）
`@umijs/max` 4(umi 4) · React 19 · TypeScript 6 · 打包 **utoopack** · 数据 **@tanstack/react-query** · 质量 **Biome + Vitest** · 日期 **dayjs** · className **clsx**。（UI 库/样式按平台：PC=antd6+pro-components3，见 project-conventions。）

## 一、代码归位

| 目录 | 放什么 |
| --- | --- |
| `src/pages/<Page>/` | 路由页面（入口 `index.tsx`），私有内容就近（§二） |
| `src/components/<Name>/` | 跨页面复用的组件（§二） |
| `src/services/<模块>/` | 接口：`XxxController.ts`(手写 request) + `typings.d.ts`(`API.*`) + `index.ts` |
| `src/hooks/` | 跨组件复用 hook（`useXxx.ts`） |
| `src/models/` | 全局/跨组件状态（umi model + `useModel`） |
| `src/types/` | 全局/跨模块 TS 类型（`*.d.ts`） |
| `src/utils/` · `src/constants/` · `src/assets/` | 全局纯函数 · 常量/枚举 · 静态资源 |
| `src/access.ts` · `src/app.tsx` | 权限定义 · 运行时（getInitialState/layout/request errorConfig） |
| `config/` | `config.ts`(主) + `routes.ts` + `defaultSettings.ts` + `proxy.ts` |
| `mock/` | 本地接口 mock（遵循信封） |

## 二、组件 / 页面内部结构

**私有就近、复用上提**：只在某组件/页面用的就放它目录里；≥2 处复用才提到 `src/` 公共目录。

```
components/Alert/              pages/Article/
├─ index.tsx       入口        ├─ index.tsx        页面入口（config/routes.ts 注册）
├─ Alert.tsx       主组件       ├─ ArticleModal.tsx 私有子组件（平铺）
├─ AlertItem.tsx   私有子组件    ├─ hook.ts          私有方法/逻辑
├─ hook.ts         私有方法      ├─ util.ts          私有工具
├─ util.ts         私有工具      ├─ constant.ts      私有常量
├─ constant.ts     私有常量      ├─ type.ts          私有类型
├─ type.ts         私有类型      └─ index.style.ts   样式（CSS-in-JS）
└─ index.style.ts  样式
```
- 私有子组件**直接平铺**（`AlertItem.tsx`），**不套 `components/` 子目录**。
- 私有文件用**单数**：`hook.ts`/`util.ts`/`constant.ts`/`type.ts`（顶层 `src/` 公共目录仍复数）。
- 组件样式放 **`index.style.ts`**（CSS-in-JS）；外部只从入口引（`@/components/Alert`），不深引内部文件。极简组件可只留 `index.tsx`。

## 三、接口与响应信封
- 手写在 `src/services/<模块>/XxxController.ts`：`request<API.XxxResult>(url,{method,params,data})` from `@umijs/max`。
- 信封 **`{ code, data, message }`**：`code===200` 成功取 `data`，失败用 `message`。
- 列表分页 `{ current, pageSize, total, list }`。统一解包/报错配在 `src/app.tsx` 的 request errorConfig。
- ❌ 不裸用 `fetch`/`axios`。

## 四、数据请求（React Query）
- 服务端状态 `useQuery`/`useMutation`（from `@umijs/max`，`reactQuery` 插件已挂 Provider）；`queryFn` 调 `services/`。
- `queryKey` 用数组含参；写操作后 `invalidateQueries` 刷新。
- ❌ 不用 `useRequest`。

## 五、类型
全局/跨模块 → `src/types/`；接口出入参 → `services/<模块>/typings.d.ts`（`declare namespace API`，请求体 `XxxVO`，枚举用字符串字面量联合）；组件私有 → 组件内 `type.ts`（props 用 `interface XxxProps`）。少用 `any`。

## 六、路由 / 权限
路由在 `config/routes.ts`：`{ path, name, component, access, routes, redirect }`；权限在 `src/access.ts` 定义，路由 `access` 守卫，元素级 `useAccess()` / `<Access>`。

## 七、状态选型
服务端数据 → React Query · 跨组件客户端态 → `src/models/` · 局部 → `useState`/`useReducer`。

## 八、命名
| 类别 | 约定 |
| --- | --- |
| 组件目录/组件 | PascalCase 且一致 |
| 自定义 hook | `useXxx` |
| service / 请求函数 | `XxxController` / 动词开头 camelCase（`queryUserList`） |
| props / API / 请求体 | `XxxProps` / `API.Xxx` / `XxxVO` |
| 常量 | `UPPER_SNAKE` 或 `as const` 对象 |
| 顶层公共目录 / 内部私有文件 | 复数（`hooks/`）/ **单数**（`hook.ts`） |
| 普通文件 / 路由 path | camelCase / kebab-case |

## 九、导入与工具链
- 一律 `from '@umijs/max'`（非 `'umi'`）；`@/` 指 `src`；日期 dayjs；className 用 clsx；只用函数组件。
- **Biome** 格式化+lint（非 prettier/eslint/stylelint）；**Vitest**（`*.test.tsx` 同目录）；提交走 conventional commits（`max verify-commit`）。

## 十、错误 / 加载 / 空态
加载 → loading 态占位；空 → 空态组件；错误 → 接口经 errorConfig 统一提示、渲染期用错误边界、表单走字段校验。（具体组件按平台 UI 库。）

## 反模式
裸写接口请求(进 services/) · 接口裸 `fetch` · `useRequest`/`moment`/`from 'umi'` · 用 model 存接口数据 · 私有子组件套 `components/` · 私有文件用复数 · prettier/eslint/stylelint · 降级 React/umi 大版本或绕开 utoopack。
