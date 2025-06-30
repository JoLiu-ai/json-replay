import { Row, Col, Statistic, Switch, Typography } from 'antd';

const { Title } = Typography;

interface DashboardProps {
  totalChains: number;
  favoriteChains: number;
  showFavoritesOnly: boolean;
  onShowFavoritesToggle: (checked: boolean) => void;
}

const Dashboard = ({ 
  totalChains, 
  favoriteChains, 
  showFavoritesOnly,
  onShowFavoritesToggle 
}: DashboardProps) => {
  return (
    <div style={{ marginBottom: '24px', padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
      <Row justify="space-between" align="middle">
        <Col span={16}>
          <Row gutter={32}>
            <Col>
              <Statistic title="Total Chains" value={totalChains} />
            </Col>
            <Col>
              <Statistic title="Favorites" value={favoriteChains} />
            </Col>
          </Row>
        </Col>
        <Col span={8} style={{ textAlign: 'right' }}>
            <Title level={5} style={{marginRight: '8px', display: 'inline-block'}}>Show Favorites Only</Title>
            <Switch
                checked={showFavoritesOnly}
                onChange={onShowFavoritesToggle}
            />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 