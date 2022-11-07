import React from 'react'
import { Modal, Button } from 'antd'
import '../MonetizationApplication.scss'

const ApplyMonetizationModal = (props) => {
  const { infoContent } = props

  return (
    <Modal
      className="monetization-info-modal"
      visible={props.visible}
      centered
      width={452}
      onCancel={props.onClose}
      footer={<Button key="submit" type="primary" onClick={props.onClose}>OK</Button>}
    >
      <span className="monetization-info-title">{infoContent.title}</span>
      {infoContent.icon && infoContent.icon === "welcome" && <img src={require('asset/svg/welcome-tada.svg')} alt="welcome" />}
      {infoContent.icon && infoContent.icon === "warning" && <img src={require('asset/svg/warning-triangle-icon.svg')} alt="warning" />}
      <p>{infoContent.content}</p>
    </Modal>
  )
}

export default ApplyMonetizationModal
