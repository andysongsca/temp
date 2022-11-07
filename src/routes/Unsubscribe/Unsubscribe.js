import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import BodyClassName from 'react-body-classname'
import { Checkbox } from 'antd'

import { fetchSubscribeStats } from 'redux/stats'
import { parseQuery } from 'hocs/withQuery'
import { notification } from 'components/Notification'
import api from 'utils/api'
import './Unsubscribe.scss'

const Unsubscribe = ({
  subscribeStats
}) => {
  const dispatch = useDispatch()
  const [creatorNotification, setCreatorNotification] = useState(false)
  const [nbNotification, setNbNotification] = useState(false)
  const query = parseQuery(window.location)
  const params = { "id": query.id, "scope": query.scope, "code": query.code }

  useEffect(() => {

    dispatch(fetchSubscribeStats(params)).then((res) => {
        const { value: { data: { data } } } = res
        if (!data) {
            return
          }
        setCreatorNotification(data.creator_activity_subscribed === 1)
        setNbNotification(data.nb_notification_subscribed === 1)
      })
  }, [])

  const onCheckCreatorNotification = (e) => {
    const value = e.target.checked
    setCreatorNotification(value)
  }

  const onCheckNbNotification = (e) => {
    const value = e.target.checked
    setNbNotification(value)
  }

  const handleUpdate = () => {
    const payload = {
      ...params, 
      creator_activity_subscribed: creatorNotification ? 1 : 0,
      nb_notification_subscribed: nbNotification ? 1 : 0
    }
    api.post('/user/unsubscribe', payload).then(({ data }) => {
      if (data.code === 0) {
        notification.success("You have succesfully unsubscribed from NewsBreak's contributor reminder mailing list.")
      } else {
        notification.error("We are having some issues completing your request. Please try again.")
      }
    })
    console.log(payload)
  }

  return (
    <BodyClassName className="Unsubscribe-body">
      <div className="common-header__logo-wrapper">
        <a href="https://www.newsbreak.com"><img className="common-header__logo" src="https://static.particlenews.com/mp/NB-logo.svg" alt="logo" /></a>
        <h2>Contributor email subscriptions</h2>
        <div className="checkbox-content">
          <Checkbox onChange={onCheckCreatorNotification} checked={creatorNotification}><b>Content updates:</b> emails about your performance, publishing status and other individual content insights</Checkbox>
          <Checkbox onChange={onCheckNbNotification} checked={nbNotification}><b>Recommendations and reminders:</b> emails from the NewsBreak team about your account and activity</Checkbox>
        </div>
        <button className="Button update-button" onClick={handleUpdate}>Update</button>
      </div>
    </BodyClassName>
  )
}
export default connect(
  ({ stats: { subscribeStats } }) => ({ subscribeStats }),
  { fetchSubscribeStats },
)(Unsubscribe)
