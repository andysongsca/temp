/* eslint-disable no-template-curly-in-string */
import React from 'react'
import cx from 'classnames'
import { compose } from 'redux'
import { connect } from 'react-redux'
import BodyClassName from 'react-body-classname'
import ImageUploader from '@/components/ImageUploader'

import withAuth from 'hocs/withAuth'
import { Form, Input, Button } from 'antd'
import { notification } from 'components/Notification'
import Nav from 'components/Nav'
import api from 'utils/api'
import { createMediaAccount } from 'redux/login'
import { PublisherTos } from 'components/Policy'
import './CreatePublisher.scss'
import LocationSelector from 'components/Location/Selector'

class CreatePublisher extends React.Component {
  state = {
    coverUrl: null,
    agreePolicy: false,
    location: null,
  }

  validateMessages = {
    required: '${label} is required',
    types: {
      email: '${label} is not valid email',
      url: '${name} is not a valid URL',
    },
  };

  handleUploadCover = file => {


    api.post(
      '/storage/upload-cover',
      { file },
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    ).then(({ data }) => {
      if (data.code === 0) {
        this.setState({
          coverUrl: data.data
        })
      } else {
        notification.error("Upload image failed.")
      }
    })
  }

  handleSubmit = values => {
    const { first_name, last_name, account, company_name, description, website, rss_input } = values
    const { coverUrl, location } = this.state
    const { logintype, username } = this.props.self
    this.props.createMediaAccount(
      {
        first_name,
        last_name,
        account,
        company_name,
        description,
        icon: coverUrl,
        location,
        website,
        rss_input,
        email: logintype === 1 && username ? username : null,
      }
    ).then(({ value: { data } }) => {
      if (data.code === 0) {
        this.props.getSelf(true).then(user => {
          if (user.account) {
            window.location.href = '/home'
          }
        })
      } else {
        notification.error(data.message)
      }
    })
  }



  render() {
    const { coverUrl, agreePolicy, location } = this.state

    return (
      <BodyClassName className='mp-light-body'>
        <div className='Create-Publisher'>
          <Nav />

          <div className='Card container'>
            <header>
              <h3>Create New Publisher Profile</h3>
            </header>

            <Form
              className='form-create-profile'
              layout={"verticle"}
              validateMessages={this.validateMessages}
              onFinish={this.handleSubmit}
              colon={false}
            >
              <Form.Item
                className='form-item form-item-half'
                label='First Name'
                name='first_name'
                rules={[{ required: true }]}
              >
                <Input className='input' />
              </Form.Item>
              <Form.Item
                className='form-item form-item-half'
                label='Last Name'
                name='last_name'
                rules={[{ required: true }]}
              >
                <Input className='input' />
              </Form.Item>
              <Form.Item
                className='form-item'
                label='Publisher Name (This is your handle name in our app)'
                name='account'
                rules={[{ required: true }]}
              >
                <Input className='input' />
              </Form.Item>
              <Form.Item
                className='form-item'
                label='Company Name'
                name='company_name'
              >
                <Input className='input' />
              </Form.Item>
              <Form.Item
                className='form-item'
                label='Website URL'
                name='website'
                rules={[{ type: "url" }]}
              >
                <Input className='input' />
              </Form.Item>
              <Form.Item
                className='form-item desc'
                label='Description'
                name='description'
                rules={[{ required: true }]}
              >
                <Input.TextArea className='textarea'
                  placeholder='Tell audiences something about your publication or your account. This description will be shown on your profile page'
                />
              </Form.Item>
              <Form.Item
                className='form-item cover'
                label='Publisher Profile Picture'
                name='cover'
                trigger='onUpload'
                rules={[{ required: true }]}
              >
                <ImageUploader
                  onUpload={this.handleUploadCover}
                  image={coverUrl}
                  className="image-uploader"
                  sizeLimit={20000000}
                  previewType="circle"
                  aspectRatio={1}
                  outputWidth={400}
                  outputHeight={400}
                >
                  <div>Tap to upload an image</div>
                  <span>Picture size should not exceed 20MB</span>
                </ImageUploader>
              </Form.Item>
              <Form.Item
                className='form-item form-location'
                label='Your Location'
                name='location'
              >
                <LocationSelector selected={location} onSelect={(location) =>
                  this.setState({ location })} />
              </Form.Item>

              <Form.Item
                className='form-item rss'
                label='RSS Links'
                name='rss_input'
                initialValue="">
                <Input.TextArea className='textarea'
                  placeholder='Add a list of your rss feeds, separated by line return or comma.'
                />
              </Form.Item>

              <PublisherTos />

              <div className='privacy-policy'>
                <div
                  className={cx('agree-radio', agreePolicy && 'agree')}
                  onClick={() => this.setState({ agreePolicy: !agreePolicy })}
                />
                <div className='text'>
                  <span>To continue your account registration, please agree and accept NewsBreak </span>
                </div>
              </div>
              <Form.Item className='btn-container'>
                <Button
                  className={cx('Button', 'submit-btn')}
                  type={'primary'}
                  htmlType='submit'
                  disabled={!agreePolicy}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </BodyClassName>
    )
  }
}

export default compose(
  withAuth,
  connect(
    null,
    { createMediaAccount }
  )
)(CreatePublisher)
