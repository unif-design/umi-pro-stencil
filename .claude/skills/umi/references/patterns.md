# umi 通用代码范式（umi skill 配套）

SKILL.md 给规则，这里给可抄代码（PC/移动端通用）。以"文章 Article"为例。PC 专属（ProTable/ProForm/App.useApp 等）见 project-conventions skill 的 `references/pc-patterns.md`。

## 1. API 类型与信封（`src/services/article/typings.d.ts`）

```ts
declare namespace API {
  interface Result<T = unknown> { code: number; data: T; message: string } // 200=成功
  interface PageInfo<T = unknown> { current: number; pageSize: number; total: number; list: T[] }

  type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE';
  interface Article { id: string; title: string; status: ArticleStatus }
  interface ArticleVO { title: string; status: ArticleStatus } // 请求体用 VO
}
```

## 2. 手写 service（`src/services/article/`）

`ArticleController.ts`：
```ts
import { request } from '@umijs/max';

export async function queryArticleList(params: { current?: number; pageSize?: number }) {
  return request<API.Result<API.PageInfo<API.Article>>>('/api/articles', { method: 'GET', params });
}
export async function addArticle(body: API.ArticleVO) {
  return request<API.Result<API.Article>>('/api/articles', { method: 'POST', data: body });
}
```
`index.ts`：`import * as ArticleController from './ArticleController'; export default { ArticleController };`
用：`import services from '@/services/article'` → `services.ArticleController.queryArticleList(...)`。

## 3. 统一信封处理（`src/app.tsx` 的 request errorConfig）

```ts
import type { RequestConfig } from '@umijs/max';

export const request: RequestConfig = {
  errorConfig: {
    errorThrower(res: API.Result) {
      if (res?.code !== 200) {
        const err: any = new Error(res?.message || '请求失败');
        err.name = 'BizError'; err.info = res; throw err;
      }
    },
    errorHandler(err: any) {
      // 全局兜底提示（具体提示组件按平台 UI 库）
      console.error(err?.message);
    },
  },
};
```
> 配置量大时抽到 `src/requestErrorConfig.ts`，由 `app.tsx` 引用。

## 4. 组件目录结构（平铺 + 私有单数文件 + index.style.ts）

```
src/components/ArticleCard/
├─ index.tsx        # 唯一对外入口
├─ ArticleCard.tsx  # 主组件（与目录同名）
├─ ArticleTag.tsx   # 私有子组件（直接平铺，不套 components/）
├─ hook.ts · util.ts · constant.ts · type.ts   # 私有方法/工具/常量/类型（单数）
└─ index.style.ts   # 样式（antd-style createStyles）
```
`type.ts`：`export interface ArticleCardProps { article: API.Article }`
`index.style.ts`：
```ts
import { createStyles } from 'antd-style';
export const useStyles = createStyles(({ token }) => ({
  card: { padding: 12, border: `1px solid ${token.colorBorder}`, borderRadius: token.borderRadius },
}));
```
`ArticleCard.tsx`：
```tsx
import { useStyles } from './index.style';
import type { ArticleCardProps } from './type';

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { styles } = useStyles();
  return <div className={styles.card}>{article.title}</div>;
};
export default ArticleCard;
```
`index.tsx`：`export { default } from './ArticleCard'; export type { ArticleCardProps } from './type';`
外部：`import ArticleCard from '@/components/ArticleCard'`（不深引内部文件）。页面私有组件同构，平铺在 `pages/<Page>/`。

## 5. React Query

```tsx
import { useQuery, useMutation, useQueryClient } from '@umijs/max';
import services from '@/services/article';

const qc = useQueryClient();
const { data, isLoading } = useQuery({
  queryKey: ['articles', { current: 1 }],
  queryFn: () => services.ArticleController.queryArticleList({ current: 1 }),
  staleTime: 60_000,
});
const { mutate: create } = useMutation({
  mutationFn: services.ArticleController.addArticle,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }),
});
```

## 6. hook：私有 vs 复用
仅本组件/页面用 → 目录内 `hook.ts`；≥2 处复用 → `src/hooks/useXxx.ts`。

## 7. 常量（`src/constants/index.ts`）

```ts
export const ARTICLE_STATUS = { DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', OFFLINE: 'OFFLINE' } as const;
export const ARTICLE_STATUS_LABEL: Record<API.ArticleStatus, string> = {
  DRAFT: '草稿', PUBLISHED: '已发布', OFFLINE: '已下线',
};
```

## 8. 路由 + 权限
`config/routes.ts`：`{ name: '文章管理', path: '/article', component: './Article', access: 'canSeeArticle' }`
`src/access.ts`：`export default (initialState: API.UserInfo) => ({ canSeeArticle: !!initialState });`
元素级：`const access = useAccess(); <Access accessible={access.canSeeArticle}>...</Access>`（`from '@umijs/max'`）。

## 9. 全局类型（`src/types/common.d.ts`）

```ts
declare global {
  type ID = string | number;
  interface Option<T = string> { label: string; value: T }
}
export {};
```

## 10. Mock（`mock/articleAPI.ts`，遵循信封）

```ts
export default {
  'GET /api/articles': (_: any, res: any) =>
    res.json({ code: 200, message: 'ok', data: { current: 1, pageSize: 10, total: 1, list: [{ id: '1', title: 'Hello', status: 'PUBLISHED' }] } }),
};
```
