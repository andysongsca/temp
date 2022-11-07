import React, { useEffect } from 'react'
import logEvent from 'utils/logEvent'
import { AccountStats, ContentStats, AudienceStats } from './component'

import './Analytics.scss'

export default function AccountAnalytics(props) {
  useEffect(() => {
    logEvent('page_visit_start', { page: 'analytics' })
    return () => {
      logEvent('page_visit_end', { page: 'analytics' })
    }
  }, [])

  return (
    <div className="analytics">
      <AccountStats />
      <ContentStats />
      <AudienceStats />
    </div>
  )
}
