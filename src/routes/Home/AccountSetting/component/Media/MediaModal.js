import React from 'react'
import { Form, Modal, Popconfirm, Input, Select, Button } from 'antd'

import api from 'utils/api'
import logEvent from 'utils/logEvent'
import { notification } from 'components/Notification'

import './MediaModal.scss'

const { Option } = Select

class MediaModal extends React.Component {
  constructor(props) {
    super(props)

    this.timeout = 0
    this.searchInputRef = React.createRef()
    this.state = {
      invite_msg_visible: false,
      invite_message: '',
      invite_btn_visible: false,
      users: props.users,
    }
    this.addUserRef = React.createRef()
    this.addUserRoleRef = React.createRef()
    this.addUserFormRef = React.createRef()
  }

  resetForm = () => {
    this.addUserRef.current.input.value = ''
    this.addUserRef.current.state.value = ''
    this.addUserRoleRef.current.value = ''
    this.addUserRef.current.focus()
  }

  onInvite = () => {
    const media_id = this.props.media.media_id
    const user_name = this.addUserRef.current.input.value
    logEvent('media_modal_invite_user', { media_id, user_name })
    api.post('/media/invite_user', { media_id, user_name }).then(({ data }) => {
      if (data.code === 0) {
        this.setState({
          invite_msg_visible: true,
          invite_btn_visible: false,
          invite_message: data.message
        })
        this.resetForm()
      } else {
        this.setState({
          invite_msg_visible: true,
          invite_btn_visible: true,
          invite_message: data.message
        })
      }
    })
  }

  handleAddUser = (values) => {
    const { user_name, role } = values
    const media_id = this.props.media.media_id
    // for now an add is automatically converted to an invite 
    logEvent('media_modal_add_user', { media_id, user_name, role })
    api.post('/media/add_user', { media_id, user_name, role }).then(({ data }) => {
      if (data.code === 0) {
        let users = Object.assign(this.state.users.users, data.data)
        this.setState({
          users: { users: users },
          invite_msg_visible: false,
          invite_btn_visible: false,
          invite_message: ''
        })
        this.resetForm()
      } else {
        this.setState({
          invite_msg_visible: true,
          invite_btn_visible: data.code === 1, // if it is an email address, confirm if needs to be sent
          invite_message: data.message
        })
      }
    })
  }

  handleRemoveUser = (media, value) => {
    const user_id = parseInt(value.user_id)
    const media_id = media.media_id
    logEvent('media_modal_remove_user', { media_id, user_id })
    api.post('/media/remove_user', { media_id, user_id }).then(({ data }) => {
      if (data.code === 0) {
        let users = this.state.users
        delete this.state.users.users[user_id]
        this.setState({ users: users })
      } else {
        notification.error(data.message)
      }
    })
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


  getAssignableRoles = (role) => {
    // return a key value part of assigned roles
    switch (role) {
      case 0: // email has not been activated
      case 10: // super user
        return { 1: "Admin", 2: "Editor" }
      case 1:
        return { 2: "Editor" }
      default:
        return 0
    }
  }

  render() {
    const { media, users, auth_username, media_role, visible, onClose } = this.props
    let roles = typeof media_role === 'undefined' ? 0 : this.getAssignableRoles(media_role)

    // users have their own user and corresponding role.
    return (
      <Modal
        visible={visible}
        onCancel={onClose}
        centered
        footer={null}
        width={600}
        wrapClassName="media-modal"
      >
        <div className="selected-box box">
          <span className="info">
            Manage user access to <b> {media && media.account} </b> here.
          </span>
        </div>
        <ul className="user-list">
          {users && users.users && Object.entries(users.users).map(([key, value]) =>
            value.role !== 10 && <li data={key} key={key}>
              <div>{value.user_name} : {this.getRoleName(value.role)}
              </div>

              {value.user_name !== auth_username && ((media_role === 10 && value.role > 0) || media_role < value.role) && (
                <Popconfirm
                  key={value}
                  title={
                    `Do you want to remove ${value.user_name}
                  from ${media.account}?`
                  }
                  onConfirm={() => {
                    this.handleRemoveUser(media, value)
                  }}
                >
                  <Button type="link">Remove</Button>
                </Popconfirm>
              )}

            </li>)}
        </ul>
        {roles && (
          <Form
            className='form-setting-edit'
            ref={this.addUserFormRef}
            onFinish={this.handleAddUser}
          >
            <Form.Item
              className='form-item'
              label='Add User (add existing user email here)'
              name='user_name'
            >
              <Input ref={this.addUserRef} className='input' />
            </Form.Item>
            <Form.Item
              className='form-item'
              label='Role'
              name='role'
            >
              <Select ref={this.addUserRoleRef} style={{ width: 120 }}>
                {Object.entries(roles).map(([key, value]) =>
                  <Option key={key} value={key}>{value}</Option>
                )}
              </Select>
            </Form.Item>

            <Form.Item className='submit-button'>
              <Button
                htmlType="submit"
              >Add</Button>
              {this.state.invite_msg_visible && (
                <div>{this.state.invite_message}</div>
              )}
              {this.state.invite_btn_visible && (
                <Popconfirm
                  title="Are you sure you want invite this user?"
                  onConfirm={this.onInvite}
                  onCancel={onClose}
                  okText="Yes"
                  cancelText="No"
                >
                  <button>Invite</button>
                </Popconfirm>
              )}
            </Form.Item>
          </Form>
        )}
      </Modal>
    )
  }
}

export default MediaModal
