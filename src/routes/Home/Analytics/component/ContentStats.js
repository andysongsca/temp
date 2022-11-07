import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Empty } from 'antd'
import InfiniteScroll from 'react-infinite-scroller'

import { fetchCount, fetchPosts } from '@/redux/content'
import withAuth from '@/hocs/withAuth'
import { Tooltip } from 'components/utils'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import { Loading } from '@/components/utils'
import ContentAnalyticsModal from '@/components/Analytics/ContentAnalyticsModal'

import './ContentStats.scss'

const status = 'post'

const ContentStats = (props) => {
  const { fetched, count, offset, posts, self, fetchCount, fetchPosts } = props
  const [currentDoc, setCurrentDoc] = useState(null)

  useEffect(() => {
    if (self && fetched === undefined) {
      fetchCount({status, mode: 'basic'})
    }
  }, [])

  if (!self || !self.is_creator) {
    return null
  }

  return <div className={`section content-stats`}>
    {currentDoc && currentDoc.doc_id && <ContentAnalyticsModal
      visible={!!currentDoc}
      docInfo={currentDoc}
      onClose={() => setCurrentDoc(null)}
    />}

    <div className="section-header">
      <div className="section-title-lg">Your content's performance</div>
    </div>
    <div className="content-list-item content-list-header">
      <div className="title">
        <img src={require('asset/svg/analytics.svg')} width={21} alt="" />
      </div>
      <div className="stats">
        <div>Impressions</div>
        <div>In-app views <Tooltip className='pv-tooltip'
          title="Your views from the NewsBreak app.">
          <IconInfo />
        </Tooltip></div>
        <div>Web share views <Tooltip className='pv-tooltip'
          title="Your views from shares on socia media sites.">
          <IconInfo />
        </Tooltip></div>
        <div>Web search views <Tooltip className='pv-tooltip'
          title="Your views for your Newsbreak.com content coming from web searches.">
          <IconInfo />
        </Tooltip></div>
      </div>
    </div>

    {!fetched && <Loading />}
    {fetched && <div className="content-list">
      {count === 0 ?
        <Empty /> :
        [
          <InfiniteScroll
            key={0}
            loadMore={() => fetchPosts({ status, mode: 'basic' })}
            hasMore={offset < count}
            threshold={100}
            useWindow={false}
            loader={<Loading key={0} />}
          >
            {posts.map((p) => (
              <div className="content-list-item" key={p.title} onClick={() => setCurrentDoc(p)}>
                <div className="title">{p.title}</div>
                <div className="stats">
                  <div>{p.impression || 0}</div>
                  <div>{p.in_app_page_view || 0}</div>
                  <div>{p.web_share_page_view || 0}</div>
                  <div>{p.web_search_page_view || 0}</div>
                </div>
              </div>))}
          </InfiniteScroll>,
          offset >= count && <div className="no-more" key="no-more">No more content</div>
        ]}
    </div>}
  </div>
}

export default compose(
  withAuth,
  connect(
    ({ content: { w } }) => ({ ...w[status] }),
    { fetchCount, fetchPosts },
  ))(ContentStats)
