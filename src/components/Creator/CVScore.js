import React, { useState } from 'react'
import { Modal, Button, Popover } from 'antd'
import './CVScore.scss'

export function CVScoreModal(props) {
  const { visible, onClose, onReadMore } = props

  return (
    <Modal
      className="cvscore-modal"
      visible={visible}
      centered
      width={452}
      height={446}
      onCancel={onClose}
      footer={<div> <Button onClick={onClose}>Dismiss</Button>
        <Button key="submit" type="primary" onClick={onReadMore}>View New Terms</Button></div>}
    >
      
      <h2>Changes to Our Monetization Terms</h2>
      <p className="content-text">In order to continue publishing on NewsBreak, you must read and agree to our new Monetization Terms by August 1, 2021. </p>
      <p>Important changes include removing CV Score from published content and associated base pay (if applicable). Moving forward, contributors approved for monetization will receive monthly payouts based on revenue generated from qualifying content. You will be able to check your revenue and performance with metrics for qualifying articles or qualifying videos in your contributor portal. </p>
      <ul className="content-bullets">
      </ul>
    </Modal>
  )
}

export function CVScorePopover(props) {
  const { visible, children, onOK, onDismiss } = props
  const [showPopover, setShowPopover] = useState(visible)
  
  const cancelAlert = () =>{
    setShowPopover(false)
    onDismiss()
  }

  const handleOK = () => {
    setShowPopover(false)
    onOK()
  }

  const PopoverTitle = () => {
    return <>
      <img src={require('asset/svg/cv-feature.svg')} alt="cv score" />
      <span>Introducing Content Value (CV) Score</span>
      <img src={require('asset/svg/ic-close.svg')} alt="dismiss" className="dismiss" onClick={cancelAlert} />
    </>
  }

  const PopoverContent = () => {
    return <div className="popover-content cv-score">
      <span className="content-text">We're rolling out new monetization terms! Click to learn what the
        Content Value (CV) Score is and how it works.</span>
      <div className="btns">
        <Button type="link" onClick={cancelAlert}>Dismiss</Button>
        <Button type="primary" onClick={handleOK}>Check it out</Button>
      </div>
    </div>
  }

  return <>
    <Popover
      overlayClassName="alert-popover"
      title={<PopoverTitle />}
      content={<PopoverContent />}
      placement="bottomRight"
      visible={showPopover}
      onClick={onOK}
    >
      {children}
    </Popover>
  </>
}
