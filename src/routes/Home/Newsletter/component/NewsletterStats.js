import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { fetchNewsletterStats } from 'redux/newsletter'
import { formatNumber } from 'utils/utilities'

const NewsletterStats = (props) => {
  const [stats, setStats] = useState({})
  useEffect(() => {
    props.fetchNewsletterStats().then(({ value: { data } }) => {
      setStats(data && data.code === 0 && data.data ? data.data : {})
    })
  }, [])

  const { totalSentCount, totalOpenCount, totalSubscriberCount } = stats

  return <div className="section stats-summary">
    <div>
      <div className="title">Total subscribers</div>
      <div className="data">{formatNumber(totalSubscriberCount || '-')}</div>
    </div>
    <div>
      <div className="title">Total sent</div>
      <div className="data">{formatNumber(totalSentCount || '-')}</div>
    </div>
    <div>
      <div className="title">Total opened</div>
      <div className="data">{formatNumber(totalOpenCount || '-')}</div>
    </div>
  </div>
}

export default connect(
  null,
  { fetchNewsletterStats },
)(NewsletterStats)