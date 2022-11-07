import React, { useRef, useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import BodyClassName from 'react-body-classname'
import { Carousel } from 'antd'

import withAuth from 'hocs/withAuth'
import { createMediaAccount, updateUserProfile, logout, sendTwilioVerification } from 'redux/login'
import { notification } from 'components/Notification'
import Nav from 'components/Nav'
import logEvent from 'utils/logEvent'
import { WelcomeModal } from 'components/Creator'

import NewAcctNav from './NewAcctNav'
import NewAcctBasicInfo from './NewAcctBasicInfo'
import NewAcctPubInfo from './NewAcctPubInfo'
import NewAcctOptions, { publicationOptions } from './NewAcctOptions'

import './NewAccount.scss'

const requiredFields = ['account', 'description', 'email', 'first_name', 'icon', 'last_name',
  'media_type']
const creatorOpenRequiredFields = ["phone_number", "source", 'hear_about_us', 'occupation']
const openRequiredFieldsNoPhone = ["source", 'hear_about_us', 'occupation']
const formData = new Array(3)

const NewAccount = (props) => {
  const [activeStep, setActiveStep] = useState(0)
  const [welcomeModal, setWelcomeModal] = useState(true)
  const { self, logout, getSelf, createMediaAccount, updateUserProfile } = props
  const carousel = useRef()

  useEffect(() => {
    logEvent('page_visit_start', { page: 'creators-landing' })
    return () => {
      logEvent('page_visit_end', { page: 'creators-landing' })
    }
  }, [])

  if (!self) {
    return null
  }
  const { logintype, username, is_creator, phone_number } = self
  const source = self && self.creator_info && self.creator_info.source
  const isSourceOpen = source === "open registration"
  const userProperties = self && self.properties
  const formItemLayout = {
    layout: 'horizontal',
    labelCol: { span: 7 },
    wrapperCol: { span: 12 },
  }

  const onVerifyFailure = () => {
    logout()
      .then(() => {
        window.location.href = '/login'
      })
  }

  const closeWelcome = () => {
    setWelcomeModal(false)
    logEvent('new_account_step_0_loaded')
  }

  const verifyPayloadFields = (payload) => {
    const missingRequiredField = !requiredFields.every(field => field in payload);
    if (missingRequiredField) {
      notification.error("Please fill in all required fields.")
      return false
    }
    if (is_creator && isSourceOpen) {
      let missingCreatorRequiredField = false
      if (phone_number) {
        missingCreatorRequiredField = !openRequiredFieldsNoPhone.every(field => (field in payload));
      } else {
        missingCreatorRequiredField = !creatorOpenRequiredFields.every(field => (field in payload));
      }
      if (missingCreatorRequiredField) {
        notification.error("Please fill in all required fields.")
        return false
      }
    }
    return true
  }

  const handlePrev = () => {
    if (activeStep > 0) {
      carousel.current.prev()
      setActiveStep(activeStep - 1)
      logEvent(`new_account_step_${activeStep - 1}_loaded`)
    } else {
      logEvent('new_account_creation_quit')
      logout()
        .then(() => {
          window.location.href = '/login'
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
        })
    }
  }

  const handleNext = (vals) => {
    formData[activeStep] = vals
    // if not final step
    if (activeStep < 1 || (!is_creator && activeStep < 2)) {
      carousel.current.next()
      setActiveStep(activeStep + 1)
      if (activeStep === 0) {
        logEvent('new_account_step_1_loaded', { media_type: vals.media_type })
      } else if (activeStep === 1) {
        logEvent('new_account_step_2_loaded')
      }
      return
    }
    // log data
    const logData = {}
    publicationOptions.map((opt) => logData[opt] = (opt in vals) ? 1 : 0)
    logEvent('new_account_creation_submit', logData)
    // submit data
    if (is_creator) {
      formData[2] = {
        'opt_content': 1,
        'opt_profile': 0,
        'opt_widget': 0,
      }
    }
    let payload = { ...formData[0], ...formData[1], ...formData[2] }
    payload['email'] = logintype === 1 && username ? username : null
    payload['new_account'] = 1
    payload['source'] = source
    delete payload['cover']
    if (verifyPayloadFields(payload)) {
      createMediaAccount({ ...payload })
        .then(({ value: { data } }) => {
          if (data.code === 0) {
            getSelf(true).then(user => {
              if (user.account) {
                window.location.href = '/home?congrats=true'
              }
            });
            const params = {
              "nickname": payload["account"],
              "profile": payload["icon"]
            }
            updateUserProfile(params)
          } else {
            notification.error(data.message)
          }
        })
    }
  }

  return (
    <BodyClassName className="mp-light-body">
      <div className={`new-account ${is_creator ? 'is-creator' : ''}`}>
        <Nav />

        <NewAcctNav active={activeStep} isCreator={is_creator} />

        <Carousel
          className="new-account-container"
          ref={carousel}
          dots={false}>
          <NewAcctBasicInfo
            layout={formItemLayout}
            isCreator={is_creator}
            creatorInfo={self.creator_info}
            handleNext={handleNext}
            handlePrev={handlePrev}
            sendTwilioVerification={sendTwilioVerification}
            isOpenRegistration={isSourceOpen}
            onVerifyFailure={onVerifyFailure}
            userProperties={userProperties}
            username={username}
            phoneNumber={phone_number}
          />
          <NewAcctPubInfo
            layout={formItemLayout}
            isCreator={is_creator}
            handleNext={handleNext}
            handlePrev={handlePrev}
            isOpenRegistration={isSourceOpen}
          />
          {!is_creator &&
            <NewAcctOptions
              isCreator={is_creator}
              handleNext={handleNext}
              handlePrev={handlePrev}
            />
          }
        </Carousel >

        <WelcomeModal
          visible={welcomeModal}
          onClose={closeWelcome}
          isCreator={is_creator}
        />
      </div>
    </BodyClassName>
  )
}

export default compose(
  withAuth,
  connect(
    null,
    { createMediaAccount, updateUserProfile, logout, sendTwilioVerification }
  )
)(NewAccount)
