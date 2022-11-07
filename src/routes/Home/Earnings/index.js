import React, { useState, useEffect } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import dateFormat from 'dateformat'
import { Button } from 'antd'
import { Tooltip } from 'components/utils'
import withAuth from 'hocs/withAuth'
import logEvent from 'utils/logEvent'
import { getDateForTimezone } from 'utils/utilities'
import { getMediaEarnings } from 'redux/content'
import { Loading, DownloadLink } from 'components/utils'
import { ModalContext } from 'components/Creator'
import { ReferralEarnings, ContentEarnings, EarningsSummary } from './component'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'

import './Earnings.scss'

const defaultEarnings = {
  cr_achieved_earning: 0,
  cr_approved_earning: 0,
  cr_approved_rate: 0,
  cr_approved: 0,
  cr_achieved_rate: 0,
  cr_achieved: 0,
  rr_earning: 0,
  rr_rate: 0,
  reader: 0,
  total_earning: 0,
  total_article_earning: 0,
  total_video_earning: 0,
  pv_metadata: []
}

const Earnings = (props) => {
  const { self, getMediaEarnings } = props
  const [period, setPeriod] = useState(() => {
    const date = getDateForTimezone('PST');
    date.setDate(1)
    return date;
  })
  const [startTime] = useState(() => new Date('2021-02-15').getTime())
  const [showWarning, setShowWarning] = useState(true)
  const [earnings, setEarnings] = useState(null)
  const context = React.useContext(ModalContext)
  const source = self && self.creator_info && self.creator_info.source
  const isSourceOpen = source === "open registration"

  const getEarnings = () => {
    getMediaEarnings(self.media_id, dateFormat(period, 'yyyy-mm-dd')).then(({ value: { data } }) => {
      setEarnings(data.data && data.data.length > 0 ? data.data[0] : defaultEarnings)
    })
  }

  useEffect(() => {
    if (self) {
      logEvent('page_visit_start', { page: 'earnings' })
      getEarnings()
    }
    return () => {
      logEvent('page_visit_end', { page: 'earnings' })
    }
  }, [period])

  if (!self) {
    return null
  }

  const policy = self.policy
  if (!policy || (policy.payment_version < policy.latest_payment_v && policy.latest_payment_v < 3)) {
    window.location = '/home/monetization'
    return null
  }
  const payment_v = policy.payment_version
  if (!earnings) {
    return <Loading />
  }

  const agree_date = getDateForTimezone('PST', policy.payment_accept_time * 1000)
  const { cr_achieved_earning, cr_approved_earning, cr_approved_rate, cr_approved, cr_achieved_rate, cr_achieved,
    rr_earning, rr_rate, reader, total_article_earning, total_video_earning, pv_metadata } = earnings
  const articleEarningData = pv_metadata.filter((item) => !item.is_video)
  const videoEarningData = pv_metadata.filter((item) => item.is_video)
  const showRpm = policy.payment_version === 3

  return (<div className="earnings">
    <div className={`warning ${showWarning ? '' : 'dismissed'}`}>
      <div>Estimated Amount</div>
      <span>All numbers shown for this month are estimates. Finalized payment numbers will be paid on the 15th of next month.
      </span>
      <Tooltip title='Please note, the exact processing time may vary depending on your bank, location and payment method.' placement="right">
        <IconInfo />
      </Tooltip>
      <img src={require('asset/svg/ic-close.svg')} alt="dismiss" className="dismiss" onClick={() => setShowWarning(false)} />
    </div>

    <div className='earning-delay-notice'>
      <span>Not seeing the correct earnings? Please note that estimated earnings might be delayed by up to 48 hours.
      </span>
    </div>

    <EarningsSummary
      period={period}
      startTime={startTime}
      data={earnings}
      showVideoEarnings={videoEarningData.length > 0}
      showReferrals={self.should_show_referrals}
      onPeriodChange={(p) => setPeriod(p)}
    />

    {articleEarningData.length > 0 &&
      <ContentEarnings
        id="article-earning"
        title="Total Article Earnings"
        period={period}
        total={total_article_earning}
        data={articleEarningData}
        showRpm={showRpm}
      />}

    {videoEarningData.length > 0 &&
      <ContentEarnings
        id="video-earning"
        title="Total Video Earnings"
        period={period}
        total={total_video_earning}
        data={videoEarningData}
        showRpm={showRpm}
      />}

    {self.should_show_referrals && <>
      <Button id="reader-referral" className="share-app" onClick={context.openReaderReferralModal}>Share the app</Button>
      <ReferralEarnings
        title="Total Users Referral Earnings"
        period={period}
        total={rr_earning}
        data={[
          {
            title: 'Users Referral',
            rate: rr_rate,
            count: reader,
            amount: rr_earning,
          }
        ]}
      />

      <Button id="creator-referral" className="share-app" onClick={context.openCreatorReferralModal}>Refer contributors</Button>
      <ReferralEarnings
        title="Total Contributors Referral Earnings"
        period={period}
        total={cr_approved_earning + cr_achieved_earning}
        data={[
          {
            title: 'Approved Contributors',
            rate: cr_approved_rate,
            count: cr_approved,
            amount: cr_approved_earning,
          },
          {
            title: 'Contributor Bonuses',
            rate: cr_achieved_rate,
            count: cr_achieved,
            amount: cr_achieved_earning,
            tooltip: 'A Contributor Bonus is earned for each approved contributor who has published at least 50 articles/videos.',
          }
        ]}
      />
    </>}

    <div className="agree-date">You agreed to the Monetization Terms on: {dateFormat(agree_date, 'mm/dd/yyyy ddd hh:MMtt') + ' PST'}</div>
    <div className="section policy-container">
      <Link className="policy-title" to="/home/monetization">
        NewsBreak Contributor Monetization Terms
      </Link>
      <DownloadLink filename={payment_v === 3 ? "monetization-terms-0721.pdf" : isSourceOpen ? "monetization-terms-or.pdf" : "monetization-terms.pdf"} />
    </div>
  </div>)
}

export default compose(
  withAuth,
  connect(
    null,
    { getMediaEarnings }
  )
)(Earnings)
