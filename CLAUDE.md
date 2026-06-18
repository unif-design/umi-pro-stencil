# umi-pro-stencil

`@umijs/max`（umi 4）+ **Ant Design Pro v6** 项目模板。React 19 · TypeScript 6 · antd 6 · @ant-design/pro-components 3 · @ant-design/icons 6 · 打包器 **utoopack**。

## 必守约定（完整 playbook 见 `.claude/skills/project-conventions/SKILL.md`）

- **代码归位**：接口 → `src/services/<模块>/`（`XxxController.ts` + `typings.d.ts`）；共享组件 → `src/components/<Name>/`；自定义 hook → `src/hooks/useXxx.ts`；纯函数 → `src/utils/`；常量 → `src/constants/`；全局状态 → `src/models/`；页面 → `src/pages/<Page>/`（私有组件放 `<Page>/components/`）。
- **样式**：Tailwind（布局/间距）+ antd-style `createStyles`（token 相关）+ CSS Modules（`*.module.css` 隔离）；**禁止 less**。
- **数据**：React Query（`useQuery`/`useMutation` from `@umijs/max`）；表格用 ProTable `request`；**不用 useRequest**。
- **接口**：手写在 `src/services/<模块>/`（`@umijs/max` 的 `request`）；后端信封 `{ code, data, message }`——`code===200` 为成功、取 `data`、失败用 `message`。
- **导入**：一律 `from '@umijs/max'`（不要 `'umi'`），`@/` 指向 `src`；日期用 dayjs（不用 moment）。
- **工具链**：Biome 做格式化+lint（不用 prettier/eslint/stylelint）；测试用 Vitest（`*.test.tsx` 与源码同目录）；提交走 conventional commits（`max verify-commit` 校验）。

新增或修改代码前，请先查阅 `.claude/skills/project-conventions/SKILL.md`（完整目录职责、样式分工、数据范式），代码可抄范式见 `.claude/skills/project-conventions/references/patterns.md`。

> 该 skill 遵循开放 **Agent Skills** 标准（agentskills.io），跨 agent 工具通用。Claude Code 读 `.claude/skills/`；VS Code/Copilot/Cursor/Gemini 等读 `.agents/skills/`（仓内已软链至同一份）。
