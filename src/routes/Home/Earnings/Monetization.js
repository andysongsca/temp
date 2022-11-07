import React, { useState, useEffect } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Button } from 'antd'

import withAuth from 'hocs/withAuth'
import logEvent from 'utils/logEvent'
import { updatePolicy } from 'redux/login'
import { MonetizationTerms, MonetizationTermsOpenRegistration } from 'components/Policy'
import { DownloadLink } from 'components/utils'

import './Earnings.scss'
import MonetizationTermsV2 from '@/components/Policy/MonetizationTermsV2'

const Monetization = (props) => {
  const { self, updatePolicy } = props
  const agreed = self && self.policy && self.policy.payment_version >= self.policy.latest_payment_v
  const [bthEnabled, setBtnEnabled] = useState(false)
  const source = self && self.creator_info && self.creator_info.source
  const isSourceOpen = source === "open registration"
  const isPaymentV2 = self && self.policy && self.policy.latest_payment_v === 3

  useEffect(() => {
    logEvent('page_visit_start', { page: 'monetization' })
    return () => {
      logEvent('page_visit_end', { page: 'monetization' })
    }
  }, [])

  const onClickAgree = (e) => {
    logEvent('monetization_policy_agreed', { src: 'monetization_page' })
    updatePolicy('payment', self.policy.latest_payment_v).then(() => {
      self.policy.payment_version = self.policy.latest_payment_v
      window.location = '/home/earnings'
    })
  }

  return (
    <div className={`section monetization ${agreed ? 'agreed' : ''}`}>
      {isPaymentV2 ? <>
        <DownloadLink filename="monetization-terms-0721.pdf" />
        <div className="section-title-lg">NewsBreak Contributor Monetization Terms</div>
        <MonetizationTermsV2
          showCheckbox={true}
          checked={bthEnabled}
          checkboxDisabled={agreed}
          onCheck={(e) => setBtnEnabled(e.target.checked)}
        />
        <hr />
      </> : isSourceOpen ?
        <>
          <DownloadLink filename="monetization-terms-or.pdf" />
          <div className="section-title-lg">NewsBreak Contributor Monetization Terms</div>
          <MonetizationTermsOpenRegistration
            showCheckbox={true}
            checked={bthEnabled}
            checkboxDisabled={agreed}
            onCheck={(e) => setBtnEnabled(e.target.checked)}
          />
          <hr />
        </>
        :
        <>
          <DownloadLink filename="monetization-terms.pdf" />
          <div className="section-title-lg">NewsBreak Contributor Monetization Terms</div>
          <MonetizationTerms
            showCheckbox={true}
            checked={bthEnabled}
            checkboxDisabled={agreed}
            onCheck={(e) => setBtnEnabled(e.target.checked)}
          />
          <hr />
        </>
      }
      {agreed ? <Button className="Button Button-Light" onClick={() => window.history.back()}>Close</Button> :
        <Button className="Button" disabled={!bthEnabled} type="primary" onClick={onClickAgree}>Agree to our policy</Button>}
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    null,
    { updatePolicy }
  )
)(Monetization)
