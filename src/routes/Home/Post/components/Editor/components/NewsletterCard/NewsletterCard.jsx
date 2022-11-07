import React from 'react'
import { Modal, Form, Input, Button, Select } from 'antd'

import logEvent from 'utils/logEvent'
import { applyNewsletterCard } from '../../utils/operations'
import api from 'utils/api'

const { Option } = Select

export const NewsletterCard = props => {
  const { onToggle, editorState, removeKey, onChange } = props
  const handleClose = () => {
    logEvent('post_edit_newsletter_card_modal_close')
    onToggle && onToggle()
  }

  const handleSubmit = async values => {
    if (values.source) {
      const data = await api.get(`/newsletter/embed/${values.source}`, values)

      const newEditorState = applyNewsletterCard(
        editorState,
        data.data,
        removeKey
      )
      onChange(newEditorState)
    }
    handleClose()
  }

  return (
    <Modal
      onCancel={handleClose}
      centered
      footer={null}
      destroyOnClose={true}
      maskClosable={false}
      visible={true}
    >
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="source" label="Source" rules={[{ required: true }]}>
          <Select defaultValue="">
            <Option value="" disabled>
              Select Source
            </Option>
            <Option value="youtube">YouTube</Option>
            <Option value="twitter">Twitter</Option>
          </Select>
        </Form.Item>
        <Form.Item name="url" label="Url" rules={[{ required: true }]}>
          <Input placeholder="Link to url" />
        </Form.Item>
        {/*         <Form.Item
          name="thumbnail"
          label="Card Thumbnail"
          rules={[{ required: true }]}
        >
          <Input placeholder="e.g. John Smith/Unsplash" />
        </Form.Item>
        <Form.Item name="url" label="Card Url" rules={[{ required: true }]}>
          <Input placeholder="e.g. John Smith/Unsplash" />
        </Form.Item>
        <Form.Item name="text" label="Card Text">
          <Input placeholder="e.g. John Smith/Unsplash" />
        </Form.Item> */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
