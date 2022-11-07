import React from 'react'

export default function NoStatsContent(props) {
  return (
    <div className="section no-stats-content">
      <img src={require('asset/img/analytics-empty.png')} alt="no data" />
      {props.children}
    </div>
  )
}
