import React from 'react'
import { Collapse } from 'antd'

import './ReaderReferralPanel.scss'

const { Panel } = Collapse

export default function ReaderReferralPanel(props) {

  return (
    <div className="reader-ref-container">
      <h1>User Referral Program</h1>
      <span>By writing and sharing the articles to your social channels, websites
        or any other platforms, you will be paid monthly based on how many new readers download the app.</span>
      <Collapse
        bordered={false}
        expandIcon={() => <div>
          <div className="handle-expand">Expand</div>
          <div className="handle-collapse">Collapse</div>
          <img className="handle-icon" src={require('asset/img/down-arrow.png')} alt="toggle" />
        </div>}
      >
        <Panel>
          <ul className="info-list">
            <li><span className="key">1</span>Write your favorite articles and post them.</li>
            <li><span className="key">2</span>Select and share the articles to generate traffic.</li>
            <li><span className="key">3</span>Under “Analytics” on the left navigation panel, check for your new user app downloads and your earnings.</li>
          </ul>
        </Panel>
      </Collapse>
    </div>
  )
}
