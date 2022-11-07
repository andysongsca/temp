import React from 'react'
import MonetizationRightPanel from './MonetizationRightPanel'
import '../MonetizationApplication.scss'

const MonetizationNotApplied = (props) => {
  const { applicationDetail } = props

  return (
    <div className="monetization">
      <div className="monetization-header">
        <div className="left-panel">
          <h1>Monetize with the NewsBreak Contributor Network</h1>
          <h3>What you can do now:</h3>
          <p>To apply for monetization, your account must have at least {applicationDetail.target_follower_count} registered followers and {applicationDetail.target_article_count} posts.</p>
          <p>Read more about our <a href="/monetization-policy" target="_blank" rel="noopener noreferrer">Monetization Policy</a>, <a href="/contributor-editorial-standards" target="_blank" rel="noopener noreferrer">Editorial Standards</a>, <a href="/creator-content-policy" target="_blank" rel="noopener noreferrer">Contributor Content Policy</a> and <a href="/creator-content-requirements" target="_blank" rel="noopener noreferrer">Requirements</a>.</p>
        </div>
        <div className="sep-line-verticle" style={{ height: 377 }} />
        <MonetizationRightPanel applicationDetail={applicationDetail}/>
      </div>
    </div>
  )
}

export default MonetizationNotApplied