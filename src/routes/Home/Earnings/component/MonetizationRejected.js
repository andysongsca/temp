import React from 'react'
import MonetizationRightPanel from './MonetizationRightPanel'
import '../MonetizationApplication.scss'

const MonetizationRejected = (props) => {
  const { applicationDetail } = props

  return (
    <div className="monetization">
      <div className="monetization-header">
        <div className="left-panel">
          <h1>Sorry, you did not qualify for monetization at this time.</h1>
          <h3>What you can do now:</h3>
          <p>You are eligible to re-apply in 90 days. Meanwhile, let us know if you have any questions by contacting creators.monetization@newsbreak.com</p>
          <p>Read more about our <a href="/monetization-policy" target="_blank" rel="noopener noreferrer">Monetization Policy</a> and <a href="/creator-content-policy" target="_blank" rel="noopener noreferrer">Contributor Content Policy</a> & <a href="/creator-content-requirements" target="_blank" rel="noopener noreferrer">Requirements</a>.</p>
          <button className='Button' disabled={true}>Re-apply for monetization</button>
        </div>
        <div className="sep-line-verticle" style={{ height: 377 }} />
        <MonetizationRightPanel applicationDetail={applicationDetail}/>
      </div>
    </div>
  )
}

export default MonetizationRejected