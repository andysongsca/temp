import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import withAuth from '@/hocs/withAuth'
import { fetchAudienceStats } from 'redux/stats'
import { Loading } from '@/components/utils'
import LocationStats from '@/components/Analytics/LocationStats'
import CrossFollowing from '@/components/Analytics/CrossFollowing'

const AudienceStats = (props) => {
  const { self, audienceStats, fetchAudienceStats } = props
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (audienceStats.fetched === undefined) {
      fetchAudienceStats()
    } else if (audienceStats.fetched) {
      setLoading(false)
    }
  }, [audienceStats])

  if (!self || !self.is_creator) {
    return null
  }
  if (loading) {
    return <Loading />
  }

  return <>
    <div className="section">
      <LocationStats data={audienceStats.data.location || null} />
    </div>
    <div className="section">
      <CrossFollowing data={audienceStats.data.other_followed} location={self.location} />
    </div>
  </>
}

export default compose(
  withAuth,
  connect(
    ({ stats: { audienceStats } }) => ({ audienceStats }),
    { fetchAudienceStats },
  ))(AudienceStats)
