import React from 'react'
import { Tooltip } from 'components/utils'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'

export default function StatsCard(props) {
  const { type, value, title, desc } = props
  return (
    <div className={`stats-card type-${type}`}>
      <div className="value">{value}</div>
      <div className="title">
        <div className="">{title}</div>
        <Tooltip title={desc} placement="bottom">
          <IconInfo />
        </Tooltip>
      </div>
    </div>
  )
}
