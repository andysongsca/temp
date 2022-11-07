import React from 'react'
import dateFormat from 'dateformat'
import { getDateForTimezone } from 'utils/utilities'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'

export default (props) => {
  const { title, desc, period, data } = props
  const endDate = getDateForTimezone('PDT', period)
  endDate.setMonth(endDate.getMonth() + 1)
  endDate.setDate(0)

  return <div className="section-header">
    <div className="desc">{dateFormat(period, 'mm/dd/yyyy') + ' - ' + dateFormat(endDate, 'mm/dd/yyyy')}</div>
    <div className="section-title">
      <div className="emphasis">{title}</div>
      <div className="total">${data}</div>
    </div>
    {desc && <div className="section-desc"><IconInfo />{desc}</div>}
  </div>
}