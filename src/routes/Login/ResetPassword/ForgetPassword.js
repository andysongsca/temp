import React, { useState } from 'react'
import { Button } from 'antd'
import api from '@/utils/api'
import logEvent from '@/utils/logEvent'
import { notification } from '@/components/Notification'

import '../Login/Login.scss'
import './ForgetPassword.scss'

const errMsg = 'No user was found with that email address.'

const ForgetPassword = () => {
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)

  const handleClick = () => {
    if (!email) {
      notification.error(errMsg)
      return
    }
    logEvent('forget_password_requested')
    api.get('/user/reset-req', { email })
      .then(({ data }) => {
        if (data.code === 0) {
          setSuccess(true)
        } else if (data.code === 802) {
          notification.error(errMsg)
        } else {
          notification.error(data.reason || 'Failed to send reset pasword request')
        }
      })
  }

  return <div className="Login simple">
    <div className="section-top">
      <div className="wrapper">
        {!success ?
          <div className="container forget-password-div">
            <div className="title">Forgot Password?</div>
            <div className="info">
              Enter the email address you used when you joined and we’ll send you
              instructions to reset your password.
              </div>
            <div className="info">
              For security reasons, we do NOT store your password. So rest assured
              that we will never send your password via email.
              </div>
            <input
              type="email"
              placeholder="You email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button type="primary" shape="round" onClick={handleClick}>Send Reset Instructions</Button>
          </div> : <div className="container send-email-success">
            <img alt="" src={require("asset/img/reset-password-success@2x.png")} />
            <div>
              Instructions to reset your password have been sent to you. Please check your email.
              </div>
            <div>
              If you’re still not receiving the email, please check your spam
              folder to be sure that our emails are not being detected as spam.
              </div>
          </div>
        }
      </div>
    </div>
  </div>
}
export default ForgetPassword
