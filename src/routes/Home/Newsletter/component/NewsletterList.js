import React, { useEffect, Fragment } from 'react'
import { connect, useDispatch } from 'react-redux'
import InfiniteScroll from 'react-infinite-scroller'

import { fetchNewsletter, fetchNewsletters, getNewsletterCount } from 'redux/newsletter'
import NewsletterItem from './NewsletterItem'
import Loading from 'components/utils/Loading'

import './NewsletterList.scss'

const NewsletterList
  = ({
    items,
    status,
    onPreview
  }) => {
    const dispatch = useDispatch();
    useEffect(() => {
      dispatch(getNewsletterCount(status))
    }, [])

    const { fetched, offset, count } = items || {}

    const onShowPreview = (id) => {
      dispatch(fetchNewsletter(id)).then((res) => {
        const { value: { data: { data } } } = res
        if (!data) {
          return
        }
        let item = {}
        item.title = data.title
        item.content = data.content
        onPreview(item)
      })
    }

    return (
      <Fragment>
        <div className="newsletter-list">
          {!fetched && <Loading />}
          {fetched && (count === 0 ?
            <div>No content</div> : <>
              <InfiniteScroll
                loadMore={() => dispatch(fetchNewsletters(status))}
                hasMore={offset < count}
                threshold={100}
                initialLoad={true}
                useWindow={true}
                loader={<Loading key="loading" />}
              >
                {items.newsletters.map(p => <NewsletterItem {...p} key={p.id} onPreview={onShowPreview} />)}
              </InfiniteScroll>
              {offset >= count && <div className="no-more-newsletter" key={1}>No more newsletters</div>}
            </>)
          }
        </div>
      </Fragment>
    )
  }
export default connect(
  ({ newsletter: { w } }, { status }) => ({ items: w[status] }),
  { fetchNewsletter, fetchNewsletters, getNewsletterCount },
)(NewsletterList)