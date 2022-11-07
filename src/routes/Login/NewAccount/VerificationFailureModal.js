import React from 'react'
import { Modal, Button } from 'antd'
import './NewAccount.scss'

export default function VerificationFailureModal(props) {
  return (
    <Modal
      className='verification-failed'
      visible={props.visible}
      centered
      width={462}
      onCancel={props.onClose}
      footer={<Button key="submit" type="primary" onClick={props.onClose}>OK</Button>}
    >
      <span className='fail-title'>Account Verification failed</span>
      <img src={require('asset/svg/warning-triangle-icon.svg')} alt="warning" />
      <p> You have reached the maximum number of attempts. Please contact creators.support@newsbreak.com for support.</p>
    </Modal>
  )
}
