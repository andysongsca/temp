import React from 'react'

export default function ReferralHeaderStats(props) {
  return (
    <div className={`stats-header ${props.className}`}>
      {props.children}
    </div>
  )
}
