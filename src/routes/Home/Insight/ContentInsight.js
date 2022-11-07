import React, { useEffect } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'

import { ReactComponent as IconSupport } from 'asset/svg/insight-support.svg'
import withAuth from 'hocs/withAuth'
import logEvent from 'utils/logEvent'
import { LocalInfo } from './component'

import './Insight.scss'

const Insight = (props) => {
  const { self } = props

  useEffect(() => {
    logEvent('page_visit_start', { page: 'insight' })
    return () => {
      logEvent('page_visit_end', { page: 'insight' })
    }
  }, [])

  return (
    <div className="insight">
      <div className="insight-header">
        <h1>Content Insights</h1>
        <span className="insight-header-normal"><b>The content insights tab is a tool from NewsBreak to help you better understand the content and users on our platform.</b> This tab shows you local trending content across different categories. Take a look around, explore what content is resonating with your local community and get inspired to create content that can make an impact.</span>
      </div>
      <LocalInfo userLocation={self.location} />
      <div className="insight-support-footer">
        <IconSupport className="insight-support-icon" />
        <span className="insight-support-bold">How are you using these tools? </span>
        <span className="insight-support-regular">We’d love to hear from you at </span>
        <a className="insight-support-email" href="mailto:creators.support@newsbreak.com">creators.support@newsbreak.com</a>
      </div>
    </div>
  )
}

export default compose(
  withAuth,
  connect()
)(Insight)
