import React from 'react'
import { Modal, Button, Checkbox } from 'antd'

export default function ContributorModal(props) {

  return (
    <Modal
      className='contributor-notification-modal'
      visible={props.visible}
      centered
      width={452}
      height={565}
      onCancel={props.onClose}
      footer={<Button key="submit" type="primary" onClick={props.onClose}>Finished</Button>}
    >
      <p className='contributor-title'>Introducing the Contributor Network</p>
      <p className='contributor-content'>Please take a minute to review our updated policy, requirements and new editorial standards, which are effective November 9, 2021.</p>
      <div className='contributor-item'>
        <div className='contributor-item-title'>
          <Checkbox />
          <p className='contributor-item-name'><a href="/creator-content-policy" rel="noopener noreferrer" target="_blank">1. Updated Content Policy</a></p>
        </div>
        <p className='contributor-item-content'>There are not any major changes to our new policy, but this is the new unified standard for all content on NewsBreak. You might notice some examples and explanations have been updated.</p>
      </div>
      <div className='contributor-item'>
        <div className='contributor-item-title'>
          <Checkbox />
          <p className='contributor-item-name'><a href="/creator-content-requirements" rel="noopener noreferrer" target="_blank">2. Updated Content Requirements</a></p>
        </div>
        <p className='contributor-item-content'>The content requirements have been updated to reflect style, formatting, dimensions, etc that are necessary to publish an article or video on NewsBreak.</p>
      </div>
      <div className='contributor-item'>
        <div className='contributor-item-title'>
          <Checkbox />
          <p className='contributor-item-name'><a href="/contributor-editorial-standards" rel="noopener noreferrer" target="_blank">3. New Editorial Standards & Guidelines</a></p>
        </div>
        <p className='contributor-item-content'>The Editorial Standards & Guidelines is a new document that aims to provide more transparency and credibility between contributors and our audience.</p>
      </div>
    </Modal>
  )
}
