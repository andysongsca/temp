import React from 'react'
import dateFormat from 'dateformat'
import { getDateForTimezone } from 'utils/utilities'
import { Tooltip } from 'components/utils'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import { ReactComponent as IconNav } from 'asset/svg/navigation-back.svg'


const EarningsSummary = (props) => {
  const {
    period,
    startTime,
    showVideoEarnings,
    showReferrals,
    onPeriodChange,
    data: {
      cr_achieved_earning,
      cr_approved_earning,
      rr_earning,
      total_article_earning,
      total_video_earning,
      bonus }
  } = props

  const isCurrentMonth = period.getMonth() === getDateForTimezone('PST').getMonth() && period.getFullYear() === getDateForTimezone('PST').getFullYear()
  const isFirstMonth = period.getMonth() === new Date(startTime).getMonth() && period.getFullYear() === new Date(startTime).getFullYear()

  const handleNextMonth = () => {
    let date = new Date(period)
    date.setMonth(date.getMonth() + 1)
    onPeriodChange(date)
  }

  const handlePrevMonth = () => {
    let date = new Date(period)
    date.setMonth(date.getMonth() - 1)
    onPeriodChange(date)
  }

  return (
    <div className="section summary">
      <div className="header">
        <span className={`prev ${isFirstMonth ? 'hidden' : ''}`} title="previous" onClick={handlePrevMonth}><IconNav /></span>
        <span className="period">
          <Tooltip
            title="Earnings cut-off date is calculated based on Pacific Time Zone"
          >
            <IconInfo />
          </Tooltip>
          {dateFormat(new Date(period), 'mmmm yyyy')}</span>
        <span className={`next ${isCurrentMonth ? 'hidden' : ''}`} title="next" onClick={handleNextMonth}><IconNav /></span>
      </div>
      <div className="earnings-summary">
        <div>
          <div><a className="desc" href="#article-earning">Article Earnings</a></div>
          <div className="data">${total_article_earning}</div>
        </div>
        {showVideoEarnings && <div>
          <div><a className="desc" href="#video-earning">Video Earnings</a></div>
          <div className="data">${total_video_earning}</div>
        </div>}
        {bonus > 0 && <div>
            <div><a className="desc" href="#campaign-bonus">Campaign Bonus</a></div>
            <div className="data">${bonus}</div>
        </div>}
        {showReferrals && <>
          <div>
            <div><a className="desc" href="#reader-referral">User Referrals</a></div>
            <div className="data">${rr_earning}</div>
          </div>
          <div>
            <div><a className="desc" href="#creator-referral">Contributor Referrals</a></div>
            <div className="data">${cr_achieved_earning + cr_approved_earning}</div>
          </div>
        </>}
      </div>
    </div>
  )
}

export default EarningsSummary
