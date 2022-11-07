import React, { useState, useEffect } from 'react'
import { compose } from 'redux'
import { connect, useDispatch } from 'react-redux'

import withAuth from 'hocs/withAuth'
import { fetchMediaInfo } from 'redux/setting'
import { applyMonetization } from 'redux/login'
import api from 'utils/api'
import { monetizationApplicationMap } from 'utils/utilities'
import ApplyMonetizationModal from './ApplyMonetizationModal'
import MonetizationRightPanel from './MonetizationRightPanel'
import '../MonetizationApplication.scss'

const defaultInfoModalContent = {
  title: '',
  content: '',
  icon: 'warning'
}
const networkErrorTitle = "Network issue"
const networkErrorContent = "Uh-oh it looks like something went wrong on our end. We apologize for the inconvenience, please try again later."
const applyReceivedTitle = "Complete the application"
const applyReceivedContent = "Once you have filled out and submitted your application, you will receive a confirmation email. Submitting this application more than once could result in a delay."
const hubspotFormUrl = "https://share.hsforms.com/1IaZDgc4tS4-X19mEnQy3ow4015m"

const MonetizationApplied = (props) => {
  const { media, self, monetizationApplication, applyMonetization } = props
  const [monetizationStatus, setMonetizationStatus] = useState(self.monetization_application)
  const [infoModalVisible, setInfoModalVisible] = useState(false)
  const [infoModalContent, setInfoModalContent] = useState(defaultInfoModalContent)
  const dispatch = useDispatch();

  useEffect (() => {
    dispatch(fetchMediaInfo())
  }, [])

  const handleTipaltiSettings = () => {
    const params = {
      "first": encodeURIComponent(media.first_name),
      "last": encodeURIComponent(media.last_name),
      "email": encodeURIComponent(self.email || self.username)
    }
    api.post('/setting/payment_settings', {
      params,
    }).then(({ data }) => {
      if (!data.startsWith("https:")) {
        // display error
      } else {
        window.open(data)
      }
    })
  }

  const handleMonetizationApplication = () => {
    const onSuccess = ({ value: { data } }) => {
      if (data.code === 0 && data.data.application_status !== undefined) {
        if (!data.data.application_status) {
          setInfoModalContent({
            title: data.data.error_title,
            content: data.data.error_info,
            icon: "warning"
          })
          setInfoModalVisible(true)
        } else {
          setInfoModalContent({
            title: applyReceivedTitle,
            content: applyReceivedContent,
          })
          setInfoModalVisible(true)
          self.monetization_application = monetizationApplicationMap.Applied
          setMonetizationStatus(monetizationApplicationMap.Applied)
          window.open(hubspotFormUrl, '_blank')
        }
      } else {
        setInfoModalContent({
          title: networkErrorTitle,
          content: networkErrorContent,
          icon: "warning"
        })
        setInfoModalVisible(true)
      }
    }
    applyMonetization().then(onSuccess)
  }

  const onCloseInfoModal = () => {
    setInfoModalVisible(false)
  }

  return (
    <div className="monetization">
      <div className="monetization-header">
        <div className="left-panel">
          {monetizationStatus === monetizationApplicationMap.Not_Applied && <>
            <h1>Congratulations! You're eligible to apply.</h1>
            <h3>What you can do now:</h3>
            <p>In order to earn money on NewsBreak, you must:</p>
            <ul>
              <li>Set up your Tilpati payment account. Please fill out your Tilpalti payment information before proceeding to the application process.</li>
              <button className="Button" onClick={handleTipaltiSettings}>Setup Tipalti payment to proceed</button>
              <li>Apply for monetization with NewsBreak Contributor Network.</li>
              <button className="Button" onClick={handleMonetizationApplication}>Apply for monetization</button>
              <li>Wait for your results. Approval for monetization is up to the discretion of NewsBreak and we reserve the right to approve or deny contributor accounts.</li>
            </ul>
          </>}
          {monetizationStatus === monetizationApplicationMap.Applied && <>
            <h1>Thank you for applying for monetization!</h1>
            <h3>What you can do now:</h3>
            <p>We are reviewing your application and hope to get back to you soon.</p>
            <p>Read more about our <a href="/monetization-policy" target="_blank" rel="noopener noreferrer">Monetization Policy</a>, <a href="/contributor-editorial-standards" target="_blank" rel="noopener noreferrer">Editorial Standards</a>, <a href="/creator-content-policy" target="_blank" rel="noopener noreferrer">Contributor Content Policy</a> and <a href="/creator-content-requirements" target="_blank" rel="noopener noreferrer">Requirements</a>.</p>
            <button className='Button' disabled={true}>Application submitted</button>
          </>}
        </div>
        <div className="sep-line-verticle" style={ monetizationStatus === monetizationApplicationMap.Not_Applied ? { height: 628 } : { height: 377 }} />
        <MonetizationRightPanel applicationDetail={monetizationApplication.data}/>
      </div>
      <ApplyMonetizationModal 
        visible={infoModalVisible}
        infoContent={infoModalContent}
        onClose={onCloseInfoModal}
      />
    </div>
  )
}
export default compose(
  withAuth,
  connect(
    ({ setting, login }) => ({ ...setting, ...login }),
    { fetchMediaInfo, applyMonetization }
))(MonetizationApplied)