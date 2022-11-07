import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Button } from 'antd'

import logEvent from 'utils/logEvent'
import { fetchReaderReferralStats } from 'redux/stats'
import { Loading } from 'components/utils'
import { ModalContext } from 'components/Creator'
import { NoStatsContent, StatsControlBar, StatsCard } from './component'

import './Analytics.scss'

const ReaderReferralStats = (props) => {
  const [timeRange, setTimeRange] = useState({ value: 'all', from: 0, to: parseInt((new Date()).getTime() / 1000) })
  const { stats: { fetched, data, start_ts }, fetch } = props
  const context = React.useContext(ModalContext)
  const days = Math.ceil((Date.now() / 1000 - start_ts) / 86400)

  useEffect(() => {
    logEvent('page_visit_start', { page: 'analytics_reader_referral' })
    if (fetched === undefined) {
      fetch({
        from_ts: timeRange.from,
        to_ts: timeRange.to
      })
    }
    return () => {
      logEvent('page_visit_end', { page: 'analytics_reader_referral' })
    }
  }, [])

  const onSelectTime = (range) => {
    setTimeRange(range)
    fetch({
      from_ts: range.from,
      to_ts: range.to
    })
  }

  const getSlogan = () => {
    if (!data) {
      return
    }
    const { total_clicks, total_installs } = data
    if (total_clicks < 10 && total_installs < 10) {
      return 'Congratulations! You’ve made it. Keep up with the good work.'
    }
    if (total_clicks < 100 && total_installs < 100) {
      return 'Great! You are making good progress. Hang in there.'
    }
    return 'You nailed it! You set a good example for others.'
  }

  return (
    <div className="analytics reader-referral">
      {!fetched && <div className="section loading"><Loading /></div>}

      {fetched && !data && <NoStatsContent>
        <div className="desc">You don’t have any data yet. Start writing and sharing<br />
        your articles to get the app downloads.</div>
        <Button className="share-app" onClick={context.openReaderReferralModal}>Share the app</Button>
      </NoStatsContent>}

      {fetched && data && <>
        <div className="section stats-header">
          <div className="desc">
            <b>Day {days} in the user referral program.</b><br />
            <span>{getSlogan()}</span>
          </div>
          <Button className="share-app" onClick={context.openReaderReferralModal}>Share the app</Button>
        </div>

        <div className="section stats-content">
          <StatsControlBar selectTimeRange={onSelectTime} timeRange={timeRange.value} />
          <div className="stats-card-container">
            <StatsCard
              type="green"
              value={data.total_clicks}
              title="# of Clicks on shared Articles/Links"
              desc="the # of clicks on shared links or shared articles"
            />
            <StatsCard
              type="pink"
              value={data.total_installs}
              title="# of Apps Downloaded"
              desc="the # of apps download from the links you shared through articles or other media"
            />
          </div>
        </div>
      </>}
    </div>
  )
}

export default connect(
  ({ stats: { readerReferral } }) => ({ stats: readerReferral }),
  { fetch: fetchReaderReferralStats },
)(ReaderReferralStats)
