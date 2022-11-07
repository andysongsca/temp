import React, { useEffect } from 'react'
import logEvent from 'utils/logEvent'
import { CreateMessage, PublishedMessage } from './component'

import './Circle.scss'

const Insight = (props) => {
  useEffect(() => {
    logEvent('page_visit_start', { page: 'manage-circle' })
    return () => {
      logEvent('page_visit_end', { page: 'manage-circle' })
    }
  }, [])

  return (
    <div className="circle">
      <CreateMessage />
      <PublishedMessage />
    </div>
  )
}

export default Insight