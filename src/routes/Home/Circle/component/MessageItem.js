import React, { useState } from 'react'
import { compose } from 'redux'
import { connect, useDispatch } from 'react-redux'
import { withRouter } from 'react-router'
import { Dropdown, Button, Menu, Modal, Tag, message as MessageApi } from 'antd'
import OpButton from '../../Content/component/OpButton'

import api from 'utils/api'
import { handleCopy } from 'utils/utilities'
import withAuth from 'hocs/withAuth'
import { notification } from 'components/Notification'
import { getMessagesCount } from 'redux/circle'
import { ReactComponent as IconShare } from 'asset/svg/share.svg'
import { ReactComponent as IconLike } from 'asset/svg/liked-red.svg'
import { formatStats } from 'utils/utilities'
import logEvent from 'utils/logEvent'

import './MessageItem.scss'

const videoCtype = 'native_video'
const shareList = [
  { name: 'fb', title: 'Share to Facebook' },
  { name: 'twt', title: 'Share to Twitter' },
  { name: 'cp', title: 'Copy and share the link' },
]

const defaultDeleteConfirm = {
  deleteComfirmVisible: false,
  deleteComfirmLoading: false,
}

const MessageItem = (props) => {
  const dispatch = useDispatch();
  const { message, message_id, type, message_image_urls, message_images, date, like, share, title, image, media_id, scope, ctype } = props
  const messageImageUrl = type === "image" ? (message_image_urls ? message_image_urls[0] : message_images[0].url) : null
  const defaultMessage = "Your article was sent without a Circle notification."
  const defaultVideoMessage = "Your video was sent without a Circle notification."
  const [deleteComfirm, setDeleteComfirm] = useState(defaultDeleteConfirm)
  const imageSourceUrl = image !== undefined ? 
    (ctype === videoCtype ? image : "https://img.particlenews.com/img/id/" + image) + "?type=webp_512x512" 
    : require('asset/img/insight-no-image.png')
  const [imageUrl, setImageUrl] = useState(imageSourceUrl)

  const handleDelete = () => {
    setDeleteComfirm({ ...deleteComfirm, deleteComfirmLoading: true })
    logEvent('message-delete-button-click', { page: 'manage-circle' })
    api.delete(`/post/message/${message_id}`)
      .then(({ data }) => {
        setDeleteComfirm({ deleteComfirmVisible: false, deleteComfirmLoading: false })
        if (data.code === 0) {
          dispatch(getMessagesCount())
        } else {
          notification.error(data.message)
        }
      })
  }

  const handleImageLoadingError = () => {
    setImageUrl(require('asset/img/insight-no-image.png'))
  }

  const handleShare = ({ item, key }) => {
    const url = `https://www.newsbreak.com/circles/${media_id}/${message_id}?lang=en_US`
    const encodedUrl = encodeURIComponent(url)
    let surl = null
    switch (key) {
      case 'fb':
        surl = 'http://www.facebook.com/sharer/sharer.php?u=' + encodedUrl
        logEvent('message-share-facebook-button-click', { page: 'manage-circle' })
        break
      case 'twt':
        surl = 'http://twitter.com/intent/tweet?url=' + encodedUrl
        logEvent('message-share-twitter-button-click', { page: 'manage-circle' })
        break
      case 'cp':
        handleCopy(url)
        logEvent('message-share-copy-button-click', { page: 'manage-circle' })
        MessageApi.info('Link copied. Use Ctrl + V to paste it to your destination.')
        return
      default:
        return
    }

    if (surl) {
      window.open(surl, '_blank')
    }
  }

  const ShareMenu = (
    <Menu onClick={handleShare}>
      {shareList.map(({ name, title }) =>
        <Menu.Item key={name}>
          <div><img src={require(`asset/img/item-share-${name}.png`)} alt={name} /><span>{title}</span></div>
        </Menu.Item>)}
    </Menu>
  )

  const Item = ({ icon, text, num }) => {
    let numStr
    if (num === '-') {
      numStr = { original: '', short: '-' }
    } else {
      numStr = formatStats(num)
    }

    return (
      <div className="message-item-icon-detail">
        {icon}
        <span className="message-detail-num" title={numStr.original}>{numStr.short} {text}</span>
      </div>
    )
  }

  const { deleteComfirmVisible, deleteComfirmLoading } = deleteComfirm

  return (
    <div className="message-item">
      <Modal
        visible={deleteComfirmVisible}
        closable={false}
        centered
        footer={null}
        wrapClassName="post-delete-comfirm"
        width={560}
        bodyStyle={{
          height: 200,
        }}
      >
        <h3>Deleted messages are gone forever. Are you sure?</h3>
        <div className="comfirm-btns">
          <Button key="delete" type="round" className="delete-btn"
            onClick={handleDelete} loading={deleteComfirmLoading}>Delete</Button>
          <Button key="cancel" type="round" className="cancel-btn"
            onClick={() => setDeleteComfirm({ ...deleteComfirm, deleteComfirmVisible: false })}>Cancel</Button>
        </div>
      </Modal>

      <div className="message-item-content">
        <div className="message-item-date">
          <span>{date.substring(0, date.length - 3)}</span>
        </div>
        <div className="message-item-title">
          {type === "image" && <div className="message-item-image">
            <img src={messageImageUrl} alt="" />
          </div>}

          {type === "article" ?
            <>
              <div className="message-item-text-small">
                {message ?
                  <span>{message}</span>
                  :
                  <span className="message-item-default-message">{ctype === videoCtype ? defaultVideoMessage : defaultMessage}</span>
                }
              </div>
              <div className="message-item-article">
                <div className="message-item-image">
                  <img src={imageUrl} alt="" onError={handleImageLoadingError} />
                  <div className="message-item-tag">{ctype === videoCtype ? 'Video' : 'Article'}</div>
                </div>
                <div className="message-item-topic">
                  {scope === 0 && <Tag className="message-item-tag">Published</Tag>}
                  <h3 className="message-item-head">
                    <div className={scope === 0 ? "message-head-with-tag" : "meesage-head-without-tag"}>{title}</div>
                  </h3>
                </div>
              </div>
            </>
            :
            <div className="message-item-text">
              <span>{message}</span>
            </div>}

        </div>
        <div className="message-item-icon">
          <div className="message-item-icon-left">
            <OpButton src={require('asset/svg/delete.svg')} text="Delete"
              onClick={() => setDeleteComfirm({ ...deleteComfirm, deleteComfirmVisible: true })} />
            <Dropdown overlay={ShareMenu} overlayClassName="share-menu" trigger={['click']} arrow>
              <OpButton src={require('asset/svg/share.svg')} text="Share" className="share-btn" />
            </Dropdown>
          </div>
          <div className="message-item-icon-right">
            <Item icon={<IconLike className="message-detail-icon" />} text="likes" num={like} />
            <div className="message-detail-sep" />
            <Item icon={<IconShare className="message-detail-icon" />} text="shares" num={share} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    null,
    { getMessagesCount },
  )
)(withRouter(MessageItem))
