import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Popconfirm, Button, Select, Input } from 'antd'

import { fetchSelf } from 'redux/login'
import { notification } from 'components/Notification'
import api from 'utils/api'
import logEvent, { logSetActiveMedia } from 'utils/logEvent'
import MediaModal from './Media/MediaModal'
import './AccountSetting.scss'

const { Option } = Select

class AccountSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showPublish: false,
      sortingField: 'ts',
      sortingDir: 'desc',
      medias: props.self.medias,
    }
  }

  componentDidMount() {
    logEvent('page_visit_start', { page: 'account' })
  }

  componentWillUnmount() {
    logEvent('page_visit_end', { page: 'account' })
  }

  getRoleName = (role) => {
    switch (role) {
      case 0: // email has not been activated
        return "Owner"
      case 1:
        return "Admin"
      case 2:
        return "Editor"
      case 10:
        return "Super Admin"
      default:
        return "Unknown Role"
    }
  }

  canManageUser = (role) => {
    return role < 2 || role === 10
  }

  canDeleteProfile = (role) => {
    return role === 0 || role === 10
  }

  onSortField = (value) => {
    this.setState({ sortingField: value })
    this.sortMedias(value, this.state.sortingDir)
  }

  onSortDir = (value) => {
    this.setState({ sortingDir: value })
    this.sortMedias(this.state.sortingField, value)
  }

  sortMedias = (field, dir) => {
    logEvent('account_settings_media_sort', { options: [field, dir] })
    // get list of medias with sorting options
    api.get(`/account/medias?field=${field}&order=${dir}`)
      .then(({ data }) => {
        if (data.code === 0) {
          this.setState({
            users: data.data,
            medias: data.data.medias
          })
        } else {
          notification.error(data.message)
        }
      })
  }

  handleProfileDelete = ({ media_id }) => {
    logEvent('account_settings_delete_profile', { media_id })
    api.delete(`/media/remove_profile/${media_id}`)
      .then(({ data }) => {
        if (data.code === 0) {
          this.props.fetchSelf(true).then(() => {
            this.setState({
              medias: this.props.medias
            })
          })
        } else {
          notification.error(data.message)
        }
      })
  }

  handleManageMedia = (value) => {
    this.setState({
      media_edit_loading: true,
      media_edit_visible: false
    })

    logEvent('account_settings_manage_media', { media_id: value.media_id })
    api.get(`/media/get_users/${value.media_id}`)
      .then(({ data }) => {
        this.setState({
          media_edit_loading: false,
          media_edit_visible: true,
          users: data.data,
          media_role: value.media_role,
          mediaInfo: value,
        })
        if (data.code !== 0) {
          notification.error(data.message)
        }
      })
  }

  handleSetMedia = (media_id) => {
    if (!media_id) {
      return
    }
    this.props.self.active_media = media_id
    logSetActiveMedia(media_id)

    api.post('/media/set_active',
      { media_id: media_id }).then(({ data }) => {
        const { status, reason } = data
        if (status === 'success') {
          this.setState({
            status,
          })
          window.location.href = '/home/setting'
        } else {
          this.setState({
            status,
            msg: reason
          })
        }
      })
  }


  render() {
    const { self } = this.props
    const { medias, mediaInfo, media_edit_loading, media_edit_visible, media_role, users } = this.state

    if (self && self.username) {
      return (
        <div className="user">
          <div className="account-info">
            <div className="account">{self.username}</div>
          </div>
          {self.su && <div className="search-profile-container">
            <Input.Search className="search-profile-input" placeholder="enter media id" enterButton onSearch={this.handleSetMedia} />
          </div>
          }
          <div className="sorting-container">
            <span className="sorting-select-container">
              <Select defaultValue="ts" onChange={this.onSortField}>
                <Option value="ts">time created</Option>
                <Option value="alpha">alpha</Option>
              </Select>
            </span>
            <span className="sorting-select-container">
              <Select defaultValue="desc" onChange={this.onSortDir}>
                <Option value="desc">desc</Option>
                <Option value="asc">asc</Option>
              </Select>
            </span>
          </div>
          <div>
            <ul className="medias_list">
              {medias && medias.map((media) =>
                <li className="user-media" key={media.media_id}>
                  {media.account === self.account ? (
                    <div className='profile_name_current'>
                      <span className='profile_val'><h3>{media.account}</h3></span>
                    </div>
                  ) : (
                    <div className='profile_name' onClick={() => this.handleSetMedia(media.media_id)}>
                      <span className='profile_val'>{media.account}</span>
                    </div>
                  )}
                  <div className="media-role">
                    <span className='profile_val'>{this.getRoleName(media.media_role)}</span>
                    {this.canManageUser(media.media_role) && (
                      <span className='div-manage-access'>
                        <Button className="btn-manage-access" onClick={() => this.handleManageMedia(media)} loading={media_edit_loading}>
                          <img alt="manage access" src={require('asset/img/wheel.png')} className='img-manage-access' />
                          <span className="btn-label">Manage</span>
                        </Button>
                      </span>
                    )}

                    {this.canDeleteProfile(media.media_role) && (
                      <Popconfirm
                        title="All the media profile data will be deleted! Are you really sure you want delete this media profile?"
                        onConfirm={() => this.handleProfileDelete(media)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <span className='div-delete-profile'>
                          <Button className="btn-delete-profile" loading={media_edit_loading}>
                            <img alt="delete profile" src={require('asset/img/op/delete@2x.png')} className='img-delete-profile' />
                            <span className="btn-label">Remove</span>
                          </Button>
                        </span>
                      </Popconfirm>
                    )}
                  </div>
                </li>
              )}
            </ul>

            {media_edit_visible && <MediaModal
              visible={true}
              media={mediaInfo}
              users={users}
              auth_username={self.username}
              media_role={media_role}
              onClose={() => this.setState({ media_edit_visible: false })}
            />}

            <div className="new-profile-container">
              <Button className='new-profile-btn' type="primary" shape="round"><Link to="/create-publisher">Create New Profile</Link></Button>
            </div>
          </div>
        </div>
      )
    } else {
      return (<div></div>)
    }
  }
}

export default connect(
  ({ setting, login }) => ({ ...setting, ...login }),
  { fetchSelf },
)(AccountSetting)
