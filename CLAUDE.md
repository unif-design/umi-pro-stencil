# umi-pro-stencil

`@umijs/max`(umi 4) + **Ant Design Pro v6** Web 端模板。React 19 · TS 6 · antd 6 · pro-components 3 · 打包 utoopack。

## Skills（分层）
- **umi**（`.claude/skills/umi/`）：所有 umi 项目通用基线——代码归位、组件/页面内部结构、services/信封、React Query、路由/权限、命名、导入、工具链。**PC 与移动端共享。**
- **project-conventions**（`.claude/skills/project-conventions/`）：PC/Web 专属——antd6/pro3 栈、ProComponents 铁律、桌面样式。建立在 umi 之上。
- **antd**（`.claude/skills/antd/`）：antd 组件用法——`npx antd info` 先查再写。

## 必守约定（详见上述 skills）

- **代码归位**：接口→`src/services/<模块>/`；复用组件→`src/components/<Name>/`；复用 hook→`src/hooks/`；全局类型→`src/types/`；纯函数→`src/utils/`；常量→`src/constants/`；全局态→`src/models/`；页面→`src/pages/<Page>/`；构建/路由→`config/`。
- **内部结构**：私有就近——子组件**平铺**（不套 `components/`）、私有文件**单数**（`hook.ts`/`util.ts`/`constant.ts`/`type.ts`）、样式 `index.style.ts`；外部只从 `index` 引；≥2 处复用才提到 `src/`。
- **接口**：手写 `services/`（`@umijs/max` 的 `request`）；信封 `{ code, data, message }`，`code===200` 成功取 `data`、失败用 `message`。
- **数据**：React Query（`useQuery`/`useMutation` from `@umijs/max`）；表格用 ProTable `request`；**不用 useRequest**。
- **组件（PC）**：优先 **ProComponents → antd**，**禁止重复造已有组件**；自定义也基于 antd 改造；写 antd 前 `npx antd info`。
- **样式（PC）**：组件 `index.style.ts`(antd-style token) + 布局 Tailwind；颜色走 token/cssVar；**禁 less / 静态内联**。
- **导入/工具链**：一律 `from '@umijs/max'`（非 `'umi'`）、`@/` 指 `src`、日期 dayjs；Biome 格式化+lint、Vitest(`*.test.tsx` 同目录)、conventional commits（`max verify-commit`）。

新增/修改代码前先查 **umi**（通用）+ **project-conventions**（PC）skill。

> skills 遵循开放 **Agent Skills** 标准（agentskills.io），跨工具通用：Claude Code 读 `.claude/skills/`；VS Code/Copilot/Cursor 等读 `.agents/skills/`（已软链同源）。
