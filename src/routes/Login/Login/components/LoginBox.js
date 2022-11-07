import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import { Button } from 'antd'
import { ReCaptcha } from 'react-recaptcha-google'

import { register, login, logout } from 'redux/login'
import withAuth from 'hocs/withAuth'
import withQuery from 'hocs/withQuery'
import { notification } from 'components/Notification'
import logEvent from 'utils/logEvent'

const LoginBox = (props) => {
  const { isCreator = false, isRegister, mode,
    title = 'Log in to your account',
    register, login, logout, onConfirmEmail, onResendEmail,
    location: { query },
  } = props
  const isProd = window.location.host.endsWith('.newsbreak.com')
  const isOpenRegistration = query.source === 'open'
  let captchaEl = null

  const [email, setEmail] = useState(query.email || '')
  const [emailError, setEmailError] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [confirmError, setConfirmError] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState(null)

  const onLoadRecaptcha = () => {
    if (captchaEl) {
      captchaEl.reset()
      setRecaptchaToken(null)
    }
  }

  const verifyCallback = (token) => {
    setRecaptchaToken(token)
  }

  const expiredCallback = () => {
    setRecaptchaToken(null)
  }

  const handleEmailChange = e => {
    setEmail(e.target.value)
    setEmailError(false)
  }

  const handlePasswordChange = e => {
    const pd = e.target.value
    let valid = pd.length > 0
    if (isRegister) {
      // Password requirements: at least one lower case, one upper case and one numeric char,
      // length btw 8 and 32, no spaces
      valid = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=\S+$).{8,32}$/.test(pd)
    }
    setPassword(pd)
    setPasswordError(!valid)
  }

  const handleConfirmChange = e => {
    const cfm = e.target.value
    setConfirm(cfm)
    setConfirmError(cfm !== password)
  }

  const handleLogin = e => {
    e.preventDefault()
    notification.hide()
    logEvent(isRegister ? 'signup-submitted' : 'login-submitted')

    if (!email || emailError) {
      notification.error('Please enter a valid email address')
    } else if (!password || passwordError) {
      notification.error('Please enter a valid password')
    } else if (isRegister && (!confirm || confirmError)) {
      notification.error('Confirm password field does not match the password field')
    } else {
      if (isRegister) {
        const userType = isCreator ? 3 : 0
        const source = isOpenRegistration ? 'open registration' : ''
        register(email, password, userType, query.referral_code || null, recaptchaToken, source)
          .then(({ value: { data } }) => {
            if (data.status === 'failed') {
              notification.error(data.reason)
              captchaEl.reset()
              setRecaptchaToken(null)
            } else if (data.status === 'success') {
              onConfirmEmail(email)
            } else {
              console.error('error state not set!')
            }
          })
      } else {
        login(email, password).then(({ value: { data } }) => {
          if (data.status === 'failed') {
            console.log(data)
            switch (data.code) {
              case 807: // email has not been activated
                onResendEmail(email)
                break
              case 999: // account is not approved in hubspot
              case 404: // service down
                notification.error(data.reason)
                logEvent('login_fail', { page: 'login', error: data.reason })
                break
              default:
                logEvent('login_fail', { page: 'login', error: data.reason })
                notification.error('Login failed. Please check your username and password and try again.') // data.reason might be too vague
            }
          } else {
            redirect()
          }
        })
      }
    }
  }

  const redirect = () => {
    window.location.href = query.redirect || '/home'
  }

  useEffect(() => {
    onLoadRecaptcha()
    props.getSelf().then(user => {
      if (user) {
        logout()
      }
    })
  }, [])

  return <div className="container">
    {isRegister ?
      <div className="welcome">
        {isCreator ?
          <h1>Register an account</h1> :
          <>
            <div className="sign-up-line"></div>
            <p className="sign-up">Sign Up</p>
          </>
        }
      </div> :
      <div className="welcome">
        <h1>{title}</h1>
      </div>
    }

    {/* <div className="social-login">
      <div className="text">
        OR <br /> Sign up with Email
      </div>
    </div> */}

    <form className="email-login">
      <input
        className={cx("input", emailError && "error")}
        type="text"
        placeholder="Your email address"
        onChange={handleEmailChange}
        disabled={!!query.email}
        value={email}
      />
      <input
        className={cx("input", passwordError && "error")}
        type="password"
        placeholder={isRegister ? "Create your password" : "Your password"}
        onChange={handlePasswordChange}
        value={password}
      />
      {isRegister && <>
        <div className="password-hint">
          A valid password needs to be between 8 and 32 characters long, contains at least one lower case, one upper case and one numeric character,
          and does not contain spaces.
        </div>
        <input
          className={cx("input", confirmError && "error")}
          type="password"
          placeholder="Confirm your password"
          onChange={handleConfirmChange}
          value={confirm}
        />
        <ReCaptcha
          ref={(el) => { captchaEl = el }}
          size="normal"
          data-theme="dark"
          render="explicit"
          sitekey="6Lc34rEZAAAAAJIwixFcu9NndFRqKmctRlPwQXJ-"
          onloadCallback={onLoadRecaptcha}
          verifyCallback={verifyCallback}
          expiredCallback={expiredCallback}
        />
      </>}
      <Button
        type="primary"
        className="Button button-continue"
        disabled={isRegister && isProd && recaptchaToken === null}
        onClick={handleLogin}
      >
        {isRegister ? 'Continue' : mode === 'changeEmail' ? 'Submit' : 'Log in'}
      </Button>
    </form>

    {mode !== 'changeEmail' && (isRegister ?
      <div className="redirect">
        <span>Already have an account? </span>
        <a href={isCreator ? '/creator-login' : '/login'}>Log in</a>
      </div> :
      <>
        <a className="forget-password" href="/forget-password">Forgot password?</a>
        <div className="redirect">
          <span>No account? </span>
          {isCreator ?
            <a href="/creator-register?source=open">Register your writing account</a> :
            <a href="https://share.hsforms.com/1cyy4sbCiR0aCvTyLa2f6uA4015m">Get in touch</a>
          }
        </div>
      </>
    )}

    {props.children}
  </div>
}

export default compose(
  withAuth,
  withQuery,
  connect(null, {
    register,
    login,
    logout,
  })
)(LoginBox)
