import React, { useEffect, useState } from 'react'
import BodyClassName from 'react-body-classname'

import withQuery from 'hocs/withQuery'
import withAuth from 'hocs/withAuth'
import logEvent from 'utils/logEvent'
import api from 'utils/api'
import { Loading } from 'components/utils'
import { notification } from 'components/Notification'

import './Setting.scss'

function StripePayment(props) {
  const { location: { query } } = props
  const [status, setStatus] = useState(null)

  const updateHandler = ({ data }) => {
    setStatus(data.code)
    if (data.code < 0) {
      notification.error(data.message)
    }
    setTimeout(() => window.location = '/home/setting', 3000)
  }

  useEffect(() => {
    logEvent('page_visit_start', { page: 'stripe_payment' })
    if (status === null) {
      if (sessionStorage.getItem('pm_state') === query.state) {
        api.post('/setting/payment', {
          vendor: 'stripe',
          stripe_token: query.code
        }).then(updateHandler)
      } else {
        console.log('state does not match: ', sessionStorage.getItem('pm_state'), query.state)
        updateHandler({
          data: {
            code: -99,
            message: 'Your session has expired. Please log in again.'
          }
        })
      }
    }
    return () => logEvent('page_visit_end', { page: 'stripe_payment' })
  }, [])

  return <BodyClassName className='mp-light-body'>
    <div className="payment-setting">
      {status === null && <><Loading /><div className="message">Please wait while we are processing your payment setting ... </div></>}
      {status === 0 && <div className="message">Payment setting updated. You will be redirected to profile settings in a few seconds ... </div>}
      {status < 0 && <div className="message">Error while processing your payment setting. You will be redirected to profile settings in a few seconds ...  </div>}
    </div>
  </BodyClassName>
}

export default withAuth(withQuery(StripePayment))
