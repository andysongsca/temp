import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import InfiniteScroll from 'react-infinite-scroller'

import { fetchCount, fetchPosts } from 'redux/content'
import { fetchPost } from 'redux/post'
import Loading from 'components/utils/Loading'
import Empty from './Empty'
import PostItem from './PostItem'

import './PostList.scss'

class PostList extends React.Component {

  componentDidMount() {
    this.load()
  }

  componentDidUpdate() {
    this.load()
  }

  load() {
    if (this.props.fetched !== undefined) {
      return;
    }
    const { status, queryString } = this.props
    this.props.fetchCount({status, queryString})
  }

  onShowPreview = (postId) => {
    this.props.fetchPost(postId).then((res) => {
      const { value: { data: { data } } } = res
      if (!data) {
        return
      }
      const { og } = data
      let item = {}
      if (og) {
        const { title, url, site_name, description, img, text_message } = og
        item.title = ''
        item.content = `<div class="og-comment">${text_message}</div>
        <a class="og-body" target="_blank" href="${url}">${img ? ('<img src="' + img + '" />') : ''}
          <h4>${title}</h4>
          ${description ? ('<div class="og-desc">' + description + '</div>') : ''}
          ${site_name ? ('<div class="og-site">' + site_name + '</div>') : ''}
        </a>`
      } else {
        item.title = data.title
        item.content = data.content
      }
      this.props.onPreview(item)
    })
  }

  render() {
    const { fetched, status, queryString, posts, offset, count } = this.props

    return (
      <Fragment>
        <div className="post-list">
          {!fetched && <Loading />}
          {fetched && (count === 0 ?
            <Empty status={status} /> :
            [
              <InfiniteScroll
                key={0}
                loadMore={() => this.props.fetchPosts({ status, queryString })}
                hasMore={offset < count}
                threshold={100}
                initialLoad={true}
                useWindow={true}
                loader={<Loading key={0} />}
              >
                {posts.map(p => <PostItem {...p} postLocation={p.location} onPreview={this.onShowPreview} key={p.post_id} />)}
              </InfiniteScroll>,
              offset >= count && <div className="no-more-post" key={1}>No more articles</div>
            ])
          }
        </div>
      </Fragment>
    )
  }
}

export default connect(
  ({ content: { w } }, { status }) => ({ ...w[status] }),
  { fetchCount, fetchPosts, fetchPost },
)(PostList)

