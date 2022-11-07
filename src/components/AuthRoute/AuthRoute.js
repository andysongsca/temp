import React, { useState, useEffect } from 'react'
import { Route } from 'react-router'
import withAuth from 'hocs/withAuth'
import { withRouter } from 'react-router'
import { initLog } from 'utils/logEvent'

const AuthRoute = (props) => {
  const [access, setAccess] = useState(false)
  useEffect(() => {
    const { always, getSelf } = props

    getSelf().then(user => {
      const { location } = window
      const { pathname } = location
      let res = false
      // if logged in
      if (user) {
        initLog(user)
        if (user.blocked) { // blocked user
          props.history.push('/blocked')
        } else if (user.account) { // user with media account
          res = true
          if ('/new-account' === pathname) {
            location.href = '/home'
          }
        } else if (always) { // special case
          res = true
        } else if (pathname !== '/new-account') { // user without media account
          return location.href = '/new-account'
        }
        // if not logged in
      } else if (pathname !== '/login') {
        location.href = `/login?redirect=${encodeURIComponent(location.href)}`
      }

      if (res) {
        setAccess(true)
      }
    })
  }, [])

  return access ? (
    <Route {...props} />
  ) : null
}

export default withAuth(withRouter(AuthRoute))
