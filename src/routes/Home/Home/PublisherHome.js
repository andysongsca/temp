/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from 'react'
import { Modal, Button } from 'antd'

import withAuth from 'hocs/withAuth'
import { parseQuery } from 'hocs/withQuery'
import logEvent from 'utils/logEvent'
import AccountStatsHeader from '../Analytics/component/AccountStatsHeader'
import Notification from './component/Notification'
import HomePost from './component/HomePost'

function PublisherHome(props) {
  const { self } = props
  const query = parseQuery(window.location)
  const [congrats, setCongrats] = useState(query.congrats === 'true')
  const { media_id, account, enable_video } = self || {}

  useEffect(() => {
    logEvent('page_visit_start', { page: 'publisher_home' })
    return () => {
      logEvent('page_visit_end', { page: 'publisher_home' })
    }
  }, [])

  if (!self) {
    return <div className="home" />
  }

  const onCloseCongrats = () => {
    setCongrats(false)
    logEvent('new_account_click_congrats_modal')
  }

  return (
    <div className="home">
      <AccountStatsHeader />
      <Notification />
      <HomePost isCreator={false} enableVideo={enable_video} />

      {congrats && <Modal
        className="congrats-modal"
        visible={congrats}
        centered
        width={452}
        onCancel={onCloseCongrats}
        footer={<Button key="submit" type="primary" onClick={onCloseCongrats}>OK</Button>}
      >
        <h3>Congrats! Almost there. <var>&#127881;</var></h3>
        <p>
          <a href={`https://www.newsbreak.com/@c/${media_id}`}
            className="profile-link" rel="noopener noreferrer"
            target="_blank">{account}</a> &#x1F517; is pending approval!
        An email has been sent to confirm that you agree to publish with us. Follow the detailed
        instructions in the email if you have claimed for expedited approval process.
        </p>
      </Modal>}
    </div>
  )
}

export default withAuth(PublisherHome)
