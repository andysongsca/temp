import React, { useState } from 'react'
import { compose } from 'redux'
import { connect, useDispatch } from 'react-redux'
import { withRouter } from 'react-router'
import { Button, Modal, Tag } from 'antd'
import dateFormat from 'dateformat'

import api from 'utils/api'
import { formatStats } from 'utils/utilities'
import logEvent from 'utils/logEvent'
import withAuth from 'hocs/withAuth'
import { notification } from 'components/Notification'
import { getNewsletterCount, unscheduleNewsletter } from 'redux/newsletter'
import OpButton from '../../Content/component/OpButton'

import './NewsletterItem.scss'

const defaultDeleteConfirm = {
  deleteComfirmVisible: false,
  deleteComfirmLoading: false,
}

const newsletterStatusMap = {
  0: 'draft',
  1: 'published',
  2: 'deleted',
}

const StatsItem = ({ text, num }) => {
  const numStr = typeof num === 'string' ? num : formatStats(num)

  return <>
    <div className="stats-item">
      <div className="score-area">
        {typeof num === 'string' ? <h1 className="score" title={numStr}>{numStr}</h1>
          : <h1 className="score" title={numStr.original}>{numStr.short}</h1>}
      </div>
      <div className="title-area">
        <span>{text}</span>
      </div>
    </div>
  </>
}

const NewsletterItem = (props) => {
  const dispatch = useDispatch()
  const { id, title, imageUrls, newsletterState, newsletterEmailState, updateTime, stats, onPreview } = props
  const [deleteComfirm, setDeleteComfirm] = useState(defaultDeleteConfirm)
  const imageSourceUrl = imageUrls.length > 0 ? imageUrls[0] + "?type=webp_512x512"
    : require('asset/img/default-cover.png')
  const [imageUrl, setImageUrl] = useState(imageSourceUrl)
  const itemStatus = newsletterStatusMap[newsletterState]

  const getStatusTag = () => {
    let tag = null
    switch (newsletterState) {
      case 0:
        tag = <Tag className="orange-tag">Draft</Tag>
        break
      case 1:
        if (newsletterEmailState === 1)
          tag = <Tag className="orange-tag">Scheduled</Tag>
        else if (newsletterEmailState === 2)
          tag = <Tag className="orange-tag">Sending</Tag>
        else if (newsletterEmailState === 3)
          tag = <Tag className="green-tag">Sent</Tag>
        else
          tag = <Tag className="blue-tag">Not Applied</Tag>
        break
      case 2:
        tag = <Tag className="gray-tag">Deleted</Tag>
        break
      default:
        break
    }
    return tag;
  }

  const handleDelete = () => {
    setDeleteComfirm({ ...deleteComfirm, deleteComfirmLoading: true })
    logEvent('newsletter-delete-button-click', { page: 'manage-newsletter' })
    api.delete(`/newsletter/${id}`)
      .then(({ data }) => {
        setDeleteComfirm({ deleteComfirmVisible: false, deleteComfirmLoading: false })
        if (data.code === 0) {
          dispatch(getNewsletterCount(itemStatus))
        } else {
          notification.error(data.message)
        }
      })
  }

  const handleEdit = () => {
    if (newsletterState === 1 && newsletterEmailState === 1) {
      dispatch(unscheduleNewsletter(id))
    }
    const path = '/home/newsletter/create/'
    props.history.push(path + id.toString())
  }

  const handleImageLoadingError = () => {
    setImageUrl(require('asset/img/default-cover.png'))
  }

  const { deleteComfirmVisible, deleteComfirmLoading } = deleteComfirm
  const impressions = (stats && (stats.openFromEmailCount + stats.openFromWebCount)) || 0
  const openRate = impressions > 0 ? (Math.round(impressions * 100 / stats.sentCount) + '%') : '0%'

  return (
    <div className="newsletter-item">
      <Modal
        visible={deleteComfirmVisible}
        closable={false}
        centered
        footer={null}
        wrapClassName="newsletter-delete-comfirm"
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

      <div className="cover">
        <img alt="cover" className="cover-image" src={imageUrl || require('asset/img/default-cover.png')} onError={handleImageLoadingError} />
      </div>

      <div className="newsletter-item-content">
        <div className="newsletter-item-date">
          {getStatusTag()}
          <span>{dateFormat(new Date(updateTime * 1000), 'm/d/yyyy ddd HH:MM')}</span>
        </div>
        <Button title="Click to preview article" className="title" type="link" onClick={() => onPreview(id)}>
          <h3>{title}</h3>
        </Button>
        <div className="op-btn-list">
          {(newsletterState === 0 || (newsletterState === 1 && (newsletterEmailState === 0 || newsletterEmailState === 1))) &&
            <OpButton src={require('asset/svg/edit.svg')} text="Edit"
              onClick={handleEdit} />}
          {newsletterState !== 2 && <OpButton src={require('asset/svg/delete.svg')} text="Delete"
            onClick={() => setDeleteComfirm({ ...deleteComfirm, deleteComfirmVisible: true })} />}
          {newsletterState === 0 && <OpButton src={require('asset/svg/edit.svg')} text="Schedule"
            onClick={handleEdit} />}
          {(newsletterState === 1 && (newsletterEmailState === 0 || newsletterEmailState === 1)) &&
            <OpButton src={require('asset/svg/edit.svg')} text="Rechedule"
              onClick={handleEdit} />}
        </div>
      </div>

      {newsletterState === 1 && newsletterEmailState === 3 &&
        <div className="newsletter-item-stats">
          <StatsItem num={impressions} text="Impressions" />
          <StatsItem num={openRate} text="Open Rate" />
          <StatsItem num={(stats && stats.newSubscriberCount) || 0} text="New Subscribers" />
        </div>
      }
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    null,
    {
      getNewsletterCount,
      unscheduleNewsletter,
    },
  )
)(withRouter(NewsletterItem))
