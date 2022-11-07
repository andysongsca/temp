/* eslint-disable no-template-curly-in-string */
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { withRouter } from 'react-router'
import cx from 'classnames'
import { fetchMediaInfo } from 'redux/setting'
import ImageUploader from '@/components/ImageUploader'
import { Skeleton } from 'antd'

import api from 'utils/api'
import logEvent from 'utils/logEvent'
import { Form, Input, Button } from 'antd'
import { notification } from 'components/Notification'

import './SettingNewsletter.scss'

const SettingNewsletter = (props) => {
  const dispatch = useDispatch()
  const { media } = props
  const [newsletterCover, setNewsletterCover] = useState('')

  useEffect(() => {
    logEvent('page_visit_start', { page: 'setting-newsletter' })
    if (!media) {
      return;
    }
    if (Object.keys(media).length === 0) {
      dispatch(fetchMediaInfo())
    }
    return () => {
      logEvent('page_visit_end', { page: 'setting-newsletter' })
    }
  }, [])

  const handleUploadCover = file => {
    api.post('/storage/upload-cover',
        { file },
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      .then(
        ({ data }) => {
          if (data.code === 0) {
            setNewsletterCover(data.data)
          } else {
            notification.error('Upload image failed')
          }
        },
        reason => {
          console.error('upload file failed!')
          notification.error('Upload image failed: ' + reason)
        }
      )
  }

  const handleSubmit = values => {
    const {
      newsletter_publication_name,
      newsletter_email_sender_name,
      newsletter_copyright_owner,
      newsletter_description,
      newsletter_cover
    } = values

    api.put('/setting/media', {
      newsletter_publication_name,
      newsletter_email_sender_name,
      newsletter_copyright_owner,
      newsletter_description,
      newsletter_cover: newsletterCover ? newsletterCover : newsletter_cover
    })
    .then(({ data }) => {
      if (data.code === 0) {
        dispatch(fetchMediaInfo())
        notification.success("newsletter setting saved successfully")
      } else {
        notification.error(data.message)
      }
    })
  }

  const { newsletter_cover, newsletter_publication_name, newsletter_email_sender_name, newsletter_copyright_owner, newsletter_description } = media

  return (
    <div className="newsletter-setting-edit">
      <Skeleton loading={!media || Object.keys(media).length === 0} paragraph={{ rows: 8 }}>
        <ImageUploader
          onUpload={handleUploadCover}
          image={newsletter_cover}
          sizeLimit={20000000}
          previewType="circle"
          aspectRatio={1}
          outputWidth={400}
          outputHeight={400}
        >
          <div>Tap to upload an image</div>
          <span>Picture size should not exceed 20MB</span>
        </ImageUploader>
        <Form
          className="form-setting-edit"
          layout={"vertical"}
          colon={false}
          onFinish={handleSubmit}
        >
          <Form.Item
            className="form-item"
            label="Publication name"
            name="newsletter_publication_name"
            initialValue={newsletter_publication_name}
            rules={[{ required: true }]}
          >
            <Input className="input" />
          </Form.Item>
          <Form.Item
            className="form-item"
            label="Email sender name"
            name="newsletter_email_sender_name"
            initialValue={newsletter_email_sender_name}
            rules={[{ required: true }]}
          >
            <Input className="input" />
          </Form.Item>
          <Form.Item
            className="form-item"
            label="Copyright owner"
            name="newsletter_copyright_owner"
            initialValue={newsletter_copyright_owner}
            rules={[{ required: true }]}
          >
            <Input className="input" />
          </Form.Item>
          <Form.Item
            className="form-item desc"
            label="Description"
            name="newsletter_description"
            initialValue={newsletter_description}
            rules={[{ required: true }]}
          >
            <Input.TextArea
              className="textarea"
              placeholder="Tell your followers about your newsletter"
            />
          </Form.Item>
          <div className="submit-button">
            <Button
              className={cx('Button')}
              type="primary"
              htmlType="submit"
            >
              Save
            </Button>
          </div>
        </Form>
      </Skeleton>
    </div>
  )
}

export default withRouter(
  connect(({ setting, login }) => ({ ...setting, ...login }), {
    fetchMediaInfo
  })(SettingNewsletter)
)