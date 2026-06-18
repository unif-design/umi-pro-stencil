# 代码范式参照（project-conventions 配套）

SKILL.md 给规则，这里给可照抄的具体代码。所有示例以"文章 Article"模块为例。

## 1. API 类型（`src/services/article/typings.d.ts`）

后端统一信封 `{ code, data, message }`，`code === 200` 成功。类型挂在全局 `API` 命名空间：

```ts
declare namespace API {
  /** 统一响应信封 */
  interface Result<T = unknown> {
    code: number;        // 200 = 成功
    data: T;
    message: string;     // 失败时的提示
  }

  /** 列表分页 */
  interface PageInfo<T = unknown> {
    current: number;
    pageSize: number;
    total: number;
    list: T[];
  }

  type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE';

  interface Article {
    id: string;
    title: string;
    status: ArticleStatus;
  }

  /** 请求体用 VO 后缀 */
  interface ArticleVO {
    title: string;
    status: ArticleStatus;
  }
}
```

## 2. 手写 service（`src/services/article/ArticleController.ts`）

```ts
import { request } from '@umijs/max';

/** GET /api/articles 列表 */
export async function queryArticleList(params: {
  current?: number;
  pageSize?: number;
}) {
  return request<API.Result<API.PageInfo<API.Article>>>('/api/articles', {
    method: 'GET',
    params,
  });
}

/** POST /api/articles 新建 */
export async function addArticle(body: API.ArticleVO) {
  return request<API.Result<API.Article>>('/api/articles', {
    method: 'POST',
    data: body,
  });
}
```

汇出（`src/services/article/index.ts`）：

```ts
import * as ArticleController from './ArticleController';

export default { ArticleController };
```

页面里：`import services from '@/services/article'` → `services.ArticleController.queryArticleList(...)`。

## 3. 统一信封处理（推荐在 `src/app.ts` 配 request）

让业务层只拿 `data`、`code !== 200` 时集中报错（umi `RequestConfig`）：

```ts
import { App } from 'antd';
import type { RequestConfig } from '@umijs/max';

export const request: RequestConfig = {
  // code !== 200 视为失败并抛出
  errorConfig: {
    errorThrower(res: API.Result) {
      if (res?.code !== 200) {
        const error: any = new Error(res?.message || '请求失败');
        error.name = 'BizError';
        error.info = res;
        throw error;
      }
    },
    errorHandler(error: any) {
      // 用 antd App 的静态方法或 message 提示
      App.useApp?.(); // 实际项目里在组件层用 useApp() 拿 message
      console.error(error?.message);
    },
  },
  // 可选：响应拦截里直接 return data，业务层就不用每次写 .data
  responseInterceptors: [
    (response) => {
      // response.data 是后端信封；如需自动解包可在此处理
      return response;
    },
  ],
};
```

> 说明：模板当前是默认 `request: {}`（未定制）。上面是**团队推荐**的统一层；接入前业务层需自己判 `code===200`、取 `.data`。具体 API 见 umi 文档 `max/request`。

## 4. ProTable 适配（`request` 返回 `{ data, success, total }`）

ProTable 的 `request` 需要 `{ data: 列表, success, total }`，把后端信封映射过去：

```tsx
<ProTable<API.Article>
  rowKey="id"
  request={async (params) => {
    const res = await services.ArticleController.queryArticleList({
      current: params.current,
      pageSize: params.pageSize,
    });
    return {
      data: res.data?.list ?? [],
      total: res.data?.total ?? 0,
      success: res.code === 200,
    };
  }}
  columns={columns}
/>
```

## 5. useQuery（非表格场景）

```tsx
import { useQuery } from '@umijs/max';
import services from '@/services/article';

const { data, isLoading } = useQuery({
  queryKey: ['articles', { current: 1 }],
  queryFn: () => services.ArticleController.queryArticleList({ current: 1 }),
  staleTime: 60_000,
});
// data?.data?.list 即文章列表（或经 app.ts 解包后直接 data?.list）
```

## 6. 自定义 hook（`src/hooks/useSelectedArticle.ts`）

```ts
import { useState } from 'react';

/** 复用：当前选中的文章 id */
export function useSelectedArticle() {
  const [selectedId, setSelectedId] = useState<string>();
  const clear = () => setSelectedId(undefined);
  return { selectedId, setSelectedId, clear };
}
```

## 7. 共享组件 + 主题色边框（`src/components/ArticleCard/`）

主题相关样式两种皆可：① antd-style 读 token；② CSS Modules 用 antd6 cssVar。

`index.module.css`：
```css
.card {
  padding: 12px 16px;
  border: 1px solid var(--ant-color-border, #f0f0f0); /* 跟随主题 */
  border-radius: 8px;
}
```
`index.tsx`：
```tsx
import { Typography } from 'antd';
import styles from './index.module.css';

interface ArticleCardProps {
  article: API.Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => (
  <div className={styles.card}>
    <Typography.Text strong>{article.title}</Typography.Text>
  </div>
);

export default ArticleCard;
```

## 8. 常量 / 枚举（`src/constants/index.ts`）

```ts
export const ARTICLE_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  OFFLINE: 'OFFLINE',
} as const;

/** 给 ProTable valueEnum / Select 用 */
export const ARTICLE_STATUS_LABEL: Record<API.ArticleStatus, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  OFFLINE: '已下线',
};
```

## 9. 页面 + 路由 + 权限

页面 `src/pages/Article/index.tsx` 用 `PageContainer` + `ProTable`（见 §4）。

路由注册（`.umirc.ts` 的 `routes`）：
```ts
{ name: '文章管理', path: '/article', component: './Article', access: 'canSeeArticle' },
```

权限（`src/access.ts`，基于 `getInitialState` 返回的初始数据）：
```ts
export default (initialState: API.UserInfo) => ({
  canSeeAdmin: !!initialState && initialState.name !== 'dontHaveAccess',
  canSeeArticle: true, // 按业务规则定义
});
```
元素级守卫：
```tsx
import { Access, useAccess } from '@umijs/max';
const access = useAccess();
<Access accessible={access.canSeeArticle} fallback={null}>
  <Button>新建文章</Button>
</Access>
```

## 10. Mock（`mock/articleAPI.ts`，遵循信封）

```ts
export default {
  'GET /api/articles': (_req: any, res: any) => {
    res.json({
      code: 200,
      message: 'ok',
      data: { current: 1, pageSize: 10, total: 1, list: [{ id: '1', title: 'Hello', status: 'PUBLISHED' }] },
    });
  },
  'POST /api/articles': (_req: any, res: any) => {
    res.json({ code: 200, message: 'ok', data: { id: '2', title: 'New', status: 'DRAFT' } });
  },
};
```
