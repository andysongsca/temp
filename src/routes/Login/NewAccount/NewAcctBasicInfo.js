/* eslint-disable no-template-curly-in-string */
import React, { useState, useEffect, useCallback } from 'react'
import { Radio, Checkbox, Button, Select } from 'antd'
import cx from 'classnames'
import api from 'utils/api'
import { Form, Input } from 'antd'
import { PolicyModal, PublisherTos, CreatorTos } from 'components/Policy'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import logEvent from 'utils/logEvent'
import VerificationModal from './VerificationModal'
import VerificationFailureModal from './VerificationFailureModal'
import TimerCountDown from './TimerCountdown'

import './NewAcctBasicInfo.scss';

const { Option } = Select;
const MAX_RESEND_TIMES = 5

export default function NewAcctBasicInfo(props) {
  const { layout, handlePrev, handleNext, isCreator, creatorInfo, isOpenRegistration, sendTwilioVerification, onVerifyFailure, userProperties, username, phoneNumber } = props
  const [mediaType, setMediaType] = useState(isCreator ? 3 : 1)
  const [agreePolicy, setAgreePolicy] = useState(false)
  const [showTosModal, setShowTosModal] = useState(false)
  const [form] = Form.useForm()
  const [phone, setPhone] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [verificationChannel, setVerificationChannel] = useState("sms")
  const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(false)
  const [phoneValid, setPhoneValid] = useState(false)
  const [resendCodeTimes, setResendCodeTimes] = useState(0)
  const [failureModalVisible, setFailureModalVisible] = useState(userProperties && userProperties.registration_blocked)
  const [phoneInUseErrorVisible, setPhoneinUseErrorVisible] = useState(false)
  const phoneNeeded = phoneNumber !== '1(111)-1111'
  useEffect(() => {
    if (creatorInfo && creatorInfo.firstname) {
      form.setFieldsValue({
        first_name: creatorInfo.firstname,
        last_name: creatorInfo.lastname,
      })
    }
    const reg = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/
    if (phone && phone.match(reg)) {

      // verify phone is not used by other user previously
      const phone_number = "1" + phone

      api.get('/media/get_phone_in_use/' + phone_number).then(res => {
        if (res && res.data && res.data.data) {
          setPhone("")
          setPhoneinUseErrorVisible(true)
        } else {
          setPhoneValid(true)
        }
      })
    }
  }, [creatorInfo, phone])

  const onClickAgreeCheckbox = () => {
    if (!agreePolicy) {
      setShowTosModal(true)
      logEvent('new_account_tos_modal_open')
    } else {
      setAgreePolicy(false)
    }
  }

  const handleClickTermsLink = useCallback(() => {
    setShowTosModal(true)
    logEvent('new_account_tos_modal_open')
  }, []);

  const onCheckAgreeInModal = (e) => {
    const agreed = e.target.checked
    setAgreePolicy(agreed)
    logEvent(`new_account_agree_tos_${agreed}`)
  }

  const onCloseTos = () => {
    setShowTosModal(false)
    logEvent('new_account_tos_modal_close')
  }

  const validateMessages = {
    required: '${label} is required',
    types: {
      email: '${label} is not valid email',
    },
  }

  const onPhoneChange = e => {
    setPhoneinUseErrorVisible(false)

    const input = e.target.value
    const formatted = formatPhoneNumber(input)
    setPhone(formatted)

  }

  function formatPhoneNumber(value) {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6, 10)}`;
  }

  const sendVerification = (event) => {
    event.preventDefault();
    if (phone) {
      // send the code via Twilio channel and open the modal
      sendTwilioVerification(phone, verificationChannel)
      setResendCodeTimes(resendCodeTimes + 1)
      if (resendCodeTimes >= MAX_RESEND_TIMES) {
        api.post('/block_user_registration', { "username": username })
        setFailureModalVisible(true)
      } else {
        setModalVisible(true)
      }
    }
    setVerifyButtonDisabled(true)
    setTimeout(() => setVerifyButtonDisabled(false), 60000);
  }

  const urlValidator = (rule, value) => {
    const reg = /^((http|https):\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/g
    return (rule.required === 'true' && !value.trim()) || (value && value.match(reg) === null) ?
      Promise.reject('Please enter a valid URL') : Promise.resolve()
  }

  const phoneValidator = () => {
    return !phoneVerified ? Promise.reject('Please click “get verification code” to verify your phone number before proceeding.') : Promise.resolve()
  }

  const handleVerificationChange = value => {
    setVerificationChannel(value)
  }

  const verfication_button_text = phoneVerified ? "Verified Successfully" : "Get Verification Code"

  return <div className="basic-info">
    <header>
      <h1>Complete account<br />information</h1>
      <img src={require('asset/img/basic-info.png')} alt="" />
    </header>

    <h3>Who's managing this account?</h3>
    <Form
      {...layout}
      initialValues={{ media_type: mediaType + '' }}
      validateMessages={validateMessages}
      labelAlign="left"
      colon={false}
      onFinish={handleNext}
      form={form}
    >
      <Form.Item
        label="Account admin name"
        rules={[{ required: true }]}
        tooltip={creatorInfo && !isOpenRegistration && {
          color: 'white',
          title: (
            <div className='new-account-item-tooltip'>
              The legal first and last name are auto-populated from your hubspot form.
              Please ensure the information is correct,
              and do not hesitate to contact us @creators.support@newsbreak.com if you’ve seen an error.
            </div>
          ),
          icon: <IconInfo />,
        }}
      >
        <Form.Item
          key="first_name"
          name="first_name"
          label="First name"
          className="no-label"
          rules={[{ required: true }]}
          style={{ display: 'inline-block', width: 'calc(45% - 10px)', margin: '0' }}
          extra="Legal first name"
        >
          <Input
            className="input"
            label="First name"
            disabled={!!(creatorInfo && creatorInfo.firstname)}
          />
        </Form.Item>
        <Form.Item
          key="last_name"
          name="last_name"
          label="Last name"
          className="no-label"
          rules={[{ required: true }]}
          style={{ display: 'inline-block', width: 'calc(45% - 10px)', margin: '0 18px' }}
          extra="Legal last name"
        >
          <Input
            className="input"
            label="Last name"
            disabled={!!(creatorInfo && creatorInfo.lastname)}
          />
        </Form.Item>
      </Form.Item>
      <Form.Item
        label="Register my account as a"
        name="media_type"
        className="media-type"
      >
        <Radio.Group onChange={(e) => setMediaType(parseInt(e.target.value))} >
          <Radio value="1">Company</Radio>
          <Radio value="0">Personal blog</Radio>
          <Radio value="3" style={{ display: 'none' }}>Contributor</Radio>
        </Radio.Group>
      </Form.Item>
      {phoneNeeded && mediaType === 3 && isOpenRegistration && <> <Form.Item
        label="Verify Phone Number"
        name="phone_number"
        extra="Enter your valid U.S. phone number using numbers only and no symbols. "
        rules={[{ required: true, validator: phoneValidator, message: 'Please click “get verification code” to verify your phone number before proceeding.' }]}
      >
        <Input className="input sms" addonBefore="+1" placeholder="xxx-xxxx-xxxx" onChange={onPhoneChange} disabled={phoneVerified} value={phone} />
        <Select className='verify-select' defaultValue="SMS" onChange={handleVerificationChange}>
          <Option value="sms">SMS</Option>
          <Option value="call">Phone Call</Option>
        </Select>
        <Button className='verify-sms-button'
          onClick={sendVerification}
          disabled={phoneVerified || !phone || verifyButtonDisabled || !phoneValid}>{verfication_button_text}</Button>
        {verifyButtonDisabled && !phoneVerified && <TimerCountDown seconds={60} />}
        {phoneInUseErrorVisible && <span className="phone-in-use-error"> This phone number has been used by another user.</span>}
      </Form.Item> </>}
      {isOpenRegistration && <>
        <Form.Item
          name="occupation"
          label="Occupation"
          rules={[{
            required: true,
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject(new Error('Please select one from dropdown')),
          }]}>
          <Select className='occupation-select'>
            <Option value="Journalist">Journalist</Option>
            <Option value="Blogger">Blogger</Option>
            <Option value="Editor">Editor</Option>
            <Option value="Journalism student">Student</Option>
            <Option value="Writer">Writer</Option>
            <Option value="Freelancer">Freelancer</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Social Media Links"
          name="social_media"
          extra="Link(s) to your social media accounts (Instagram, Twitter, reddit, etc.). Please seperate links with a comma"
        >
          <Input.TextArea className="social-media" placeholder="e.g., https://twitter.com/NB_Originals, https://www.facebook.com/creatornetwork/" />
        </Form.Item>
        <Form.Item
          name="hear_about_us"
          label="How did you hear about us?"
          rules={[{
            required: true,
            validator: (_, value) =>
              value ? Promise.resolve() : Promise.reject(new Error('Please select one from dropdown')),
          }]}>
          <Select className='hear-about-us-select'>
            <Option value="Social media_Facebook">Facebook</Option>
            <Option value="Social media_Twitter">Twitter</Option>
            <Option value="Social media_Instagram">Instagram</Option>
            <Option value="Social media_Tik Tok">Tik Tok</Option>
            <Option value="Social media_Other">Other social media</Option>
            <Option value="Ads">Ads</Option>
            <Option value="Friends/Family">Friends/Family</Option>
            <Option value="Word of mouth">Word of mouth</Option>
            <Option value="Job board">Job board</Option>
            <Option value="Medium">Medium</Option>
            <Option value="Reddit">Reddit</Option>
            <Option value="Search engine">Search engine</Option>
            <Option value="NewsBreak Creator">NewsBreak Contributor</Option>
            <Option value="Employee">Employee</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item> </>}
      {mediaType !== 1 ? <Form.Item
        label="Blog website"
        name="website"
        rules={[{ validator: urlValidator, message: 'Please enter a valid URL' }]}
        extra="Website for your blog"
      >
        <Input className="input" />
      </Form.Item> : [
        <Form.Item
          key="company_name"
          label="Company name"
          name="company_name"
          rules={[{ required: "true" }]}
          extra="Enter the legal name associated with the account"
        >
          <Input className="input" />
        </Form.Item>,
        <Form.Item
          key="website"
          label="Company website"
          name="website"
          rules={[{ required: "true", validator: urlValidator, message: 'Please enter a valid URL' }]}
          extra="Website for your company"
        >
          <Input className="input" />
        </Form.Item>]
      }

      <div className="agree-checkbox-container">
        <Checkbox className="agree-checkbox" onClick={onClickAgreeCheckbox} checked={agreePolicy} />
        <span>
          Before you can proceed, you must read & accept the
          <Button type="link" className="inline-link" onClick={handleClickTermsLink}>
            Terms of Services
          </Button>.
        </span>
      </div>

      <Form.Item className='btn-container'>
        <Button className='Button Button-Light' htmlType="button" onClick={handlePrev} >
          Cancel
        </Button>
        <Button
          className={cx('Button', 'submit-btn')}
          type={'primary'}
          htmlType='submit'
          disabled={!agreePolicy}
        >
          Save & next
        </Button>
      </Form.Item>

    </Form>

    {isCreator ?
      <PolicyModal
        title="NewsBreak Contributor Network Terms of Service"
        filename="creator-tos.pdf"
        visible={showTosModal}
        footer={<Button key="submit" type="primary" onClick={onCloseTos}>OK</Button>}
      >
        <CreatorTos showCheckbox={true} checked={agreePolicy} onCheck={onCheckAgreeInModal} />
      </PolicyModal> : <PolicyModal
        title="NewsBreak Publisher Platform Terms of Service"
        visible={showTosModal}
        footer={<Button key="submit" type="primary" onClick={onCloseTos}>OK</Button>}
      >
        <PublisherTos showCheckbox={true} checked={agreePolicy} onCheck={onCheckAgreeInModal} />
      </PolicyModal>
    }

    <VerificationModal
      visible={modalVisible}
      phone={phone}
      remainingCodeLeft={MAX_RESEND_TIMES - resendCodeTimes}
      onClose={() => {
        setModalVisible(false)
        logEvent('verification_modal_close')
      }}
      onVerifySuccess={() => {
        setModalVisible(false)
        setPhoneVerified(true)
        logEvent('verification_success')
        form.setFieldsValue({ "phone_number": "1" + phone })
      }} />

    <VerificationFailureModal
      visible={failureModalVisible}
      onClose={onVerifyFailure} />
  </div >
}
