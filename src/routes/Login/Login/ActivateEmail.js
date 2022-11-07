import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import withQuery from '@/hocs/withQuery'
import api from '@/utils/api'
import logEvent from '@/utils/logEvent'

import './Login.scss'

const ActivateEmail = (props) => {
  const isCreator = window.location.hostname === 'creators.newsbreak.com'
  const [status, setStatus] = useState('pending')
  const [reason, setReason] = useState()

  const gotoLogin = () => {
    window.location.href = isCreator ? '/creator-login' : '/login'
  }

  useEffect(() => {
    logEvent('page_visit_start', { page: 'activate-email' })
    const { location: { query } } = props
    api.post('/activate-email', { activeCode: query.active_code }).then(({ data }) => {
      setStatus(data.status)
      if (data.status === 'success') {
        window.fbq('track', 'CompleteRegistration')
        logEvent('activate_email_success')
        setTimeout(gotoLogin, 3000)
      } else {
        logEvent('activate_email_failed', { reason: data.reason })
        setReason(data.reason)
      }
    })
    return () => {
      logEvent('page_visit_end', { page: 'activate-email' })
    }
  }, [])

  return <div className="Login simple">
    <div className="section-top">
      <div className="wrapper">
        <div className="container activate-email">
          {status === 'pending' && 'Please wait...'}
          {status !== 'pending' &&
            <div className="redirect">
              {status === 'success' && <span>Your account has been activated! Click the button below to sign in.</span>}
              {status === 'failed' && <span>Cannot activate your email: {reason}
                <br /> Click the button below to sign in.</span>}
              <p />
              <Button type="primary" className="Button" onClick={gotoLogin}>
                Sign in
                </Button>
            </div>
          }
        </div>
      </div>
    </div>
  </div>
}

export default withQuery(ActivateEmail)
