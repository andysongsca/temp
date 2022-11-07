import React, { useEffect, useState } from 'react'
import { Radio, Button } from 'antd'
import api from '@/utils/api'
import logEvent from '@/utils/logEvent'
import { notification } from '@/components/Notification'
import Header from '../../Static/Header'
import { LoginBox, ConfirmEmail, ChangeEmail } from './components'

import './Login.scss'

const CreatorLogin = () => {
  const { pathname } = window.location
  const isRegister = '/pubreg' === pathname || '/creator-register' === pathname
  const [status, setStatus] = useState('/creator-register' === pathname ? 'selectType' : 'default')
  const [creatorType, setCreatorType] = useState('articles')
  const [email, setEmail] = useState('email')
  const isPublisher = pathname === '/publisher-login'

  const handleResendEmail = (em) => {
    logEvent('creators_confirm_email_resend', { email: em })
    api.post('/resend-email', { email: em, type: 3 }).then(() => {
      notification.success('Account activation email has been sent to your registered email.')
    })
    handleConfirmEmail(em)
  }

  const handleConfirmEmail = (em) => {
    setEmail(em)
    if (status !== 'confirmEmail') {
      setStatus('confirmEmail')
    }
  }

  const confirmCreatorType = () => {
    setStatus(creatorType === 'articles' ? 'default' : 'manualRegister')
    logEvent('creator-register-select-type', { type: creatorType })
  }

  const onApplyToJoin = () => {
    logEvent('creator-register-apply-video-creator')
    window.location.href = '/register-video-creator' + window.location.search
  }

  useEffect(() => {
    logEvent('page_visit_start', { page: isRegister ? 'creator-register' : 'creator-login' })
    return () => {
      logEvent('page_visit_end', { page: isRegister ? 'creator-register' : 'creator-login' })
    }
  }, [])

  if (status === 'confirmEmail') {
    logEvent('creators_confirm_email_loaded', { email })
    return <ConfirmEmail
      isCreator={!isPublisher}
      email={email}
      onResendEmail={handleResendEmail}
      onChangeEmail={() => setStatus('changeEmail')}
    />
  }

  if (status === 'changeEmail') {
    return <ChangeEmail
      isCreator={!isPublisher}
      isRegister={isRegister}
      mode={status}
      onResendEmail={handleResendEmail}
      onConfirmEmail={handleConfirmEmail}
    />
  }

  const renderLegalText = () => (
    <div className="privacy-policy-text">
      By clicking “Log in”, you agree to the NewsBreak
      <a href="https://www.newsbreak.com/terms" target="_blank" rel="noopener noreferrer"> Terms of Use
      </a>, <a href="https://www.newsbreak.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy
      </a>, and the Contributors <a href="/creator-content-policy" target="_blank" rel="noopener noreferrer">Content Policy</a>.
    </div>
  )

  return <>
    <Header className="small" isCreator={!isPublisher} />
    <div className="Login simple">
      <div className="section-top">
        <div className="wrapper">
          {status === 'selectType' &&
            <div className="container creator-type-select">
              <h1>What type of content do you create?</h1>
              <Radio.Group onChange={e => setCreatorType(e.target.value)} value={creatorType}>
                <Radio value={'articles'}>Articles</Radio>
                <Radio value={'videos'}>Videos</Radio>
              </Radio.Group>
              <Button type="primary" className="Button" onClick={confirmCreatorType}>Next</Button>
            </div>
          }
          {status === 'default' &&
            <LoginBox
              isCreator={!isPublisher}
              isRegister={isRegister}
              mode={status}
              onResendEmail={handleResendEmail}
              onConfirmEmail={handleConfirmEmail}
            >
              {renderLegalText()}
            </LoginBox>
          }
          {status === 'manualRegister' &&
            <div className="container creator-type-select">
              <h1>Apply to be video contributor</h1>
              <div className="info">
                Our video account registration is currently by acceptance only. If you are interested in
                participating in our early bird video program, please apply to join.
              </div>
              <Button type="primary" className="Button" onClick={onApplyToJoin}>Apply to join</Button>
              <div className="redirect">
                <span>Already have an account? </span>
                <a href="/creator-login">Log in</a>
              </div>
              {renderLegalText()}
            </div>
          }
        </div>
      </div>
      <div className="section-footer">
        <section className="legal">
          <a href="https://www.newsbreak.com/terms" target="_blank" rel="noopener noreferrer">NewsBreak Terms of Use</a>
          <a href="https://www.newsbreak.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="/creator-content-policy" target="_blank" rel="noopener noreferrer">Content Policy</a>
          <a href="/creator-content-requirements" target="_blank" rel="noopener noreferrer">Content Requirements</a>
          <p className="copyright">&#x24B8; 2021 NewsBreak. All Rights Reserved.</p>
        </section>
      </div>
    </div>
  </>
}

export default CreatorLogin
