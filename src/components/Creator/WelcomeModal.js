import React from 'react'
import { Modal, Button } from 'antd'
import './Creator.scss'

export default function WelcomeModal(props) {
  return (
    <Modal
      className={`welcome-modal${props.isCreator ? ' creator' : ''}`}
      visible={props.visible}
      centered
      width={452}
      onCancel={props.onClose}
      footer={<Button key="submit" type="primary" onClick={props.onClose}>OK</Button>}
    >
      <div className="banner" />
      <h3>Welcome to NewsBreak!</h3>
      <p>This writer account allows you to distribute your original content to local and national readers.</p>
    </Modal>
  )
}
