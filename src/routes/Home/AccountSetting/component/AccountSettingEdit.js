/* This component is currently out of service
import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'
import { fetchAccountInfo } from 'redux/account_setting'
import { fetchSelf } from 'redux/login'
import { Skeleton } from 'antd'
import { withRouter } from 'react-router'
import logEvent from 'utils/logEvent'

import './AccountSettingEdit.scss'

class AccountSettingEdit extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      agreePolicy: false,
    }
  }

  componentDidMount() {
    this.props.fetchAccountInfo()
    logEvent('page_visit_start', { page: 'account-edit' })
  }

  componentWillUnmount() {
    logEvent('page_visit_end', { page: 'account-edit' })
  }

  render() {
    const { fetched } = this.props

    return (
      <div className="setting-edit">
        <Skeleton loading={!fetched}>
          <Form
            className='form-setting-edit'
            submitButton={null}
            onFinish={this.handleSubmit}
          >

            <Form.Item
              className='form-item rss'
              label='Medias'
              name='medias'
            >
              <Input.TextArea className='textarea'
                placeholder='This is the place holder for adding user to media.'
              />
            </Form.Item>


            <Form.Item className='submit-button'>
              <Button
                shape="round"
                onClick={() => this.props.history.push('account_setting')}
              >Cancel</Button>
              <Button
                className={cx('Button')}
                type='primary'
                htmlType="submit"
              >Save</Button>
            </Form.Item>
          </Form>
        </Skeleton>
      </div>
    )
  }
}

export default withRouter(connect(
  ({ setting, login }) => ({ ...setting, ...login }),
  { fetchAccountInfo, fetchSelf },
)(AccountSettingEdit))
*/
