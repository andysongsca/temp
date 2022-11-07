import React, { useState } from 'react'
import { Pagination } from 'antd'
import dateFormat from 'dateformat'
import { getDateForTimezone } from 'utils/utilities'
import { Tooltip } from 'components/utils'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import EarningsHeader from './EarningsHeader'

const EarningsItemSeparator = () => {
  return (
    <div className="earning-item-sep">
      <hr />
      <div className="text">Content published in previous months</div>
      <hr />
    </div>
  )
}

const EarningsItem = (props) => {
  const { data: { title, is_video, audit_status, publish_date, earning, base, rpm_and_pv }, isEstimated, isPublishedInPeriod, showRpm } = props
  let pv, rev, score, rpm = 0
  if (rpm_and_pv && rpm_and_pv[0]) {
    pv = rpm_and_pv[0]["pv"]
    rev = rpm_and_pv[0]["rev"]
    rpm = rpm_and_pv[0]["rpm"]
    score = rpm_and_pv[0]["score"]
  }
  const showBase = base !== null && base >= 0
  const pubDate = getDateForTimezone('PDT', publish_date * 1000)
  const showRevenue = (showRpm || (!is_video && !showRpm)) && rev >= 0
  return (
    <div className="earning-item content-earning">
      <div className="earning-header">
        <div className="row">
          <div className="desc">Published on {dateFormat(pubDate, 'mm/dd/yyyy ddd hh:MMtt') + ' PST'}</div>
          {<>
            <div className="desc"></div>
            <div className="major-num">{pv}</div>
            {showRpm && rpm >= 0.01 && <div className="major-num">{rpm}</div>}
            {showRpm && rpm < 0.01 && <div className="major-num">N/A
            <Tooltip
                className="rpm-na-tooltip"
                title={<div>RPM is a dynamic metric that represents your revenue per 1,000 page views. N/A means the revenue is too low to display a RPM at this time. Learn more <a href="https://support.newsbreak.com/knowledge/understandingearnings" rel="noopener noreferrer" target="_blank">here</a>.</div>}
              >
                <IconInfo />
              </Tooltip>
            </div>}
            {!showRpm && <div className="major-num">{score}</div>}
          </>}
        </div>
        <div className="row">
          <div className="doc-title">{title}</div>
          <div className="desc"></div>
          <div className="desc">Views</div>
          {showRpm && <div className="desc"><Tooltip
            className="rpm-tooltip"
            title='RPM is a dynamic metric that represents your revenue per 1,000 page views. Different factors determine your revenue including but not limited to subject matter, quality and performance.'
          >
            <IconInfo />
          </Tooltip>RPM</div>}
          {!showRpm && <div className="desc">CV Score</div>}
        </div>
      </div>

      {audit_status !== 3 ?
        <div className="earning-body">
          <div className="row desc">
            <div>Description</div>
            {showBase && isPublishedInPeriod && <div className="border-right">
              {showBase && <Tooltip
                title={is_video ? 'Each qualifying local video receives a base pay. The details can be found in your Monetization terms.' :
                  'Each qualifying article receives a base pay related to CV Score. The details can be found in your Monetization terms.'}
              >
                <IconInfo />
              </Tooltip>}
              Base Pay
            </div>}
            {showRevenue && rev && <div className="border-right">
              <Tooltip
                title="Revenue is calculated based on page views."
              >
                <IconInfo />
              </Tooltip>
              Revenue
            </div>}
            <div>Total</div>
          </div>
          <div className="row">
            <div>{is_video ?
              (isEstimated ? 'Estimated Video Earnings' : 'Video Earnings') :
              (isEstimated ? 'Estimated Article Earnings' : 'Article Earnings')}
            </div>
            {showBase && isPublishedInPeriod && <div className="border-right">
              ${base.toFixed(2)}
            </div>}
            {showRevenue && rev && <div className="border-right">${parseFloat(rev).toFixed(2)}</div>}
            <div>${parseFloat(earning).toFixed(2)}</div>
          </div>
        </div> :
        <div className="earning-body rejected">
          <div className="row">
            {is_video ? 'This video has been disapproved. No earnings for disapproved video.' :
              'This article has been disapproved. No earnings for disapproved articles.'}
          </div>
        </div>}
    </div>
  )
}

const DEFAULT_PAGE_SIZE = 5

export default (props) => {
  const { id, title, desc, period, total, data, showRpm } = props
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [startIndex, setStartIndex] = useState(0)
  const periodMonth = period.getMonth()
  const isEstimated = periodMonth === getDateForTimezone('PDT').getMonth()
  // insert separator if needed
  let dataCopy = [...data]
  const prevMonth = dataCopy.findIndex((item) => periodMonth !== getDateForTimezone('PDT', item.publish_date * 1000).getMonth())
  if (prevMonth > -1) {
    dataCopy.splice(prevMonth, 0, { isSeparator: true })
  }

  const handlePageChange = (page) => {
    setStartIndex((page - 1) * pageSize)
  }

  return <div id={id} className="section">
    <EarningsHeader title={title} desc={desc} period={period} data={total} />

    <div>
      {dataCopy.slice(startIndex, startIndex + pageSize).map((item, index) => {
        if (item.isSeparator) {
          return <EarningsItemSeparator key={index} />
        }
        const isPublishedInPeriod = prevMonth < 0 || (startIndex + index) < prevMonth
        return <EarningsItem data={item} isEstimated={isEstimated} isPublishedInPeriod={isPublishedInPeriod} key={index} showRpm={showRpm} />
      })}
    </div>

    {dataCopy.length > DEFAULT_PAGE_SIZE &&
      <Pagination
        className="earning-items"
        defaultCurrent={1}
        defaultPageSize={DEFAULT_PAGE_SIZE}
        onShowSizeChange={(current, size) => setPageSize(size)}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 25, 50]}
        total={dataCopy.length}
        onChange={handlePageChange}
      />}
  </div>
}
