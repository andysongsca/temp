/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useEffect, useRef } from 'react'
import { Modal, Carousel, Input, message } from 'antd'
import logEvent from 'utils/logEvent'
import { handleCopy } from 'utils/utilities'
import './Creator.scss'

export default function ReferralModal(props) {
  const shareAppList = [
    { name: 'fb', title: 'Facebook' },
    { name: 'twt', title: 'Twitter' },
    // { name: 'lnk', title: 'LinkedIn' },
    // { name: 'msg', title: 'Messenger' },
    // { name: 'wsp', title: 'WhatsApp' },
  ]
  const { tab, referralCode, mediaId, onClose, self } = props
  const visible = tab >= 0
  const readerRefUrl = `https://newsbreakapp.onelink.me/2115408369?pid=mp_${mediaId}&msource=mp_${mediaId}`
  const creatorRefUrl = `http://creators.newsbreak.com/creators?source=open&referral_code=${referralCode}`
  const carousel = useRef()

  useEffect(() => {
    if (tab > -1) {
      setTimeout(() => carousel.current.goTo(tab, true), 0)
    }
    if (tab >= 0) {
      logEvent('referral_modal_open')
    }
  }, [tab])

  const handleReferral = (url, key, eventSource) => {
    const encodedUrl = encodeURIComponent(url)
    let surl = null
    switch (key) {
      case 'fb':
        surl = 'http://www.facebook.com/sharer/sharer.php?u=' + encodedUrl
        logEvent('app-refer-facebook-button-click', { page: eventSource })
        break
      case 'twt':
        surl = 'http://twitter.com/intent/tweet?url=' + encodedUrl
        logEvent('app-refer-twitter-button-click', { page: eventSource })
        break
      case 'lnk':
        break
      case 'cp':
        handleCopy(url)
        logEvent('app-refer-copy-button-click', { page: eventSource })
        message.info('Link copied. Use Ctrl + V to paste it to your destination.')
        return
      default:
        return
    }
    if (surl) {
      window.open(surl, '_blank')
    }
  }

  return (
    <Modal
      className="creator-share-modal"
      visible={visible}
      centered
      width={980}
      onCancel={onClose}
    >
      <Carousel dotPosition="top" ref={carousel}>
        <div key="0">
          <div className="tab">
            <div className="left-panel reader-referral">
              <h1>Share our app and earn $$</h1>
              <p>Welcome! By sharing the app download link to your social channels, websites or any other platforms,
              you will be paid monthly based on how many new readers download the app.</p>
            </div>
            <div className="sep-line" />
            <div className="right-panel">
              <h2>Share via App</h2>
              <ul className="share-app-list">
                {shareAppList.map(({ name, title }) => <li
                  className={`share-${name}`}
                  key={name}
                  onClick={() => handleReferral(readerRefUrl, name, 'reader-referral-modal')}>
                  <img src={require(`asset/img/share-${name}.png`)} alt={title} />
                </li>)}
              </ul>
              <div className="share-link-sep" />
              <h2>Share via Link</h2>
              <Input.Search
                placeholder="https://www.newsbreak.com/rss"
                prefix={<span>&#x1F517;</span>}
                enterButton="Copy"
                onSearch={() => handleReferral(readerRefUrl, 'cp', 'reader-referral-modal')}
                value={readerRefUrl}
              />
              <div className="hint">Copy and share the link with others to start earning.</div>
            </div>
          </div>
        </div>

        <div key="1">
          <div className="tab">
            <div className="left-panel creator-referral">
              <h1>Refer your fellow writers and earn $$</h1>
              {(self && self.is_creator && self.policy && self.policy.payment_version === self.policy.latest_payment_v) ?
                <p>Help other contributors discover our Contributor Network program by sharing your unique referral link. For each referred contributor who has met our criteria, you will receive a one-time $50 bonus.</p>
                :
                <p>Help others discover our Contributor Network program by sharing your referral link.
                  For each referred contributor who has met our criteria, you will receive a one-time $250 bonus.</p>
              }
            </div>
            <div className="sep-line" />
            <div className="right-panel">
              <h2>Refer via App</h2>
              <ul className="share-app-list">
                {shareAppList.map(({ name, title }) => <li
                  className={`share-${name}`}
                  key={name}
                  onClick={() => handleReferral(creatorRefUrl, name, 'creator-referral-modal')}>
                  <img src={require(`asset/img/share-${name}.png`)} alt={title} />
                </li>)}
              </ul>
              <div className="share-link-sep" />
              <h2>Refer via Link</h2>
              <Input.Search
                placeholder="https://www.newsbreak.com/rss"
                prefix={<span>&#x1F517;</span>}
                enterButton="Copy"
                onSearch={() => handleReferral(creatorRefUrl, 'cp', 'creator-referral-modal')}
                value={creatorRefUrl}
              />
              <div className="hint">Copy and share the link with others to start earning.</div>
            </div>
          </div>
        </div>
      </Carousel>
    </Modal>
  )
}
