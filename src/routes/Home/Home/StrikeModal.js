import React from 'react'
import { Modal, Button } from 'antd'

export default function StrikeModal(props) {
  const { count, title, cookies } = props

  let modal_title = "Policy violation warning ⚠️"
  if (count === 2) {
    modal_title = "Account suspension ⛔️"
  }
  else if (count > 2) {
    modal_title = "Account termination ❌️"
  }
  // if it's first strike and we have shown before, then we don't show the strike modal
  const modal_visible = props.visible && cookies && cookies.strike_notif !== title

  return (
    <Modal
      className='strike-message'
      visible={modal_visible}
      centered
      width={462}
      onCancel={props.onClose}
      footer={<Button key="submit" type="primary" onClick={props.onReviewViolations}>Review violation</Button>}
    >
      <span className='policy-violation'>{modal_title} </span>
      {count === 1 && <p> <b>"{title}"</b> violates our content policy. Another violation will lead to a one week suspension.
        <a href="https://support.newsbreak.com/knowledge/violations-suspensions-and-account-terminations"
          className="step-desc" target="_blank" rel="noopener noreferrer">
          Read more about policy violations
        </a>. </p>}
      {count === 2 && <p><b>"{title}"</b>  violates our content policy.
        Due to multiple violations, your account has been suspended for 1 week and you will not be able to publish or edit any content.
        <a href="https://support.newsbreak.com/knowledge/violations-suspensions-and-account-terminations"
          className="step-desc" target="_blank" rel="noopener noreferrer">
          Read more about policy violations
        </a>.</p>}
      {count >= 3 && <p>You have received your third strike which means your account has now been terminated. If you believe the strike was issued in error, please submit an appeal.</p>}
    </Modal>
  )
}
