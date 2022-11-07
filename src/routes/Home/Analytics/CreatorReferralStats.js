import React, { useState, useEffect } from 'react'
import { Button } from 'antd'
import { compose } from 'redux'
import { connect } from 'react-redux'

import logEvent from 'utils/logEvent'
import { fetchCreatorReferralStats, fetchCreatorReferralStatsV3 } from 'redux/stats'
import withAuth from 'hocs/withAuth'
import { Loading } from 'components/utils'
import { ModalContext } from 'components/Creator'
import { ReactComponent as IconLink } from 'asset/svg/icon-link-pink.svg'
import { NoStatsContent, StatsControlBar, StatsCard } from './component'

import './Analytics.scss'

const CreatorReferralStats = (props) => {
  const [timeRange, setTimeRange] = useState({ value: 'all', from: 0, to: parseInt((new Date()).getTime() / 1000) })
  const { self, stats, fetch, fetch_v3 } = props
  const context = React.useContext(ModalContext)

  useEffect(() => {
    logEvent('page_visit_start', { page: 'analytics_creator_referral' })
    if (stats.fetched === undefined) {
      if (self && self.is_creator && self.policy && self.policy.payment_version === self.policy.latest_payment_v) {
        fetch_v3({
          media_id: self.media_id,
          from_ts: timeRange.from,
          to_ts: timeRange.to
        })
      } else {
        fetch({
          referral_code: self.referral_code,
          from_ts: timeRange.from,
          to_ts: timeRange.to
        })
      }
    }
    return () => {
      logEvent('page_visit_end', { page: 'analytics_creator_referral' })
    }
  }, [])

  const onSelectTime = (range) => {
    setTimeRange(range)
    if (self && self.is_creator && self.policy && self.policy.payment_version === self.policy.latest_payment_v) {
      fetch_v3({
        media_id: self.media_id,
        from_ts: range.from,
        to_ts: range.to
      })
    } else {
      fetch({
        referral_code: self.referral_code,
        from_ts: range.from,
        to_ts: range.to
      })
    }
  }

  return (
    <div className="analytics creator-referral">
      {!stats.fetched && <div className="section loading"><Loading /></div>}

      {(stats.fetched && stats.data === null) && <NoStatsContent>
        <div className="desc">You don’t have any data yet. Start sharing the platform with <br />
        other writers and get your $250 for each qualified writer.</div>
        <Button className="share-app" onClick={context.openCreatorReferralModal}><IconLink /> Refer contributors</Button>
      </NoStatsContent>}

      {stats.fetched && stats.data && <>
        <div className="section stats-header">
          {(self && self.is_creator && self.policy && self.policy.payment_version === self.policy.latest_payment_v) ?
            <div className="desc">
              <b>Earn up to $250 for each contributor you refer.</b><br />
              <span>Click the "Refer contributors" button to share with your network.</span>
            </div>
            :
            <div className="desc">
              <b>Earn $250 for each qualified writer you referred.</b><br />
              <span>We can’t wait to see how many great people you are going to get.</span>
            </div>
          }
          <Button className="share-app" onClick={context.openCreatorReferralModal}><IconLink /> Refer contributors</Button>
        </div>

        <div className="section stats-content">
          <StatsControlBar selectTimeRange={onSelectTime} timeRange={timeRange.value} />
          <div className="stats-card-container">
            {(self && self.is_creator && self.policy && self.policy.payment_version === self.policy.latest_payment_v) ?
              <>
                <StatsCard
                  type="pink"
                  value={stats.data.pending}
                  title="# of Applications"
                  desc="People who have applied through your referral link."
                />
                <StatsCard
                  type="green"
                  value={stats.data.approved}
                  title="# of Published Contributors"
                  desc="Each approved contributor who has published at least 10 articles/videos earns you $50."
                />
                <StatsCard
                  type="yellow"
                  value={stats.data.achieved}
                  title="# of Bonuses"
                  desc="Each approved contributor who has published at least 50 articles/videos earns you $200."
                />
              </>
              :
              <>
                <StatsCard
                  type="pink"
                  value={stats.data.pending}
                  title="# of Contributor Pending"
                  desc="the # of contributors entered through your referral linked have yet to be approved"
                />
                <StatsCard
                  type="green"
                  value={stats.data.approved}
                  title="# of Contributor Approved"
                  desc="the # of contributors accepted to the program through your referral links"
                />
                <StatsCard
                  type="yellow"
                  value={stats.data.achieved}
                  title="# of Contributor Achieved"
                  desc="the # of contributors achieved equals to the number of contributors who successfully accomplished the program tasks and you will earn a one-time $250 referral bonus for each"
                />
              </>
            }
          </div>
        </div>
      </>}
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    ({ stats: { creatorReferral } }) => ({ stats: creatorReferral }),
    { fetch: fetchCreatorReferralStats, fetch_v3: fetchCreatorReferralStatsV3 },
  )
)(CreatorReferralStats)
