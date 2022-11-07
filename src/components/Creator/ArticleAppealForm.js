import React, { useState } from 'react'
import { Form, Input, Button, Modal } from 'antd'
import BodyClassName from 'react-body-classname'
import api from '@/utils/api'
import './ArticleAppealForm.scss'
import { ModalContext } from 'components/Creator'
const { TextArea } = Input;

export default function ArticleAppealForm(props) {
  const { visible, onClose, title, taskId } = props
  const [reason, setReason] = useState("")
  const [appealError, setAppealError] = useState("")
  const context = React.useContext(ModalContext)
  const onSubmit = () => {
    api.post('/media/append_audit_appeal_task', {
      task_id: taskId,
      reason: reason
    }).then(res => {
      if(res && res.data && res.data.code === 0) {
        onClose()
        context.openAppealSubmittedModal()
      } else {
        setAppealError("Appeal failed. You have already made an appeal to the task.")
      }
    })
  }

  const updateReason = e => {
    setReason(e.target.value)
  }

  return (
    <BodyClassName className="appeal-modal">
      <Modal
        visible={visible}
        centered
        width={734}
        height={566}
        onCancel={onClose}
        footer={null}
      >
        <div className="appeal-form-div">
          <h3>Policy Violation Appeal Form</h3>
          <div>
            <Form className='appeal-form'>
              {title && <span className="title">{title}</span>}
              <Form.Item
                className='reason-item'
                label='Appeal Reasons'
                name='reason'
              >
                <div>Provide a detailed reason for why you believe the strike was issued in error. If applicable, include any links to supporting documentation to help expedite the review process. Failure to provide a detailed reason and/or supporting documentation may result in an appeal rejection.</div>
                <TextArea className="reason-text" placeholder={"e.g., a brief explanation about the reason"} onChange={updateReason} showCount maxLength={255} />
              </Form.Item>
            </Form>
            {appealError && <p className='appeal-error'>{appealError}</p>}
          </div>
          <div className="button-footer">
            <Button key="submit" onClick={onClose}>Cancel</Button>
            <Button key="submit" type="primary" onClick={onSubmit} className='submit-button' disabled={!reason}>Submit</Button></div>
        </div>
      </Modal>
    </BodyClassName>
  )
}