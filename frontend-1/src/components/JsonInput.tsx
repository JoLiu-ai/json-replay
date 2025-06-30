import React, { useState } from 'react';
import { Input, Button, Typography, notification } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

interface JsonInputProps {
  onJsonParsed: (data: any) => void;
}

const JsonInput: React.FC<JsonInputProps> = ({ onJsonParsed }) => {
  const [jsonText, setJsonText] = useState('');

  const handleParse = () => {
    try {
      const data = JSON.parse(jsonText);
      onJsonParsed(data);
      notification.success({ message: 'JSON解析成功' });
    } catch (e) {
      notification.error({ message: 'JSON格式错误', description: String(e) });
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12 }}>粘贴你的JSON：</Text>
      <TextArea
        value={jsonText}
        onChange={e => setJsonText(e.target.value)}
        rows={6}
        style={{ fontSize: 12, marginTop: 4 }}
        placeholder="粘贴JSON数据..."
      />
      <Button type="primary" size="small" style={{ marginTop: 8 }} onClick={handleParse}>
        解析
      </Button>
    </div>
  );
};

export default JsonInput; 