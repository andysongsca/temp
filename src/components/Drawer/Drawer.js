import React from 'react'
import { Drawer as AntdDrawer } from 'antd'
import './Drawer.scss'

const Drawer = props => {
  const { children, onClose, isVisible, title } = props

  const handleClose = () => {
    if (onClose) {
      onClose()
      //hack to remove body style
      setTimeout(() => {
        document.body.removeAttribute('style')
      }, 1000)
    }
  }

  return (
    <AntdDrawer
      title={title || 'Drawer'}
      placement={'left'}
      closable={true}
      onClose={handleClose}
      visible={isVisible}
      key={`left`}
      destroyOnClose={true}
      className={'Drawer-Content'}
      headerStyle={{ backgroundColor: '#F9F9F9' }}
      drawerStyle={{ backgroundColor: '#F9F9F9' }}
      bodyStyle={{ padding: 0 }}
    >
      {children}
    </AntdDrawer>
  )
}

export default Drawer
