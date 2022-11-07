import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { fetchReaderReferralStats } from 'redux/stats'
import StatsCard from './StatsCard'

const ReaderReferralStatsContent = (props) => {
  const { stats, fetch } = props

  useEffect(() => {
    fetch({
      from_ts: props.timeRange.from,
      to_ts: props.timeRange.to
    })
  }, [props.timeRange.from, props.timeRange.to])

  return (
    <div className="stats-card-container">
      <StatsCard
        type="share"
        value={stats.data.total_clicks}
        title="# of Clicks on shared Articles/Links"
        desc="the # of clicks on shared links or shared articles"
      />
      <StatsCard
        type="download"
        value={stats.data.total_installs}
        title="# of Apps Downloaded"
        desc="the # of apps download from the links you shared through articles or other media"
      />
    </div>
  )
}

export default connect(
  ({ stats: { readerReferral } }) => ({ stats: readerReferral }),
  { fetch: fetchReaderReferralStats },
)(ReaderReferralStatsContent)
