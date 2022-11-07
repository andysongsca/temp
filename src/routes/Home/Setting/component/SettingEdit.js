/* eslint-disable no-template-curly-in-string */
import React from 'react'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import { result } from 'underscore'
import { connect } from 'react-redux'
import { fetchMediaInfo } from 'redux/setting'
import { fetchSelf, updateUserProfile } from 'redux/login'
import { Skeleton, Form, Input, Button, Radio } from 'antd'
import ImageUploader from '@/components/ImageUploader'
import { Tooltip } from 'components/utils'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import { ReactComponent as IconSendVerification } from 'asset/svg/send-verification.svg'

import api from 'utils/api'
import logEvent from 'utils/logEvent'
import { notification } from 'components/Notification'

import './SettingEdit.scss'

class SettingEdit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      agreePolicy: false,
      bioVerificationRequired: false
    }
  }

  componentDidMount() {
    this.props.fetchMediaInfo()
    logEvent('page_visit_start', { page: 'profile-edit' })
  }

  componentWillUnmount() {
    logEvent('page_visit_end', { page: 'profile-edit' })
  }

  static getDerivedStateFromProps(props, state) {
    const { media } = props
    const { cover, location } = state
    return {
      ...state,
      cover: cover || media.icon,
      location:
        location === undefined && media.location ? media.location : location
    }
  }

  onChangeBioVerificationRequired = (e) => {
    const { value } = e.target
    this.setState({ bioVerificationRequired: value })
  }

  handleBioVerificationRequired = () => {
    window.open("https://forms.gle/apa73GUoewKAsWcp9", '_blank')
  }

  handleUploadCover = file => {
    api
      .post(
        '/storage/upload-cover',
        { file },
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      .then(
        ({ data }) => {
          if (data.code === 0) {
            this.setState({
              cover: data.data
            })
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

  handleSubmit = values => {
    const {
      first_name,
      last_name,
      account,
      company_name,
      description,
      website,
      rss_input,
      mediaType,
      bio_tagline,
      bio_tagline_new,
    } = values
    const { self } = this.props
    const { cover, location } = this.state

    const email =
      result(self, 'logintype', 0) === 1 ?
        (result(self, 'media_role', 0) === 10 ? result(self, 'email', null) : result(self, 'username', null)) : null

    let payload = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      account: account.trim(),
      company_name: company_name ? company_name.trim() : company_name,
      description: description.trim(),
      icon: cover,
      website,
      location,
      email,
      rss_input,
      mediaType,
    }

    if (bio_tagline !== bio_tagline_new) {
      payload.bio_tagline_new = bio_tagline_new ? bio_tagline_new.trim() : bio_tagline_new
      payload.bio_under_review = true
    }

    api
      .put('/setting/media', payload)
      .then(({ data }) => {
        if (data.code === 0) {
          // update user profile
          const params = {
            "nickname": account,
            "profile": cover,
          }
          updateUserProfile(params)
          if (this.state.cover !== self.icon || self.account !== account || this.state.location !== self.location) {
            this.props.fetchSelf(true)
          }
          this.props.history.push('setting')
        } else {
          notification.error(data.message)
        }
      })
  }

  validateMessages = {
    required: '${label} is required',
    types: {
      email: '${label} is not valid email',
      url: '${name} is not a valid URL',
    },
  };

  locationValidator = () => {
    return !this.state.location ? Promise.reject('Please input your location') : Promise.resolve()
  }


  setLocation(loc) {
    this.setState({ location: loc})
  }

  render() {
    const { media, fetched, self } = this.props
    const { agreePolicy, bioVerificationRequired, cover, location } = this.state
    const source = self && self.creator_info && self.creator_info.source
    const isSourceOpen = source === "open registration"
    const phoneNumber = self && self.phone_number
    const phoneNeeded = phoneNumber !== '1(111)-1111'
    const {
      account,
      description = '',
      first_name = '',
      last_name = '',
      company_name = '',
      website = '',
      bio_tagline = '',
      bio_tagline_new = '',
      bio_under_review = false,
      rss = [],
      mediaType,
    } = media

    let rss_str = rss ? rss.join('\n') : ''

    return (
      <div className="setting-edit">
        <Skeleton loading={!fetched} paragraph={{ rows: 8 }}>
          <ImageUploader
            onUpload={this.handleUploadCover}
            image={cover}
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
            // submitButton={null}
            colon={false}
            onFinish={this.handleSubmit}
            validateMessages={this.validateMessages}
          >
            <Form.Item
              className="form-item"
              label="Account Name"
              name="account"
              initialValue={account}
              rules={[{ required: true, whitespace: true, message: 'text required'}]}
            >
              <Input className="input" />
            </Form.Item>

            {
              location && location !== 'N/A' && (
                <div className="form-item form-location">
                  Your Location
                  <Tooltip
                    className="location-tooltip"
                    title={"Please accurately select your U.S. city. You will not be able to change your location in your profile once saved. Contributors not located in the U.S. should select N/A."}
                    placement="bottom"
                  >
                    <IconInfo />
                  </Tooltip>

                  <div className="div-location">
                    <img alt="" src={require("asset/img/location.png")} />
                    <span>  {location}</span>
                  </div>
                </div>
              )
            }

            <Form.Item
              className="form-item"
              label="Bio"
              name="description"
              initialValue={description || ''}
              rules={[{ required: true, whitespace: true, message: 'text required'}]}
            >
              <Input.TextArea
                className="textarea"
                placeholder="Tell audiences something about your publication or your account. This description will be shown on your profile page"
              />
            </Form.Item>

            {
              self && self.is_creator && (
                <Form.Item
                  className="form-item"
                  label={(
                    <div>
                      Bio tagline
                      <Tooltip
                        className="form-tooltip"
                        title={(
                          <div>
                            This will appear on your posts in the NewsBreak feed and article page.
                            <a
                              href="https://support.newsbreak.com/knowledge/contributor-bio-tagline"
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              Learn more
                            </a>
                          </div>
                        )}
                        placement="bottom"
                      >
                        <IconInfo />
                      </Tooltip>
                    </div>
                  )}
                  name="bio_tagline_new"
                  initialValue={bio_tagline || bio_tagline_new}
                  rules={[{ required: true, whitespace: true, message: 'text required' }]}
                >
                  <Input className="input" disabled={bio_under_review} maxLength={41}/>
                </Form.Item>
              )
            }

            {self && self.is_creator && <Form.Item
              className="form-item-hidden"
              name="bio_tagline"
              initialValue={bio_tagline}
            />}

            {self && self.is_creator && <Form.Item
              className="form-item tagline"
              label="Bio tagline verification"
              name="bio_verification_required"
              initialValue={false}
              rules={[{ required: true }]}
            >
              <div>Have you identified yourself in the tagline as <b>a legal expert (this includes judge and lawyer), medical professional, scientist, financial advisor or journalist</b>. If so, you will need to provide additional professional and academic verification.</div>
              <div className="form-div-radio">
                <Radio.Group value={bioVerificationRequired} onChange={this.onChangeBioVerificationRequired} disabled={bio_under_review}>
                  <Radio className="tagline-radio" value={false}>No</Radio>
                  <Radio className="tagline-radio" value={true}>Yes</Radio>
                </Radio.Group>
                {bioVerificationRequired && <Button onClick={this.handleBioVerificationRequired}>
                  <IconSendVerification className="send-button" />Submit verification
                </Button>}
              </div>
            </Form.Item>}

            <Form.Item
              className="form-item form-item-half"
              label="Legal first name"
              name="first_name"
              initialValue={first_name || ''}
              rules={[{ required: true, whitespace: true, message: 'text required' }]}
            >
              <Input className="input" disabled={self && self.is_creator} />
            </Form.Item>

            <Form.Item
              className="form-item form-item-half"
              label="Legal last name"
              name="last_name"
              initialValue={last_name || ''}
              rules={[{ required: true, whitespace: true, message: 'text required' }]}
            >
              <Input className="input" disabled={self && self.is_creator} />
            </Form.Item>

            {mediaType === 1 && <Form.Item
              className="form-item"
              label="Company Name"
              name="company_name"
              initialValue={company_name || ''}
            >
              <Input className="input" />
            </Form.Item>}

            <Form.Item
              className="form-item"
              label="Website URL"
              name="website"
              initialValue={website || ''}
              rules={[{ type: 'url' }]}
            >
              <Input className="input" />
            </Form.Item>

            {isSourceOpen && phoneNeeded && <Form.Item
              className="form-item form-item-half"
              label="Phone Number"
              name="phone_number"
              initialValue={phoneNumber || ''}
              rules={[{ required: true }]}
            >
              <Input className="input" disabled={true} />
            </Form.Item>}

            {!isSourceOpen && <Form.Item
              className="form-item rss"
              label="RSS Links"
              name="rss_input"
              initialValue={rss_str || ''}
            >
              <Input.TextArea
                className="textarea"
                placeholder="Add a list of your rss feeds, separated by line return or comma."
              />
            </Form.Item>}

            <Form.Item
              name="mediaType"
              initialValue={mediaType}
              style={{ visibility: "hidden" }}
            >
            </Form.Item>

            {self && !self.is_creator ? <div className="privacy-policy">
              <div
                className={cx('agree-radio', agreePolicy && 'agree')}
                onClick={() => this.setState({ agreePolicy: !agreePolicy })}
              />
              <div className="text">
                <span>You agree to our </span>
                <Link to="/terms" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <a
                  target="_blank"
                  href="https://www.newsbreak.com/privacy"
                  rel="noopener noreferrer"
                >
                  Privacy Policy.
                </a>
              </div>
            </div> : null}
            <div className="submit-button">
              <Button
                className={cx('Button')}
                type="primary"
                htmlType="submit"
                disabled={self && !self.is_creator && !agreePolicy}
              >
                Save
              </Button>
            </div>
          </Form>
        </Skeleton>
      </div>
    )
  }
}

export default withRouter(
  connect(({ setting, login }) => ({ ...setting, ...login }), {
    fetchMediaInfo,
    fetchSelf
  })(SettingEdit)
)
