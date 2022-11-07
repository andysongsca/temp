import React from 'react'
import {Affix} from 'antd'
import './Layout.scss'

class Layout extends React.Component {
  render() {
    return (
      <div id='Layout'>
        <div id='Layout-Container'>
          <Affix className='Notification-affix'>
            <div id='notification' />
          </Affix>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Layout