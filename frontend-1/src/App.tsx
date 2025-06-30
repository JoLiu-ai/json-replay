import { useState } from 'react';
import { Layout, Typography, Row, Col, Card, Switch, Input, Tabs } from 'antd';
import JsonInput from './components/JsonInput';
import type { Mapping } from './components/JsonChainViewer';
import ConversationManager from './components/ConversationManager';
import JsonChainViewer from './components/JsonChainViewer';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [mapping, setMapping] = useState<Mapping | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [deleted, setDeleted] = useState<Set<string>>(new Set());

  const handleJsonParsed = (data: any) => {
    if (data && data.mapping) {
      setMapping(data.mapping);
      setFavorites(new Set());
      setDeleted(new Set());
    }
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = (id: string) => {
    setDeleted(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const tabItems = [
    {
      key: 'conversations',
      label: 'Conversation Manager',
      children: <ConversationManager />,
    },
    {
      key: 'json-chains',
      label: 'JSON Chain Viewer',
      children: (
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <Card size="small" title={<span style={{ fontSize: 14 }}>输入JSON</span>}>
              <JsonInput onJsonParsed={handleJsonParsed} />
            </Card>
          </Col>
          <Col xs={24} md={16}>
             {mapping ? (
                <JsonChainViewer
                  mapping={mapping}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDelete}
                />
              ) : (
                <Card>
                    <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                        请先在左侧输入JSON数据以开始可视化分析
                    </div>
                </Card>
              )}
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Title level={4} style={{ color: 'white', margin: 0, fontSize: 16 }}>AI Conversation Management System</Title>
      </Header>
      <Content style={{ padding: '24px 48px' }}>
        <Tabs 
          defaultActiveKey="conversations" 
          items={tabItems}
          size="large"
          style={{ marginBottom: '24px' }}
        />
      </Content>
    </Layout>
  );
}

export default App;
