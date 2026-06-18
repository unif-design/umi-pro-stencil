# 代码范式参照（project-conventions 配套）

SKILL.md 给规则，这里给可照抄的代码。以"文章 Article"为例。

## 1. API 类型与信封（`src/services/article/typings.d.ts`）

后端统一信封 `{ code, data, message }`，`code === 200` 成功；挂全局 `API` 命名空间：

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

让业务层只拿 `data`、`code !== 200` 集中报错：
```ts
import { message } from 'antd';
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
      message.error(err?.message || '请求失败'); // 全局兜底；组件内提示用 App.useApp()
    },
  },
};
```
> 配置量大时可抽到 `src/requestErrorConfig.ts`，由 `app.tsx` 导出 `request` 引用。

## 4. 组件目录结构（平铺 + 私有单数文件 + index.style.ts）

```
src/components/ArticleCard/
├─ index.tsx        # 唯一对外入口
├─ ArticleCard.tsx  # 主组件（与目录同名）
├─ ArticleTag.tsx   # 私有子组件（直接平铺，不套 components/）
├─ hook.ts          # 私有方法/逻辑（单数）
├─ util.ts          # 私有工具（单数）
├─ constant.ts      # 私有常量（单数）
├─ type.ts          # 私有类型（含 Props）
└─ index.style.ts   # 样式（antd-style）
```

`type.ts`：`export interface ArticleCardProps { article: API.Article }`
`index.style.ts`（antd-style，颜色随主题 token）：
```ts
import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ token }) => ({
  card: {
    padding: 12,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
  },
}));
```
`ArticleCard.tsx`（组合 antd 组件而非重造）：
```tsx
import { Typography } from 'antd';
import { useStyles } from './index.style';
import type { ArticleCardProps } from './type';

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.card}>
      <Typography.Text strong>{article.title}</Typography.Text>
    </div>
  );
};
export default ArticleCard;
```
`index.tsx`：`export { default } from './ArticleCard'; export type { ArticleCardProps } from './type';`
外部：`import ArticleCard from '@/components/ArticleCard'`（不深引内部文件）。页面私有组件同构，平铺在 `pages/<Page>/` 内。

## 5. antd 用法：App.useApp（提示/确认）

```tsx
import { App } from 'antd';

const Toolbar: React.FC = () => {
  const { message, modal } = App.useApp();
  const onDelete = () =>
    modal.confirm({ title: '确认删除？', onOk: () => message.success('已删除') });
  return <a onClick={onDelete}>删除</a>;
};
```

## 6. ProTable（`src/pages/Article/index.tsx`）

`request` 把信封映射成 `{ data, success, total }`，列枚举取自 constants：
```tsx
import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import services from '@/services/article';
import { ARTICLE_STATUS_LABEL } from '@/constants';

const columns: ProColumns<API.Article>[] = [
  { title: '标题', dataIndex: 'title' },
  { title: '状态', dataIndex: 'status', valueEnum: ARTICLE_STATUS_LABEL },
];

export default () => (
  <PageContainer>
    <ProTable<API.Article>
      rowKey="id"
      columns={columns}
      request={async (params) => {
        const res = await services.ArticleController.queryArticleList({
          current: params.current, pageSize: params.pageSize,
        });
        return { data: res.data?.list ?? [], total: res.data?.total ?? 0, success: res.code === 200 };
      }}
    />
  </PageContainer>
);
```

## 7. ProForm / ModalForm（表单优先用 Pro）

```tsx
import { ModalForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import services from '@/services/article';
import { ARTICLE_STATUS_LABEL } from '@/constants';

<ModalForm<API.ArticleVO>
  title="新建文章"
  trigger={<Button type="primary">新建</Button>}
  onFinish={async (values) => (await services.ArticleController.addArticle(values)).code === 200}
>
  <ProFormText name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]} />
  <ProFormSelect name="status" label="状态" valueEnum={ARTICLE_STATUS_LABEL} />
</ModalForm>
```

## 8. React Query（非表格场景）

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
// 加载：isLoading ? <Skeleton/> : 渲染 data?.data?.list
```

## 9. hook：私有 vs 复用

- 仅本组件/页面用 → 组件/页面内 `hook.ts`：`export function useXxx() {...}`。
- ≥2 处复用 → 提到 `src/hooks/useXxx.ts`。

## 10. 常量 / 枚举（`src/constants/index.ts`）

```ts
export const ARTICLE_STATUS = { DRAFT: 'DRAFT', PUBLISHED: 'PUBLISHED', OFFLINE: 'OFFLINE' } as const;
/** 给 ProTable valueEnum / ProFormSelect 用 */
export const ARTICLE_STATUS_LABEL: Record<API.ArticleStatus, string> = {
  DRAFT: '草稿', PUBLISHED: '已发布', OFFLINE: '已下线',
};
```

## 11. 路由 + 权限

`config/routes.ts`：`{ name: '文章管理', path: '/article', component: './Article', access: 'canSeeArticle' }`
`src/access.ts`：
```ts
export default (initialState: API.UserInfo) => ({
  canSeeArticle: !!initialState,
});
```
元素级：`const access = useAccess(); <Access accessible={access.canSeeArticle}><Button/></Access>`（`from '@umijs/max'`）。

## 12. 全局类型（`src/types/`）

跨模块、不属某 service 的类型，如 `src/types/common.d.ts`：
```ts
declare global {
  type ID = string | number;
  interface Option<T = string> { label: string; value: T }
}
export {};
```

## 13. 错误 / 加载 / 空态
加载 `isLoading` → `<Skeleton active />`；空 → `<Empty />`（Pro 列表/表格自带）；接口错误经 §3 errorConfig 统一弹。

## 14. Mock（`mock/articleAPI.ts`，遵循信封）

```ts
export default {
  'GET /api/articles': (_: any, res: any) =>
    res.json({ code: 200, message: 'ok', data: { current: 1, pageSize: 10, total: 1, list: [{ id: '1', title: 'Hello', status: 'PUBLISHED' }] } }),
  'POST /api/articles': (_: any, res: any) =>
    res.json({ code: 200, message: 'ok', data: { id: '2', title: 'New', status: 'DRAFT' } }),
};
```
