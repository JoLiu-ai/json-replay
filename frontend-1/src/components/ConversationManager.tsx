import React, { useState, useEffect } from 'react';
import { 
  UploadOutlined, 
  EyeOutlined, 
  StarOutlined, 
  StarFilled, 
  DeleteOutlined, 
  DownloadOutlined,
  MessageOutlined,
  UserOutlined,
  CopyOutlined,
  PlusOutlined,
  BookOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { 
  Button, 
  Upload as AntUpload, 
  Card, 
  Tag, 
  Modal, 
  message,
  Tooltip,
  Typography,
  Input,
  Tabs,
  Empty
} from 'antd';
import type { UploadProps } from 'antd/es/upload/interface';
import { apiService } from '../services/api';
import type { Conversation, ConversationManagerProps, ConversationStats } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ConversationManager: React.FC<ConversationManagerProps> = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [pasteLoading, setPasteLoading] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [conversationName, setConversationName] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    const result = await apiService.getConversations();
    
    if (result.success && result.data) {
      setConversations(result.data);
    } else {
      message.error(result.error || 'Failed to fetch conversations');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadLoading(true);

    const result = await apiService.uploadConversation(file as File);
    
    if (result.success) {
      message.success('对话已成功导入');
      fetchConversations();
      onSuccess?.(result.data);
      setShowUploadModal(false);
    } else {
      message.error(result.error || '导入失败');
      onError?.(new Error(result.error));
    }
    
    setUploadLoading(false);
  };

  const handlePasteJson = async () => {
    if (!jsonContent.trim()) {
      message.error('请粘贴对话内容');
      return;
    }

    if (!conversationName.trim()) {
      message.error('请输入对话标题');
      return;
    }

    setPasteLoading(true);
    try {
      JSON.parse(jsonContent);
      
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const file = new File([blob], `${conversationName}.json`, { type: 'application/json' });
      
      const result = await apiService.uploadConversation(file);
      
      if (result.success) {
        message.success('对话已成功创建');
        setJsonContent('');
        setConversationName('');
        fetchConversations();
        setShowUploadModal(false);
      } else {
        message.error(result.error || '创建失败');
      }
    } catch (error) {
      message.error('JSON格式错误，请检查内容');
    } finally {
      setPasteLoading(false);
    }
  };

  const toggleBookmark = async (conversationId: number) => {
    const result = await apiService.toggleBookmark(conversationId);
    
    if (result.success) {
      fetchConversations();
      message.success('收藏状态已更新');
    } else {
      message.error(result.error || '更新失败');
    }
  };

  const deleteConversation = async (conversationId: number) => {
    Modal.confirm({
      title: '删除对话',
      content: '确定要删除这个对话吗？此操作无法撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const result = await apiService.deleteConversation(conversationId);
        
        if (result.success) {
          message.success('对话已删除');
          fetchConversations();
        } else {
          message.error(result.error || '删除失败');
        }
      },
    });
  };

  const exportConversation = async (conversationId: number, conversationName: string) => {
    const result = await apiService.exportConversation(conversationId);
    
    if (result.success && result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${conversationName}_export.json`;
      a.click();
      URL.revokeObjectURL(url);
      message.success('对话已导出');
    } else {
      message.error(result.error || '导出失败');
    }
  };

  const openVisualizer = (conversationId: number) => {
    window.open(apiService.getVisualizerUrl(conversationId), '_blank');
  };

  const getConversationStats = (conversation: Conversation): ConversationStats => {
    const mapping = conversation.content?.mapping || {};
    const messages = Object.values(mapping).filter((node: any) => node?.message);
    
    const userMessages = messages.filter((node: any) => node.message.author.role === 'user');
    const assistantMessages = messages.filter((node: any) => node.message.author.role === 'assistant');
    
    return {
      total: messages.length,
      user: userMessages.length,
      assistant: assistantMessages.length,
    };
  };

  const getConversationPreview = (conversation: Conversation): string => {
    const mapping = conversation.content?.mapping || {};
    const messages = Object.values(mapping).filter((node: any) => node?.message);
    
    if (messages.length === 0) return '暂无内容';
    
    const firstMessage = messages[0] as any;
    const content = firstMessage.message?.content?.parts?.[0] || '';
    
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.json',
    showUploadList: false,
    customRequest: handleUpload,
    beforeUpload: (file) => {
      const isJSON = file.type === 'application/json' || file.name.endsWith('.json');
      if (!isJSON) {
        message.error('只能上传JSON文件');
        return false;
      }
      return true;
    },
  };

  const uploadTabItems = [
    {
      key: 'upload',
      label: '上传文件',
      children: (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ marginBottom: '24px' }}>
            <BookOutlined style={{ fontSize: '48px', color: '#8c8c8c', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#262626', margin: '16px 0 8px' }}>
              上传对话文件
            </Title>
            <Text type="secondary">支持JSON格式的对话文件</Text>
          </div>
          <AntUpload {...uploadProps}>
            <Button 
              icon={<UploadOutlined />} 
              loading={uploadLoading}
              type="primary"
              size="large"
              style={{ 
                borderRadius: '6px',
                height: '48px',
                padding: '0 32px',
                fontSize: '16px'
              }}
            >
              选择文件
            </Button>
          </AntUpload>
        </div>
      )
    },
    {
      key: 'paste',
      label: '粘贴内容',
      children: (
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text strong style={{ fontSize: '14px', color: '#262626' }}>对话标题</Text>
            <Input
              placeholder="为这个对话起个名字..."
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              style={{ 
                marginTop: '8px',
                borderRadius: '6px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <Text strong style={{ fontSize: '14px', color: '#262626' }}>对话内容</Text>
            <TextArea
              rows={12}
              placeholder="在这里粘贴你的对话JSON内容..."
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
              style={{ 
                marginTop: '8px',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid #d9d9d9'
              }}
            />
          </div>
          <Button 
            type="primary"
            icon={<CopyOutlined />}
            loading={pasteLoading}
            onClick={handlePasteJson}
            disabled={!jsonContent.trim() || !conversationName.trim()}
            style={{ 
              width: '100%',
              height: '44px',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            创建对话
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '0 24px',
      backgroundColor: '#fafafa',
      minHeight: '100vh'
    }}>
      {/* 头部区域 */}
      <div style={{ 
        padding: '40px 0 32px',
        textAlign: 'center',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Title level={1} style={{ 
          color: '#262626', 
          margin: '0 0 16px',
          fontWeight: '300',
          fontSize: '32px'
        }}>
          对话管理
        </Title>
        <Paragraph style={{ 
          color: '#8c8c8c', 
          fontSize: '16px',
          margin: '0',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          管理你的AI对话，探索思维的轨迹，记录灵感的火花
        </Paragraph>
      </div>

      {/* 操作区域 */}
      <div style={{ 
        padding: '32px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Title level={3} style={{ 
            color: '#262626', 
            margin: '0',
            fontSize: '20px',
            fontWeight: '500'
          }}>
            我的对话
          </Title>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            共 {conversations.length} 个对话
          </Text>
        </div>
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowUploadModal(true)}
          style={{ 
            borderRadius: '6px',
            height: '40px',
            padding: '0 24px',
            fontSize: '14px'
          }}
        >
          新建对话
        </Button>
      </div>

      {/* 对话列表 */}
      {conversations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#8c8c8c', fontSize: '16px' }}>
                还没有对话，开始创建你的第一个对话吧
              </Text>
              <br />
              <Button 
                type="link" 
                onClick={() => setShowUploadModal(true)}
                style={{ marginTop: '16px' }}
              >
                立即创建
              </Button>
            </div>
          }
          style={{ 
            padding: '80px 0',
            backgroundColor: 'white',
            borderRadius: '8px',
            marginBottom: '32px'
          }}
        />
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {conversations.map((conversation) => {
            const stats = getConversationStats(conversation);
            const preview = getConversationPreview(conversation);
            
            return (
              <Card
                key={conversation.id}
                hoverable
                style={{ 
                  borderRadius: '8px',
                  border: '1px solid #f0f0f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease'
                }}
                styles={{ body: { padding: '24px' } }}
                actions={[
                  <Tooltip title="查看可视化">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />} 
                      onClick={() => openVisualizer(conversation.id)}
                      style={{ color: '#1890ff' }}
                    />
                  </Tooltip>,
                  <Tooltip title={conversation.is_favorite ? "取消收藏" : "收藏"}>
                    <Button 
                      type="text" 
                      icon={conversation.is_favorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                      onClick={() => toggleBookmark(conversation.id)}
                    />
                  </Tooltip>,
                  <Tooltip title="导出">
                    <Button 
                      type="text" 
                      icon={<DownloadOutlined />} 
                      onClick={() => exportConversation(conversation.id, conversation.name)}
                    />
                  </Tooltip>,
                  <Tooltip title="删除">
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => deleteConversation(conversation.id)}
                    />
                  </Tooltip>,
                ]}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <Title level={4} style={{ 
                      margin: '0',
                      fontSize: '18px',
                      fontWeight: '500',
                      color: '#262626',
                      lineHeight: '1.4'
                    }}>
                      {conversation.name}
                    </Title>
                    {conversation.is_favorite && (
                      <StarFilled style={{ color: '#faad14', fontSize: '16px' }} />
                    )}
                  </div>
                  
                  <Paragraph style={{ 
                    color: '#595959',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: '0',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {preview}
                  </Paragraph>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <Tag icon={<UserOutlined />} style={{ 
                      borderRadius: '4px',
                      fontSize: '12px',
                      padding: '2px 8px'
                    }}>
                      {stats.user} 用户
                    </Tag>
                    <Tag icon={<MessageOutlined />} style={{ 
                      borderRadius: '4px',
                      fontSize: '12px',
                      padding: '2px 8px'
                    }}>
                      {stats.assistant} 助手
                    </Tag>
                    <Tag icon={<ClockCircleOutlined />} style={{ 
                      borderRadius: '4px',
                      fontSize: '12px',
                      padding: '2px 8px'
                    }}>
                      {stats.total} 消息
                    </Tag>
                  </div>
                  
                  {conversation.created_at && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </Text>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 上传模态框 */}
      <Modal
        title={
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <Title level={3} style={{ margin: '0', color: '#262626' }}>
              新建对话
            </Title>
          </div>
        }
        open={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
        footer={null}
        width={600}
        centered
        style={{ top: 20 }}
      >
        <Tabs 
          items={uploadTabItems}
          defaultActiveKey="upload"
          size="large"
          style={{ marginTop: '16px' }}
        />
      </Modal>
    </div>
  );
};

export default ConversationManager; 