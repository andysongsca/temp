import React from 'react'
import {  Button, Modal } from 'antd'
import BodyClassName from 'react-body-classname'
import './ArticleAppealForm.scss'

export default function AppealSubmittedModal(props) {
  const { visible, onClose } = props
  return (
    <BodyClassName className="appeal-submitted">
      <Modal
        visible={visible}
        centered
        width={452}
        height={233}
        onCancel={onClose}
        footer={null}
      >
        <div className="appeal-submitted-div">
          <h3>Appeal Submitted</h3>
          <div>Thanks for submitting your strike appeal. Our team will review it and get back to you within a week. While we review your appeal, please don't delete the content.</div>
          <div className='ok-button'><Button type="primary" key="submit" onClick={onClose}>Ok</Button></div>
        </div>
      </Modal>
    </BodyClassName>
  )
}