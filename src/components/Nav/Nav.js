import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import ReactDOM from 'react-dom'
import { Link } from 'react-router-dom'

import api from 'utils/api'
import { logSetActiveMedia } from 'utils/logEvent'
import withAuth from 'hocs/withAuth'
import Pop from 'components/Pop'
import { notification } from 'components/Notification'
import { CVScorePopover, ModalContext } from 'components/Creator'
import { useCookies } from "react-cookie"
import { logout } from 'redux/login'
import './Nav.scss'


const Nav = (props) => {
  const { self, logout } = props
  const [node, setNode] = useState()
  const [cookies, setCookie] = useCookies(['cvs_notification', 'cvs_dismiss']);
  const alertCount = 0 //self && self.is_creator && cookies.cvs_notification !== "shown" ? 1 : 0
  const shouldShowPopover = cookies.cvs_dismiss !== "shown"
  const medias = self && self.medias ? self.medias.slice(0, 3) : null
  const context = React.useContext(ModalContext)

  useEffect(() => {
    const nd = document.createElement('div')
    nd.id = 'Nav'
    const layout = document.getElementById('Layout')
    const layoutContainer = document.getElementById('Layout-Container')
    if (layout && layoutContainer) {
      layout.insertBefore(nd, layoutContainer)
    }
    setNode(nd)

    return () => {
      if (nd) {
        layout.removeChild(nd)
      }
    }
  }, [])

  if (!node) {
    return null
  }

  const handleLogout = () => {
    logout().then(() => {
      window.location.href = '/login'
    })
      .catch(error => {
        console.error('Error during service worker registration:', error);
      })
  }

  const handleSetMedia = (media_id) => {
    self.active_media = media_id
    logSetActiveMedia(media_id)

    api.post('/media/set_active',
      { media_id: media_id }).then(({ data }) => {
        const { status, reason } = data
        if (status === 'success') {
          window.location.href = '/home/setting'
        } else {
          notification.error(reason)
        }
      })
  }

  const handleProfileNav = () => {
    window.location.href = '/home/account_setting'
  }

  const handleNotificationOk = () => {
    context.openCVScoreModal()
    setCookie('cvs_notification', "shown", { path: '/' })
  }

  const handleDismiss = () => {
    setCookie('cvs_dismiss', "shown", { path: '/' })
  }

  return ReactDOM.createPortal(
    <div className='Nav-Content'>
      <div className='Nav-Logo'>
        <img className="Logo" src="https://static.particlenews.com/mp/NB-logo.svg" alt="NewsBreak" />
      </div>
      {self && <div className="account-info">
        {self && self.is_creator && self.account && <CVScorePopover
          visible={shouldShowPopover}
          onOK={handleNotificationOk}
          onDismiss={handleDismiss}
        >
          <div className="alerts">
            {alertCount > 0 ? <div className="alerts-count">{alertCount}</div> : null}
          </div>
        </CVScorePopover>}

        <div className='user-info'>
          {alertCount === 0 && self.account && <div className='username'>
            <span>Welcome, </span><b>{self.account}</b>
          </div>}

          <div className='avatar' style={{ backgroundImage: `url(${self.icon || require('asset/img/default_avator.png')})` }} />

          <Pop className='menu' position='top-right'>
            <ul>
              {medias && Object.entries(medias).map(([key, value]) =>
                <li key={key} className="profile-item" onClick={() => handleSetMedia(value.media_id)}>{value.account}</li>)}
              {medias && self.medias && (medias.length < self.medias.length) && (
                <li className="profile-item" onClick={() => handleProfileNav()}>More Profiles...</li>
              )}

              {self.account && !self.is_creator && <li><Link to="/home/account_setting">Account Settings</Link></li>}
              <li><a href={self.is_creator ? 'mailto:creators.support@newsbreak.com' : 'mailto:mp.support@newsbreak.com'}>Contact us</a></li>
              {self.account && self.is_creator && <li><a href="https://newsbreakcommunity.circle.so" rel="noopener noreferrer" target="_blank">Contributor Community</a></li>}
              <li onClick={() => handleLogout()}>Log out</li>
            </ul>
          </Pop>
        </div>
      </div>}
    </div>,
    node
  )
}

export default compose(
  withAuth,
  connect(
    ({ login }) => ({ ...login }),
    { logout }
  )
)(Nav)
