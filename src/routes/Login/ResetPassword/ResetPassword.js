import React, { useState } from 'react'
import { Button } from 'antd'
import { withRouter } from 'react-router'
import api from '@/utils/api'
import logEvent from '@/utils/logEvent'
import { notification } from '@/components/Notification'
import { CONFIRM_NOT_MATCH } from '@/constant/string'

import '../Login/Login.scss'
import './ResetPassword.scss'

const ResetPassword = (props) => {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleClick = () => {
    const query = new URLSearchParams(props.location.search);
    const resetCode = query.get('reset_code')
    if (password !== confirm) {
      notification.error(CONFIRM_NOT_MATCH)
      return
    }
    if (resetCode === null || !password) {
      notification.error('Error: invalid code or password')
    } else {
      logEvent('reset_password_submitted')
      api.get('/user/email-password-reset', {
        password,
        resetCode,
      }).then(({ data }) => {
        if (data.code === 0) {
          props.history.push('/login')
        } else {
          notification.error(data.reason || 'Failed to reset password')
        }
      })
    }
  }

  return <div className="Login simple">
    <div className="section-top">
      <div className="wrapper">
        <div className="container reset-password">
          <div>Reset your password</div>
          <input
            placeholder="New password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            placeholder="Confirm your password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
          <Button type="primary" shape="round" onClick={handleClick}>
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  </div>
}
export default withRouter(ResetPassword)
