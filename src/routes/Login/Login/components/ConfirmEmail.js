import React from 'react'
import { Button } from 'antd'
import Header from '../../../Static/Header'

const ConfirmEmail = (props) => {
  const { onResendEmail, isCreator = false, email } = props
  window.fbq("track", "SubmitApplication")

  return <>
    <Header className="small" isCreator={isCreator} />
    <div className="Login simple">
      <div className="section-top">
        <div className="wrapper">
          <div className="container confirm-email">
            <img src={require("asset/img/confirm-email.png")} alt="email" />
            <h1>Confirm your account email</h1>
            <div className="info">
              A confirmation email has been sent to: {email}<br />Please check your email to continue.
            </div>
            <Button type="primary" className="Button" onClick={() => onResendEmail(email)}>
              Resend Email
            </Button>
            {/* <div className="info">
              <span>Entered wrong email? </span>
              <button className="change-email-btn" onClick={onChangeEmail}>
                Change it here
              </button>
            </div> */}
            <div className="small-text">
              If you’re still not receiving the email, please check your spam folder to be sure that
              our emails are not being detected as spam.
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}

export default ConfirmEmail
