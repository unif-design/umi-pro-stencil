import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import Guide from '@/components/Guide';
import { trim } from '@/utils/format';

const HomePage: React.FC = () => {
  const { name } = useModel('global');
  return (
    <PageContainer ghost>
      {/* Tailwind: 布局/间距原子类 */}
      <div className="pt-20">
        <Guide name={trim(name)} />
      </div>
    </PageContainer>
  );
};

export default HomePage;
