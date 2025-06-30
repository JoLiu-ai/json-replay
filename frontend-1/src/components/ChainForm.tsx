import { useState } from 'react';
import { Form, Input, Button, notification } from 'antd';
import type { ChainCreate } from '../services/chainApi';

const { TextArea } = Input;

interface ChainFormProps {
  onSubmit: (values: ChainCreate) => Promise<void>;
}

const ChainForm = ({ onSubmit }: ChainFormProps) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: { name: string; content: string }) => {
    let parsedContent;
    try {
      parsedContent = JSON.parse(values.content);
    } catch (error) {
      notification.error({
        message: 'Invalid JSON',
        description: 'The content field must contain valid JSON.',
      });
      return;
    }

    setSubmitting(true);
    await onSubmit({ name: values.name, content: parsedContent });
    setSubmitting(false);
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ marginBottom: '24px' }}
    >
      <Form.Item
        name="name"
        label="Chain Name"
        rules={[{ required: true, message: 'Please input a name for the chain!' }]}
      >
        <Input placeholder="e.g., My Awesome Chain" />
      </Form.Item>
      <Form.Item
        name="content"
        label="JSON Content"
        rules={[{ required: true, message: 'Please paste the JSON content!' }]}
      >
        <TextArea rows={6} placeholder='{ "key": "value", "steps": [...] }' />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>
          Create Chain
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChainForm; 