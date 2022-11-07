import React from 'react'
import { Row, Col } from 'antd'
import cx from 'classnames'

export default function NewAcctNav(props) {
  const { active, isCreator } = props
  return (
    <Row className="new-account-nav">
      <Col span={8} className={cx(active === 0 && 'active', active > 0 && 'done')}>
        <div className="status-bar"></div>
        <div className="label">1. Complete account info</div>
      </Col>
      <Col span={8} className={cx(active === 1 && 'active', active > 1 && 'done')}>
        <div className="status-bar"></div>
        <div className="label">2. {isCreator ? 'Create contributor profile' : 'Create publication profile'}</div>
      </Col>
      <Col span={8} className={cx(active === 2 && 'active')}>
        <div className="status-bar"></div>
        <div className="label">3. Wait for account approval</div>
      </Col>
    </Row>
  )
}
