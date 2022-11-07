import React from 'react'
import { Tooltip } from 'antd'
import cx from 'classnames'
import styles from './Tooltip.module.scss'

export default (props) => {
  const { children, autoWidth, overlayClassName } = props

  return <Tooltip
    color="#ffffff"
    arrowPointAtCenter
    {...props}
    overlayClassName={cx(styles['nb-tooltip'],
      overlayClassName,
      autoWidth && styles['auto-width']
    )}
  >
    {children}
  </Tooltip>
}
