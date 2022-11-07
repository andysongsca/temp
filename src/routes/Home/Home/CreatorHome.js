import React, { useEffect, useState } from 'react'

import withAuth from 'hocs/withAuth'
import { parseQuery } from 'hocs/withQuery'
import api from 'utils/api'
import logEvent from 'utils/logEvent'
import { ModalContext } from 'components/Creator'
import AccountStatsHeader from '../Analytics/component/AccountStatsHeader'
import CreatorSetupGuide from './component/CreatorSetupGuide'
import Announcements from './component/Announcements'
import CreatorContents from './component/CreatorContents'
import CreatorHomeFAQ from './component/CreatorHomeFAQ.js'
import StrikeModal from './StrikeModal'
import ContributorModal from './ContributorModal'
import { logout } from 'redux/login'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { useCookies } from "react-cookie"
import dateFormat from 'dateformat'

import './CreatorHome.scss'

function CreatorHome(props) {
  const { self } = props
  const [violationModalVisible, setViolationModalVisible] = useState(false)
  const [contributorModalVisible, setContributorModalVisible] = useState(false)
  const [cookies, setCookies] = useCookies('strike_notif')
  const enableVideo = self && self.enable_video
  const context = React.useContext(ModalContext)
  const latest_payment_v = self && self.policy && self.policy.latest_payment_v
  const accepted_payment_v = self && self.policy && self.policy.payment_version
  const version = {
    latest: latest_payment_v,
    accepted: accepted_payment_v,
    payment_tier: self && self.payment_tier,
    should_show_earning: self && self.should_show_earning
  }
  // check media violations
  let violations = self && self.medias &&
    self.medias.find(media => media.media_id === self.media_id && media.violations && media.violations.count)
  if (violations) {
    const title = violations.violations.latest_doc_title
    const count = violations.violations.count
    const taskId = violations.violations.task_id
    const updatedTime = violations.violations.updated_time
    const policy = violations.violations.policy
    violations = { title, count, taskId, updatedTime, policy }
  }

  const onStrikeModalClose = () => {
    setStrikeModalCookies()
    setViolationModalVisible(false)
  }

  const onReviewViolations = () => {
    setStrikeModalCookies()
    setViolationModalVisible(false)
    window.location.href = '/home/content/strike'
  }

  const onContributorModalClose = () => {
    self.preferences["show_contributor_modal"] = 0
    setContributorModalVisible(false)
    api.post('/media/set_media_preferences', { preferences: self.preferences })
  }

  const setStrikeModalCookies = () => {
    let date = new Date();
    // set cookie to expire in 3 days
    date.setTime(date.getTime() + (3 * 24 * 60 * 60 * 1000));
    setCookies('strike_notif', violations.title, { path: '/', expires: date })
  }

  const onCloseLogout = () => {
    window.location.href = '/home/content/strike'
    setViolationModalVisible(false)
  }

  // will only show suspension warning when it's within 7 days
  const shouldShowSuspendModal = () => {
    if (!violations) {
      return false
    }
    if (violations.count !== 2) {
      return true
    }
    let sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = dateFormat(sevenDaysAgo, 'yyyy-mm-dd');
    return violations.updatedTime > startDate
  }

  const updatePreferences = (stepsDone) => {
    self.preferences['creator_home_setup'] = stepsDone
    api.post('/media/set_media_preferences', { preferences: self.preferences })
  }

  useEffect(() => {
    logEvent('page_visit_start', { page: 'creator_home' })
    if (shouldShowSuspendModal()) {
      setViolationModalVisible(true)
    }
    const { congrats } = parseQuery(window.location)
    if (self && congrats === 'true' && self.should_show_referrals) {
      context.openReaderReferralModal()
    }
    if (self && (self.preferences["show_contributor_modal"] === undefined || self.preferences["show_contributor_modal"] === 1)) {
      setContributorModalVisible(true)
    }
    return () => {
      logEvent('page_visit_end', { page: 'creator_home' })
    }
  }, [])

  if (!self) {
    return <div className="home" />
  }

  return (
    <div className="home">
      <CreatorSetupGuide stepsDone={self.preferences['creator_home_setup'] || []} updatePreferences={updatePreferences} />
      <Announcements version={version} />
      <AccountStatsHeader />
      <CreatorContents enableVideo={enableVideo} />
      <CreatorHomeFAQ />
      {violations && violations.count < 3 &&
        <StrikeModal
          visible={violationModalVisible}
          title={violations.title}
          policy={violations.policy}
          count={violations.count}
          taskId={violations.taskId}
          onClose={onStrikeModalClose}
          onReviewViolations={onReviewViolations}
          cookies={cookies} />}
      {violations && violations.count >= 3 && <StrikeModal
        visible={violationModalVisible}
        title={violations.title}
        count={violations.count}
        onClose={onCloseLogout} />}
      <ContributorModal
        visible={contributorModalVisible}
        onClose={onContributorModalClose}
      />
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    null,
    { logout }
  )
)(CreatorHome)

