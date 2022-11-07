import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Modal } from 'antd'
import dateFormat from 'dateformat'

import { Loading } from '@/components/utils'
import { fetchDocStats } from 'redux/stats'
import { formatStats } from 'utils/utilities'
import withAuth from 'hocs/withAuth'
import LocationStats from './LocationStats'
import { Tooltip } from 'components/utils'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'

import './ContentAnalyticsModal.scss'

const analyticsCols = [
  {
    label: 'Impressions',
    dataIndex: 'impression',
  },
  {
    label: 'In-app views',
    dataIndex: 'in_app_page_view',
    tooltipText: 'Your views from the NewsBreak app'
  },
  {
    label: 'Followers',
    dataIndex: 'follow_count',
  },
  {
    label: 'Likes',
    dataIndex: 'like',
  },
  {
    label: 'Comments',
    dataIndex: 'comment',
  },
  {
    label: 'Shares',
    dataIndex: 'share',
  },
]

const webAnalyticsCols = [
  {
    label: 'Web search views',
    dataIndex: 'web_search_page_view',
    tooltipText:'Your views for your Newsbreak.com content coming from web searches'
  },
  {
    label: 'Web share views',
    dataIndex: 'web_share_page_view',
    tooltipText: 'Your views from shares on social media sites'
  },
  {
    label: 'Other views',
    dataIndex: 'web_other_page_view',
    tooltipText: 'Your views from all other web traffic that aren’t included in search or share'
  },
]


const ContentAnalyticsModal = (props) => {
  const { docInfo: { doc_id, covers, title, og, ts, origin_video_url }, docStats, visible, onClose } = props
  const isVideo = !!origin_video_url
  const coverImageSrc = og ? og.img : covers ? covers[0] : null
  const [statsData, setStatsData] = useState(docStats[doc_id])
  useEffect(() => {
    if (!statsData || !statsData.fetched) {
      props.fetchDocStats(doc_id).then(() => {
        setStatsData(props.docStats[doc_id])
      })
    }
  }, [])

  return (
    <Modal
      className="content-analytics"
      visible={visible}
      centered
      width={980}
      footer={null}
      onCancel={onClose}
    >
      <div className="modal-header"><h1>{isVideo ? 'Video analytics' : 'Article analytics'}</h1></div>
      <div className="post-info">
        <img alt="cover" className="cover-image" src={coverImageSrc || require('asset/img/default-cover.png')} />
        <div className="post-content">
          <h2 className="title">{og ? og.text_message : title}</h2>
          <div className="post-date">
            <span>Published on {dateFormat(new Date(ts * 1000), 'm/d/yyyy ddd HH:MM')}</span>
          </div>
        </div>
      </div>

      {statsData && statsData.fetched ? <>
        <div className="stats-content">
          <div className="section-header">
            <span>In-app performance</span>
            <span>
              <Tooltip className="section-header-tooltip" title="The content's performance from the Newsbreak app" placement="bottom">
                <IconInfo />
              </Tooltip>
            </span>
          </div>
          <div className="totals">{
            analyticsCols.map(({ label, dataIndex, tooltipText }, index) => {
              const num = statsData.data.stats[dataIndex]
              const numStr = isNaN(num) ? { original: '', short: '-' } : formatStats(num)
              return [
                index > 0 && <div className="sep" key={'sep-' + index} />,
                <div className='total' key={label}>
                  <h1 title={numStr.original}>{numStr.short}</h1>
                  <div className="total-title">
                    <span>{label}</span>
                    {tooltipText &&
                      <Tooltip className="pv-tooltip" title={tooltipText} placement="bottom">
                        <IconInfo />
                      </Tooltip>}
                  </div>
                </div>
              ]
            })
          }
          </div>
          <div className="section-header">
            <span>Web performance</span>
            <span>
              <Tooltip className="section-header-tooltip" title="The content's performance from Newsbreak.com" placement="bottom">
                <IconInfo />
              </Tooltip>
            </span>
          </div>
          <div className="totals">{
            webAnalyticsCols.map(({ label, dataIndex, tooltipText }, index) => {
              const num = statsData.data.stats[dataIndex]
              const numStr = isNaN(num) ? { original: '', short: '-' } : formatStats(num)
              return [
                index > 0 && <div className="sep" key={'sep-' + index} />,
                <div className='total' key={label}>
                  <h1 title={numStr.original}>{numStr.short}</h1>
                  <div className="total-title">
                    <span>{label}</span>
                    {tooltipText &&
                      <Tooltip className="pv-tooltip" title={tooltipText} placement="bottom">
                        <IconInfo />
                      </Tooltip>}
                  </div>
                </div>
              ]
            })
          }
          </div>
        </div>
        <LocationStats data={statsData.data.location} />
      </> : <Loading />}
    </Modal>
  )
}

export default compose(
  withAuth,
  connect(
    ({ stats: { docStats } }) => ({ docStats }),
    { fetchDocStats },
  )
)(ContentAnalyticsModal)
