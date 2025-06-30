import { List, Empty } from 'antd';
import type { Chain } from '../services/chainApi';
import ChainCard from './ChainCard';

interface ChainListProps {
  chains: Chain[];
  onDelete: (id: number) => Promise<void>;
  onToggleFavorite: (id: number, isFavorite: boolean) => Promise<void>;
}

const ChainList = ({ chains, onDelete, onToggleFavorite }: ChainListProps) => {
  if (chains.length === 0) {
    return (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span>No chains found. Create one using the form above!</span>}
        />
    );
  }

  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 3,
        xxl: 4,
      }}
      dataSource={chains}
      renderItem={(chain: Chain) => (
        <List.Item>
          <ChainCard
            chain={chain}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
          />
        </List.Item>
      )}
    />
  );
};

export default ChainList; 