/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react'
import { Checkbox, Form, Button } from 'antd'
import cx from 'classnames'
import logEvent from 'utils/logEvent'
import { ReactComponent as FaceLogo0 } from 'asset/svg/face-0.svg'
import { ReactComponent as IconEmail } from 'asset/svg/email.svg'
import { ReactComponent as IconOpenLink } from 'asset/svg/open-link.svg'

export const publicationOptions = ['opt_profile']

export default function NewAcctOptions(props) {
  const { handleNext, handlePrev, isCreator } = props
  const [checkboxStates, setCheckboxStates] = useState([...publicationOptions])

  const onChangeCheckbox = (e) => {
    const { id, checked } = e.target
    const index = checkboxStates.indexOf(id)
    if (checked) {
      if (index < 0) {
        setCheckboxStates(checkboxStates.concat([id]))
      }
    } else {
      if (index >= 0) {
        setCheckboxStates(checkboxStates.slice(0, index).concat(checkboxStates.slice(index + 1)))
      }
    }
  }

  const onNext = () => {
    const values = {}
    checkboxStates.map((opt) => values[opt] = 1)
    handleNext(values)
  }

  const handleClickPoints = (e) => {
    let { target } = e
    while (target && target.tagName.toUpperCase() !== 'A') {
      target = target.parentElement
    }
    if (target && target.title) {
      logEvent('new_account_step2_click_option', { target: target.title })
    }
  }

  const renderCheckboxes = (hasId) => {
    const checkboxProps = hasId ? { onChange: onChangeCheckbox } : {}
    const numChecked = checkboxStates.length

    return <div className="inner-container">
      <div className="checkbox-points" onClick={handleClickPoints}>
        <div className="point">
          <Checkbox
            id={hasId ? 'opt_profile' : ''}
            checked={checkboxStates.indexOf('opt_profile') >= 0}
            {...checkboxProps}
          />
          <span>Add your NewsBreak publication profile &#x1F517; to your website (e.g. side-by-side with your Facebook page,
          Twitter profile, etc.) to help us validate your account ownership.
          <a
              href="https://support.newsbreak.com/knowledge/add-your-news-break-publication-profile-to-your-website-e.g.-side-by-side-with-your-social-media-profiles-to-help-us-validate-your-account-ownership"
              rel="noopener noreferrer"
              target="_blank"
              title="profile help"
              className="more-info"
            >
              <IconOpenLink />
            </a>
          </span>
        </div>
        <hr />
      </div>
      <div className="promo">
        {numChecked === 0 && <div className="title">&ldquo;Sure.<br />We'll do<br />our best<br /> to get you<br />approved<br />&rdquo; <FaceLogo0 /></div>}
        <div className="contact-us">Any questions? <a
          href={`mailto:${isCreator ? 'creators.support@newsbreak.com' : 'mp.support@newsbreak.com'}`}>Email us <IconEmail /></a>
        </div>
      </div>
    </div>
  }

  return <div className="account-options">
    <header>
      <h1>Wait for account<br />approval</h1>
    </header>

    <div className="explanation">
      <h4>Almost there! Let's submit your publication application.</h4>
      <span>Due to the high volume of applications, please allow 3-7 business days for account review and approval.</span>
    </div>

    <Form
      onFinish={onNext}
    >
      <div className="checkbox-main">
        <div className="checkbox-container">
          {renderCheckboxes(true)}
        </div>

        <div className="checkbox-container-shadow">
          <hr className="diagonal" />
          {renderCheckboxes(false)}
        </div>
        <Form.Item className='btn-container'>
          <Button className='Button Button-Light' htmlType="button" onClick={handlePrev} >
            Back
          </Button>
          <Button
            className={cx('Button', 'submit-btn')}
            type={'primary'}
            htmlType='submit'
          >
            Submit
        </Button>
        </Form.Item>
      </div>
    </Form>
  </div>
}
