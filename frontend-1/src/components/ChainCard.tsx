import { Card, Button, Popconfirm, Typography, Tooltip } from 'antd';
import { StarOutlined, StarFilled, DeleteOutlined } from '@ant-design/icons';
import type { Chain } from '../services/chainApi';

const { Text } = Typography;

interface ChainCardProps {
  chain: Chain;
  onToggleFavorite: (id: number, isFavorite: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const ChainCard = ({ chain, onToggleFavorite, onDelete }: ChainCardProps) => {
  const handleToggleFavorite = () => {
    onToggleFavorite(chain.id, !chain.is_favorite);
  };

  const handleDelete = () => {
    onDelete(chain.id);
  };

  return (
    <Card
      size="small"
      style={{ marginBottom: 8, fontSize: 12 }}
      title={<span style={{ fontSize: 12 }}>{chain.name}</span>}
      extra={
        <>
          <Tooltip title={chain.is_favorite ? '取消收藏' : '收藏'}>
            <Button
              type="text"
              icon={chain.is_favorite ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
              onClick={handleToggleFavorite}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="确定删除此链？"
            onConfirm={handleDelete}
            okText="是"
            cancelText="否"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </>
      }
      headStyle={{ fontSize: 12, minHeight: 32 }}
      bodyStyle={{ fontSize: 12, padding: 8 }}
    >
      <Text style={{ fontSize: 12 }}>
        {typeof chain.content === 'string' 
          ? chain.content 
          : JSON.stringify(chain.content, null, 2)
        }
      </Text>
      <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>
        ID: {chain.id} | Favorite: {chain.is_favorite ? 'Yes' : 'No'}
      </div>
    </Card>
  );
};

export default ChainCard; 