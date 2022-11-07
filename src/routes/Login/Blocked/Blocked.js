import React from 'react'
import BodyClassName from 'react-body-classname'
import Nav from 'components/Nav'
import withAuth from 'hocs/withAuth'

import './Blocked.scss'

class Blocked extends React.Component {
  componentDidMount() {
    this.props.getSelf().then(user => {
      if (user) {
        if (window.location.pathname === '/blocked' && !user.blocked) {
          window.location.href = '/home'
        }
      } else {
        window.location.href = '/login'
      }

    })
  }
  render() {
    return (
      <BodyClassName className='mp-light-body'>
        <div className='blocked'>
          <Nav />
          <img alt='' src={require('asset/img/blocked.png')} />
          <div className="info">Your account has already been blocked.</div>
          <span className="help">
            If you need any tech support, please send email to
            mp.support@particle-inc.com
          </span>
        </div>
      </BodyClassName>
    )
  }
}
export default withAuth(Blocked)
