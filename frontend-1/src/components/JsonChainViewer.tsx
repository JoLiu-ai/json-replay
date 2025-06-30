import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Button, Input, message, Popconfirm, Tooltip, Segmented, notification } from 'antd';
import {
    ShareAltOutlined,
    AppstoreOutlined,
    BarsOutlined,
    TableOutlined,
    SearchOutlined,
    StarOutlined,
    StarFilled,
    CopyOutlined,
    DeleteOutlined,
    ExportOutlined,
    FilterOutlined,
    MessageOutlined,
    ApartmentOutlined,
} from '@ant-design/icons';
import { Network } from 'vis-network';
import './JsonChainViewer.css';

// Type definitions
export interface MappingNode {
  id: string;
  message: {
    author: { role: string };
    content: { parts: string[] };
    create_time: number;
  } | null;
  parent: string | null;
  children: string[];
}

export interface Mapping {
  [id: string]: MappingNode;
}

interface JsonChainViewerProps {
  mapping: Mapping;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  favorites?: Set<string>;
}

const JsonChainViewer: React.FC<JsonChainViewerProps> = ({
  mapping,
  onToggleFavorite,
  onDelete,
  favorites = new Set(),
}) => {
  const [currentView, setCurrentView] = useState('tree');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ messages: 0, branches: 0 });

  const networkContainerRef = useRef<HTMLDivElement>(null);
  const networkInstanceRef = useRef<Network | null>(null);

  const cleanContent = (content: string) => {
    let clean = content.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    clean = clean.replace(/<answer>([\s\S]*?)<\/answer>/g, '$1');
    return clean.trim();
  };

  const allMessages = useMemo(() => {
    const messages: { nodeId: string; message: MappingNode['message'] }[] = [];
    const traverse = (nodeId: string) => {
      const nodeData = mapping[nodeId];
      if (nodeData?.message) {
        messages.push({ nodeId, message: nodeData.message });
      }
      nodeData?.children?.forEach(traverse);
    };
    const rootNodeId = Object.keys(mapping).find(k => mapping[k].parent === null);
    if (rootNodeId) {
        traverse(rootNodeId);
    } else {
        // Fallback for mappings without a null parent root
        Object.keys(mapping).forEach(k => {
            if(mapping[k].message) {
                messages.push({ nodeId: k, message: mapping[k].message });
            }
        });
    }
    return messages.sort((a,b) => (a.message?.create_time || 0) - (b.message?.create_time || 0));
  }, [mapping]);

  const filteredMessages = useMemo(() => {
    if (!searchTerm) return allMessages;
    return allMessages.filter(({ message }) =>
      message?.content.parts[0].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allMessages, searchTerm]);

  useEffect(() => {
    let branches = 0;
    Object.values(mapping).forEach(node => {
      if (node.children && node.children.length > 1) {
        branches += node.children.length - 1;
      }
    });
    setStats({ messages: allMessages.length, branches });
  }, [allMessages, mapping]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Copied to clipboard!');
  };

  const renderTreeViewNode = (nodeId: string, depth: number): React.ReactNode => {
    const node = mapping[nodeId];
    if (!node || !node.message) return null;

    if (searchTerm && !node.message.content.parts[0].toLowerCase().includes(searchTerm.toLowerCase())) {
      return null;
    }

    const { author, content, create_time } = node.message;

    return (
      <div key={nodeId} className="jcv-message-container" style={{ marginLeft: depth * 20 }}>
        <div className={`jcv-message-card ${author.role}`}>
          <div className="jcv-message-header">
            <div className="jcv-author">{author.role}</div>
            <div className="jcv-message-actions">
                <Tooltip title="Copy">
                    <Button icon={<CopyOutlined />} size="small" type="text" onClick={() => handleCopy(content.parts[0])} />
                </Tooltip>
                <Tooltip title="Favorite">
                    <Button
                        icon={favorites.has(nodeId) ? <StarFilled style={{color: '#fadb14'}}/> : <StarOutlined />}
                        size="small"
                        type="text"
                        onClick={() => onToggleFavorite?.(nodeId)}
                    />
                </Tooltip>
                 <Popconfirm
                    title="Delete this message?"
                    onConfirm={() => onDelete?.(nodeId)}
                    okText="Yes"
                    cancelText="No"
                 >
                    <Button icon={<DeleteOutlined />} size="small" type="text" danger />
                </Popconfirm>
            </div>
          </div>
          <div className="jcv-content" dangerouslySetInnerHTML={{ __html: cleanContent(content.parts[0]).replace(/\n/g, '<br />') }} />
        </div>
        {node.children.map(childId => renderTreeViewNode(childId, depth + 1))}
      </div>
    );
  };

  const renderTreeView = () => {
    const rootNodeId = Object.keys(mapping).find(k => mapping[k].parent === null);
    if(!rootNodeId) return <div style={{padding: 20, color: '#888'}}>Cannot find root node.</div>;
    return <div className="jcv-tree-view">{mapping[rootNodeId].children.map(id => renderTreeViewNode(id, 0))}</div>;
  };

  const renderListView = () => (
    <div className="jcv-list-view">
      {filteredMessages.map(({ nodeId, message }) => (
        <div key={nodeId} className="jcv-list-item">
          <div className={`jcv-list-avatar ${message?.author.role}`}>
            {message?.author.role === 'user' ? 'U' : 'A'}
          </div>
          <div className="jcv-list-content">
            <div className="jcv-list-header">
              <div className="jcv-list-author">{message?.author.role}</div>
              <div className="jcv-timestamp">{new Date((message?.create_time || 0) * 1000).toLocaleString()}</div>
            </div>
            <div className="jcv-list-text">{cleanContent(message?.content.parts[0] || '')}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="jcv-table-view">
      <table className="jcv-conversation-table">
        <thead>
          <tr>
            <th>Author</th>
            <th>Content</th>
            <th>Timestamp</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMessages.map(({ nodeId, message }) => (
            <tr key={nodeId}>
              <td>{message?.author.role}</td>
              <td title={cleanContent(message?.content.parts[0] || '')}>
                <div style={{maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                    {cleanContent(message?.content.parts[0] || '')}
                </div>
              </td>
              <td>{new Date((message?.create_time || 0) * 1000).toLocaleString()}</td>
              <td>
                <Tooltip title="Copy">
                    <Button icon={<CopyOutlined />} size="small" type="text" onClick={() => handleCopy(message?.content.parts[0] || '')} />
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderNetworkView = useCallback(() => {
    if (!networkContainerRef.current) return;

    if (networkInstanceRef.current) {
      networkInstanceRef.current.destroy();
    }
    
    const nodes = filteredMessages.map(({ nodeId, message }) => ({
        id: nodeId,
        label: message?.author.role === 'user' ? 'U' : 'A',
        title: cleanContent(message?.content.parts[0] || '').substring(0, 100) + '...',
        color: message?.author.role === 'user' ? '#e0e7ff' : '#f0fdf4',
    }));

    const edges = allMessages
        .map(({ nodeId }) => mapping[nodeId])
        .filter(node => node?.parent && mapping[node.parent]) // ensure parent exists
        .map(node => ({ from: node.parent, to: node.id }));

    const data = { nodes, edges };
    const options = {
        layout: { hierarchical: { direction: "UD", sortMethod: "directed" } },
        physics: { enabled: false }
    };

    networkInstanceRef.current = new Network(networkContainerRef.current, data, options);
  }, [filteredMessages, mapping, allMessages]);

  useEffect(() => {
    if (currentView === 'network') {
      renderNetworkView();
    }
  }, [currentView, renderNetworkView]);


  return (
    <div className="json-chain-viewer">
      <div className="jcv-header">
        <div className="jcv-header-top">
          <div className="jcv-chat-title">
            <span>💬</span>
            <span>Conversation Details</span>
          </div>
          <div className="jcv-chat-stats">
            <div className="jcv-stat-item">
                <MessageOutlined />
                <span>{stats.messages} messages</span>
            </div>
            <div className="jcv-stat-item">
                <ApartmentOutlined />
                <span>{stats.branches} branches</span>
            </div>
             <div className="jcv-stat-item">
                <StarOutlined />
                <span>{favorites.size} favorites</span>
            </div>
          </div>
        </div>
        <div className="jcv-controls">
          <Segmented
            options={[
              { label: 'Tree', value: 'tree', icon: <ApartmentOutlined /> },
              { label: 'List', value: 'list', icon: <BarsOutlined /> },
              { label: 'Table', value: 'table', icon: <TableOutlined /> },
              { label: 'Network', value: 'network', icon: <ShareAltOutlined /> },
            ]}
            value={currentView}
            onChange={(value) => setCurrentView(value as string)}
          />
          <div className="jcv-search-container">
            <Input
              placeholder="Search messages..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>
          <div style={{marginLeft: 'auto'}}>
            <Button icon={<FilterOutlined />}>Filter</Button>
            <Button icon={<ExportOutlined />} style={{marginLeft: 8}}>Export</Button>
          </div>
        </div>
      </div>
      <div className="jcv-main-content">
        <div className={`jcv-view-container ${currentView === 'tree' ? 'active' : ''}`}>
          {renderTreeView()}
        </div>
        <div className={`jcv-view-container ${currentView === 'list' ? 'active' : ''}`}>
          {renderListView()}
        </div>
        <div className={`jcv-view-container ${currentView === 'table' ? 'active' : ''}`}>
          {renderTableView()}
        </div>
        <div className={`jcv-view-container ${currentView === 'network' ? 'active' : ''}`}>
          <div ref={networkContainerRef} className="jcv-network-view" />
        </div>
      </div>
    </div>
  );
};

export default JsonChainViewer; 