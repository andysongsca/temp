import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Tag, Modal, Button, Menu, Dropdown, message } from 'antd'
import cx from 'classnames'
import dateFormat from 'dateformat'

import api from 'utils/api'
import { handleCopy } from 'utils/utilities'
import withAuth from 'hocs/withAuth'
import { notification } from 'components/Notification'
import { resetPosts } from 'redux/content'
import { MEDIA_TYPE_NEWSLETTER, POST_STATUS } from 'constant/content'
import OpButton from './OpButton'
import Stats from './StatsItem'
import logEvent from 'utils/logEvent'
import Tooltip from 'components/utils/Tooltip'
import { ReactComponent as TooltipNew } from 'asset/svg/tooltip-new.svg'
import { ReactComponent as IconInfoRed } from 'asset/svg/icon-info.svg'
import { ReactComponent as IconInfoYellow } from 'asset/svg/icon-info-yellow.svg'
import './Post.scss'
import ContentAnalyticsModal from '@/components/Analytics/ContentAnalyticsModal'

/*
 * post status map operator button bit mask
 * 1 - publish
 * 2 - edit
 * 4 - delete
 */

const OP_MASK = {
  PUBLISH: 1,
  EDIT: 2,
  DELETE: 4,
  SHARE: 8,
  COMMENTS: 16,
  ANALYTICS: 32,
}

const shareList = [
  { name: 'fb', title: 'Share to Facebook' },
  { name: 'twt', title: 'Share to Twitter' },
  // { name: 'lnk', title: 'Share to LinkedIn' },
  // { name: 'msg', title: 'Share to Messenger' },
  // { name: 'wsp', title: 'Share to WhatsApp' },
  { name: 'cp', title: 'Copy and share the link' },
]

class PostItem extends React.Component {
  state = {
    delete_comfirm_visible: false,
    delete_comfirm_loading: false,
    cover_image_src: this.props.ctype === 'og' ? this.props.og.img : this.props.covers ? this.props.covers[0] : null,
    showAnalytics: false,
  }

  imageReloadInterval = 3000;
  imageRetryTimes = 5;

  handleEdit = () => {
    const props = this.props
    if (props.post_type === 'rss') {
      notification.error('This article was created from a RSS feed, you can not edit this article.')
    } else {
      let path
      if (props.ctype === 'og') {
        path = '/home/share/'
      } else if (props.origin_video_url) {
        path = '/home/vpost/'
      } else {
        path = '/home/post/'
      }
      props.history.push(path + props.post_id.toString())
    }
  }

  handlePublish = () => {
    api.patch(`/post/${this.props.post_id}/publish`)
      .then(({ data }) => {
        if (data.code === 0) {
          this.props.history.push('post')
          this.props.resetPosts()
        } else {
          notification.error(data.message)
        }
      })
  }

  get isApproved() {
    const { audit_status } = this.props
    return audit_status === 1 || audit_status === 2
  }

  getNBUrl = (doc_id) => {
    return 'https://www.newsbreak.com/n/' + doc_id + '?s=influencer'
  }

  getStatusTag(doc_id) {
    const { status, audit_status, audit_policy_violation, ts, self } = this.props
    const source = self && self.creator_info && self.creator_info.source
    const isSourceOpen = source === "open registration"
    const has_policy_violation = audit_policy_violation && (ts > 1632782173 || (isSourceOpen && ts > 1629705582))
    const is_strike = self && self.violations && self.violations.doc_ids && self.violations.doc_ids.includes(doc_id)
    const show_policy_violation = has_policy_violation && is_strike
    let op = OP_MASK.EDIT + OP_MASK.DELETE
    let tag = null
    switch (status) {
      case POST_STATUS.DRAFT:
        tag = <Tag className="orange-tag">Draft</Tag>
        break
      case POST_STATUS.RELEASING:
        op = 0
        tag = <Tag className="blue-tag">Processing</Tag>
        break
      case POST_STATUS.DELETED:
        op = 0
        tag = <Tag className="gray-tag">Deleted</Tag>
        break
      case POST_STATUS.FAILED:
        tag = <Tag className="red-tag">Failed</Tag>
        break
      case POST_STATUS.SCHEDULED:
        tag = <Tag className="orange-tag">Scheduled</Tag>
        break
      default:
        if (audit_status === 0) {
          tag = <Tag className="orange-tag">Under Review</Tag>
        } else if (audit_status === 3) {
          tag = <Tag className="red-tag">Changes Needed {show_policy_violation && "/ Policy Violation"}</Tag>
        } else if (status === POST_STATUS.POSTED) {
          op += OP_MASK.SHARE + OP_MASK.COMMENTS + OP_MASK.ANALYTICS
          tag = <Tag className="green-tag">Published</Tag>
        } else if (status === POST_STATUS.POSTED_DRAFT) {
          op += OP_MASK.SHARE + OP_MASK.COMMENTS + OP_MASK.ANALYTICS
          tag = [
            <Tag className="green-tag" key="post">Published</Tag>,
            <Tag className="gray-tag" key="changes">Unpublished Changes</Tag>
          ]
        }
        break
    }
    return { tag, op }
  }

  handleShare = ({ item, key }) => {
    // if (!this.isApproved) {
    //   notification.error('You can share this article after it is approved')
    //   return
    // }
    let { doc_id, self: { media_id } } = this.props
    // doc_id = '0WxcOyIS' // testing
    const url = `https://newsbreakapp.onelink.me/2115408369?pid=mp_${media_id}&msource=mp_${media_id}&docid=${doc_id}&af_dp=newsbreak%3A%2F%2Fopendoc%3Fdocid%3D${doc_id}&af_web_dp=https%3A%2F%2Fwww.newsbreak.com%2Faf-landing%3Fdocid%3D${doc_id}`

    const encodedUrl = encodeURIComponent(url)
    let surl = null
    switch (key) {
      case 'fb':
        surl = 'http://www.facebook.com/sharer/sharer.php?u=' + encodedUrl
        logEvent('article-refer-facebook-button-click', { page: 'post' })
        break
      case 'twt':
        surl = 'http://twitter.com/intent/tweet?url=' + encodedUrl
        logEvent('article-refer-twitter-button-click', { page: 'post' })
        break
      case 'lnk':
        break
      case 'msg':
        break
      case 'wsp':
        break
      case 'cp':
        handleCopy(url)
        logEvent('article-refer-copy-button-click', { page: 'post' })
        message.info('Link copied. Use Ctrl + V to paste it to your destination.')
        return
      default:
        return
    }

    if (surl) {
      window.open(surl, '_blank')
    }
  }

  handlePrepush = () => {
    // call dryrun. upon success, show a prompt to user with number of tokens to be pushed
    if (this.props.push) {
      notification.error('This article has been pushed. Received ' + this.props.push.num_push_received + '. Page View: ' + this.props.push.push_pageview)
    } else {
      api.post(`/post/prepush/${this.props.doc_id}`)
        .then(({ data }) => {
          if (data.code === 0) {
            let token_count = 0
            if (data.data && data.data.numOfPushedUsers) {
              token_count = data.data.numOfPushedUsers
            }
            if (token_count === 1) {
              this.setState({
                push_comfirm_visible: true,
                pre_push_msg: 'You are pushing this article to ' + token_count + ' follower. Are you sure?'
              })
            } else if (token_count > 1) {
              this.setState({
                push_comfirm_visible: true,
                pre_push_msg: 'You are pushing this article to ' + token_count + ' followers. Are you sure?'
              })
            } else {
              notification.success('You do not have any followers yet.')
            }
          } else {
            notification.error(data.message)
          }
        })
    }
  }

  handlePushAction = () => {
    this.setState({ push_comfirm_loading: true })
    api.post(`/post/push/${this.props.doc_id}`)
      .then(({ data }) => {
        this.setState({
          push_comfirm_loading: false,
          push_comfirm_visible: false,
        })
        if (data.code !== 0) {
          notification.error(data.message)
        } else {
          const body = data.data
          if (body.pushId < 10) {
            notification.error(body.message)
          } else {
            notification.success(body.message)
          }
        }
      })
  }

  handleDelete = () => {
    this.setState({ delete_comfirm_loading: true })
    api.delete(`/post/${this.props.post_id}`)
      .then(({ data }) => {
        this.setState({
          delete_comfirm_loading: false,
          delete_comfirm_visible: false,
        })
        if (data.code === 0) {
          this.props.resetPosts()
        } else {
          notification.error(data.message)
        }
      })
  }

  handleImageLoadingError = e => {
    if (--this.imageRetryTimes >= 0) {
      const original_url = e.target.src;
      setTimeout(() => {
        this.setState({
          cover_image_src: original_url,
          cover_image_text: ''
        })
      }, this.imageReloadInterval);
    }
    this.setState({
      cover_image_src: require('asset/img/default-cover.png'),
      cover_image_text: 'Processing',
    })
  }

  handleManageComments = () => {
    const props = this.props
    // replace % in url to prevent url decode error
    props.history.push(`/home/comments/${props.doc_id}/${encodeURIComponent(props.title.replace(/%/g,'~~pct~~'))}`)
  }

  shareMenu = (
    <Menu onClick={this.handleShare}>
      {shareList.map(({ name, title }) =>
        <Menu.Item key={name}>
          <div><img src={require(`asset/img/item-share-${name}.png`)} alt={name} /><span>{title}</span></div>
        </Menu.Item>)}
    </Menu>
  )

  openAnalytics = () => {
    logEvent('content_analytics_modal_open', { docId: this.props.doc_id, page: 'manage-content' })
    this.setState({ showAnalytics: true })
  }

  closeAnalytics = () => {
    logEvent('content_analytics_modal_close', { docId: this.props.doc_id, page: 'manage-content' })
    this.setState({ showAnalytics: false })
  }

  render() {
    const { post_id, title, doc_id, postLocation, status, ts,
      self, impression, page_view, share, ctype, og, onPreview, origin_video_url,
      score, audit_status, new_comment_count, total_comment_count, viewType, click_bait_v2, is_local, editorial_standards, dropReason, detailed_reason} = this.props
    const { delete_comfirm_loading, delete_comfirm_visible,
      push_comfirm_loading, push_comfirm_visible, pre_push_msg, cover_image_src, cover_image_text, showAnalytics } = this.state
    const showDropReason =  editorial_standards && audit_status === 1
    // don't show clickbait to videos
    const shouldShowClickbait = self.is_creator && !is_local && (click_bait_v2 && click_bait_v2 > 0.6) && !origin_video_url && status !== POST_STATUS.POSTING && audit_status !== 3
    const shouldShowEditorFeedback = !(dropReason || editorial_standards) && detailed_reason && (audit_status === 1)
    const editorFeedbackText = 'Congratulations, your content is live and currently being distributed to our audience! Our editors have left a few suggestions to help improve your content. You can click the "edit" icon to learn more and resubmit.'
    const displayClickBaitReason = 'Your post is live, however, your title is not optimized for NewsBreak distribution. To learn more, please review our headline best practices. (https://support.newsbreak.com/knowledge/headline-best-practices). You can click the "edit" icon to make title changes and resubmit.'
    const dropReasonText = "Almost there! Your content doesn't follow all of our Editorial Standards & Guidelines. No need to panic, but in order to properly distribute it, please click the \"edit\" icon for more information. After that, we recommend reviewing our guidelines, making appropriate edits, and resubmitting."

    const { tag, op } = this.getStatusTag(doc_id)
    let is_video = origin_video_url ? true : false
    let subtitle = null
    let header = <h3>{og ? og.text_message : title}</h3>
    let showCV = !is_video && audit_status === 1
    if (ctype !== 'og' && doc_id && this.isApproved) {
      header = (<a target="_blank" title="Click to view article in NewsBreak"
        href={this.getNBUrl(doc_id)} rel="noopener noreferrer">{header}</a>)
    } else {
      header = (<Button
        title="Click to preview article"
        className="title"
        type="link"
        onClick={() => onPreview(post_id)}
      >{header}</Button>)
    }

    if (ctype === 'og') {
      subtitle = (<a className="subtitle" target="_blank"
        rel="noopener noreferrer" title={og.url} href={og.url}>{og.title}</a>)
    }

    let total_comment_show = total_comment_count > 9999 ? (total_comment_count / 1000).toFixed(0) + "K+" : total_comment_count;
    if (!total_comment_count || total_comment_count === 0) {
      total_comment_show = "Comments"
    }

    const show_cv_score = self && self.policy && self.policy.latest_payment_v === 2

    return (
      <div className={cx('post-item', og && 'og')}>
        {delete_comfirm_visible && <Modal
          visible={true}
          closable={false}
          centered
          footer={null}
          wrapClassName="post-delete-comfirm"
          width={560}
          bodyStyle={{
            height: 200,
          }}
        >
          <h3>Deleted articles are gone forever. Are you sure?</h3>
          <div className="comfirm-btns">
            <Button key="delete" type="round" className="delete-btn" onClick={
              this.handleDelete
            } loading={delete_comfirm_loading}>Delete</Button>
            <Button key="cancel" type="round" className="cancel-btn"
              onClick={() => this.setState({ delete_comfirm_visible: false })}>Cancel</Button>
          </div>

        </Modal>}

        {push_comfirm_visible && <Modal
          visible={true}
          closable={false}
          centered
          footer={null}
          wrapClassName="post-delete-comfirm"
          width={560}
          bodyStyle={{
            height: 200,
          }}
        >
          <h3>{pre_push_msg}</h3>
          <div className="comfirm-btns">
            <Button
              key="push"
              type="round"
              className="push-btn"
              onClick={this.handlePushAction}
              loading={push_comfirm_loading}
            >
              Push
            </Button>
            <Button
              key="cancel"
              type="round"
              className="cancel-btn"
              onClick={() => this.setState({ push_comfirm_visible: false })}
            >
              Cancel
            </Button>
          </div>
        </Modal>}

        {showAnalytics && <ContentAnalyticsModal
          docInfo={this.props}
          visible={true}
          onClose={this.closeAnalytics}
        />}
        <div className="cover">
          <img alt="cover" className="cover-image" src={cover_image_src || require('asset/img/default-cover.png')} onError={this.handleImageLoadingError} />
          <div className="center-text">{cover_image_text}</div>
          {postLocation && (
            <div className="location">
              <img alt="" src={require('asset/img/location.png')} />
              <span>{postLocation}</span>
            </div>
          )}
          {origin_video_url && (
            <div className="video-overlay" onClick={() => onPreview(post_id)}>
              <img
                alt="publish a video"
                src={require('asset/svg/ic-play.svg')}
              />
            </div>
          )}

        </div>
        <div className="post-item-content">
          <div className="post-item-date">
            {
              (OP_MASK.EDIT & op) !== 0
                ? (
                  <Tooltip title={'For more information on why your content might not have been approved, please click the "edit" icon.'} placement="bottom">
                    {tag}
                  </Tooltip>
                )
                : tag
            }
            <span>{dateFormat(new Date(ts * 1000), 'm/d/yyyy ddd HH:MM')}</span>
            {showDropReason && <div className="post-item-icon">
              <Tooltip title={dropReasonText} placement="bottom">
                <IconInfoRed className="post-item-icon-info"/>
                 <div>Needs attention</div>
              </Tooltip>
            </div>}
            {shouldShowEditorFeedback && <div className="post-item-icon">
              <Tooltip title={editorFeedbackText} placement="bottom" html="true">
                <IconInfoYellow className="post-item-icon-info"/>
                <div style={{color: '#FF9900'}}>Editor feedback</div>
              </Tooltip>
            </div>}
            {shouldShowClickbait === true && <div className="post-item-icon">
              <Tooltip title={displayClickBaitReason} placement="bottom">
                <IconInfoRed className="post-item-icon-info"/>
                <div>Title change recommended</div>
              </Tooltip>
            </div>}
          </div>
          {header}{subtitle}
          <div className="op-btn-list">
            {(OP_MASK.PUBLISH & op) !== 0 &&
              <OpButton src={require('asset/img/op/publish@2x.png')} text="Publish" onClick={this.handlePublish} />
            }
            {(OP_MASK.EDIT & op) !== 0 &&
              <OpButton src={require('asset/svg/edit.svg')} text="Edit" onClick={this.handleEdit} />
            }
            {(OP_MASK.DELETE & op) !== 0 &&
              <OpButton src={require('asset/svg/delete.svg')} text="Delete" onClick={() => this.setState({ delete_comfirm_visible: true })} />
            }
            {(OP_MASK.SHARE & op) !== 0 && self && self.mediaType === 4 &&
              <OpButton src={require('asset/svg/notification.svg')} text="Push to followers" onClick={this.handlePushAction} />
            }
            {(OP_MASK.SHARE & op) !== 0 &&
              <Dropdown overlay={this.shareMenu} overlayClassName="share-menu" trigger={['click']} arrow>
                <OpButton src={require('asset/svg/share.svg')} text="Share" className="share-btn" />
              </Dropdown>
            }
            {(OP_MASK.COMMENTS & op) !== 0 && self && self.enable_comments &&
              <OpButton src={require('asset/svg/comments.svg')} text={total_comment_show} onClick={this.handleManageComments} />
            }
            {(OP_MASK.COMMENTS & op) !== 0 && self && self.enable_comments && new_comment_count > 0 &&
              <Tooltip className="new-tooltip" placement="top-right" >
                <TooltipNew />
              </Tooltip>
            }
            {(OP_MASK.ANALYTICS & op) !== 0 && self && self.mediaType === 3 &&
              <OpButton src={require('asset/svg/analytics.svg')} text="Analytics" onClick={this.openAnalytics} />
            }
          </div>
        </div> {(status === POST_STATUS.POSTED || status === POST_STATUS.POSTED_DRAFT) &&
          self && self.mediaType !== 3 && self.mediaType !== MEDIA_TYPE_NEWSLETTER &&
          <div className="post-item-stats">
            <Stats num={impression || 0} text="Impressions" />
            <Stats num={page_view || 0} text="Page Views" />
            <Stats num={share || 0} text="Shares" />
          </div>
        }
        {(status === POST_STATUS.POSTED || status === POST_STATUS.POSTED_DRAFT) &&
          self && self.mediaType === MEDIA_TYPE_NEWSLETTER &&
          <div className="post-item-stats">
            <Stats num={impression || 0} text="Sent" />
            <Stats num={page_view || 0} text="Opened" />
            <Stats num={share || 0} text="Shares" />
          </div>
        }
        {(status === POST_STATUS.POSTED || status === POST_STATUS.POSTED_DRAFT) &&
          self && self.mediaType === 3 &&
          <div className="post-item-stats">
            <Stats num={impression || 0} text="Impressions" />
            <Stats num={page_view || 0} text={is_video ? "Views" : "Page Views"} />
          {!show_cv_score && <Stats num={share || 0} text="Share" />}
          {show_cv_score && viewType !== "ugc" && <Stats num={(showCV && score) || "N/A"} text="CV Score" toolTipText="The Content Value (CV) Score measures how local, scarce, and high-quality an article is. " is_video={is_video} />}
          </div>
        }
      </div>
    )
  }
}

export default compose(
  withAuth,
  connect(
    null,
    { resetPosts },
  )
)(withRouter(PostItem))
