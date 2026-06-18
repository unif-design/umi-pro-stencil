# umi-pro-stencil

`@umijs/max`(umi 4) + **Ant Design Pro v6** Web 端模板。React 19 · TS 6 · antd 6 · pro-components 3 · 打包 utoopack。完整标准见 `.claude/skills/project-conventions/SKILL.md`（速查 / 目录结构 / 代码范式），antd 组件用法见 `.claude/skills/antd/`。

## 必守约定

- **代码归位**：接口→`src/services/<模块>/`；复用组件→`src/components/<Name>/`；复用 hook→`src/hooks/`；全局类型→`src/types/`；纯函数→`src/utils/`；常量→`src/constants/`；全局态→`src/models/`；页面→`src/pages/<Page>/`；构建/路由→`config/`（`config.ts` + `routes.ts`）。
- **组件/页面内部（私有就近）**：私有子组件**直接平铺**（不套 `components/`）；私有文件用**单数** `hook.ts`/`util.ts`/`constant.ts`/`type.ts`；样式 `index.style.ts`(antd-style)；外部只从 `index` 引。≥2 处复用才提到 `src/`。
- **组件铁律**：优先 **ProComponents → antd → 自定义**，**禁止重复造已有组件**；写 antd 前先 `npx antd info`（antd skill）。
- **接口**：手写 `services/`（`@umijs/max` 的 `request`）；信封 `{ code, data, message }`，`code===200` 成功取 `data`、失败用 `message`。
- **数据**：React Query（`useQuery`/`useMutation` from `@umijs/max`）；表格用 ProTable `request`；**不用 useRequest**。
- **样式**：组件样式 `index.style.ts`(antd-style token) + 布局用 Tailwind；颜色走 token/cssVar；**禁 less / 静态内联**。
- **antd**：`message`/`modal` 用 `App.useApp()`（非静态）；组件从 `antd` 顶层引（不深引 `antd/es/...`）。
- **导入/工具链**：一律 `from '@umijs/max'`（非 `'umi'`）、`@/` 指 `src`、日期 dayjs；Biome 格式化+lint、Vitest(`*.test.tsx` 同目录)、conventional commits（`max verify-commit`）。

新增/修改代码前先查阅 `.claude/skills/project-conventions/SKILL.md`。

> skills 遵循开放 **Agent Skills** 标准（agentskills.io），跨工具通用：Claude Code 读 `.claude/skills/`；VS Code/Copilot/Cursor/Gemini 等读 `.agents/skills/`（已软链同源）。
