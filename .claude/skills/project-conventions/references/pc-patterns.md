# PC/Web 代码范式（project-conventions 配套）

PC 专属代码（ProComponents + antd 桌面）。通用 umi 范式（service/信封/React Query/结构/类型）见 **umi skill** 的 `references/patterns.md`。

## 1. App.useApp（提示 / 确认）

组件内用 `message`/`modal`（拿到主题与上下文），不要静态 `message.xxx`：
```tsx
import { App } from 'antd';

const Toolbar: React.FC = () => {
  const { message, modal } = App.useApp();
  const onDelete = () =>
    modal.confirm({ title: '确认删除？', onOk: () => message.success('已删除') });
  return <a onClick={onDelete}>删除</a>;
};
```

## 2. ProTable（`src/pages/Article/index.tsx`）

`request` 把后端信封映射成 `{ data, success, total }`，列枚举取自 constants：
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

## 3. ProForm / ModalForm（表单优先用 Pro）

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

## 4. 样式：antd-style + Tailwind

- 组件样式 → `index.style.ts`（antd-style `createStyles`，颜色随主题 token，见 umi skill §4）。
- 布局/间距 → Tailwind 原子类：`className="pt-20 flex gap-2"`。
- 颜色走 token / cssVar，不硬编码。

## 5. 自定义组件：基于 antd 改造
确需自定义时，优先基于 antd 基础组件扩展（`Card`/`List`/`Table`/`Form`），不从零裸 div 手搓。例：
```tsx
import { Card } from 'antd';
import type { CardProps } from 'antd';

const StatCard: React.FC<CardProps & { value: number }> = ({ value, ...rest }) => (
  <Card size="small" {...rest}>
    <span>{value}</span>
  </Card>
);
```
