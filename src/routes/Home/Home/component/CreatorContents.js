import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Button } from 'antd'
import { fetchCount, fetchPosts } from 'redux/content'
import { Link } from 'react-router-dom'
import { ReactComponent as IconEdit } from 'asset/svg/edit.svg'
import { ReactComponent as IconUpload } from 'asset/svg/upload-small.svg'
import { Loading } from 'components/utils'
import Stats from '../../Content/component/StatsItem'

const status = 'post'

const CreatorContents = (props) => {
  const { enableVideo, fetched, count, posts, fetchCount, fetchPosts } = props
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (fetched === undefined) {
      fetchCount({status})
    } else if (fetched && count > 0 && posts.length === 0) {
      fetchPosts({ status, size: 3 })
    } else if (count === 0 || posts.length > 0) {
      setLoading(false)
    }
  }, [fetched, count, posts])

  if (loading) {
    return <Loading />
  }

  const hasContent = fetched && posts.length > 0

  return <div className={`section ${hasContent ? 'creator-content' : 'creator-no-content'}`}>
    {hasContent && <>
      <div className="section-header">
        <div className="section-title-lg">Latest content</div>
        <Link to="/home/content/post"><Button className="Button Button-Light">See all content</Button></Link>
      </div>
      {posts.slice(0, 3).map((p, i) => (
        <div className="post-item" key={i}>
          <div className="post-title">{p.title}</div>
          <div className="post-item-stats">
            <Stats num={p.impression || 0} text="Impressions" />
            <Stats num={p.page_view || 0} text="Page Views" />
            <Stats num={p.share || 0} text="Share" />
            {/* <Stats
              num={p.share || 0}
              text="CV Score"
              toolTipText="The Content Value (CV) Score measures how local, scarce, and high-quality an article is."
              is_video={!!p.origin_video_url}
            /> */}
          </div>
        </div>
      ))}
    </>}
    {!hasContent && <>
      <div className="section-title-lg">Publish your first post</div>
      <div className="new-post-links">
        <Link to="/home/post"><Button className="Button">
          <IconEdit /><div>Write an article</div>
        </Button></Link>
        {enableVideo && <Link to="/home/vpost"><Button className="Button">
          <IconUpload /><div>Upload a video</div>
        </Button></Link>}
      </div>
    </>}
  </div>
}

export default connect(
  ({ content: { w } }) => ({ ...w[status] }),
  { fetchCount, fetchPosts },
)(CreatorContents)
