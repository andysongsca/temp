import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import logEvent from 'utils/logEvent'
import { getStrikeStatuses } from 'redux/content'
import { compose } from 'redux'
import { connect } from 'react-redux'
import withAuth from 'hocs/withAuth'
import withQuery from 'hocs/withQuery'
import { ReactComponent as IconBack } from 'asset/svg/navigation-back.svg'
import { ModalContext } from 'components/Creator'
import { policyRejectMap } from 'utils/utilities'
import { time2durationSimple } from 'utils/utilities'

import './Strikes.scss'

const Strikes = (props) => {
  const { self, getStrikeStatuses, goto } = props
  const [strikes, setStrikes] = useState(null)

  const show_strike_list = strikes && strikes.length > 0
  useEffect(() => {
    getStrikeStatuses(self.media_id).then((res) => {
      if (res && res.value && res.value.data.code === 0) {
        let strikes_res = res.value.data.data
        strikes_res = strikes_res.sort(function (a, b) { return new Date(b.updated_time) - new Date(a.updated_time) })
        setStrikes(strikes_res)
      }
    })
    logEvent('page_visit_start', { page: 'strike' })
    return () => {
      logEvent('page_visit_end', { page: 'strike' })
    }
  }, [])

  const violation_count = self && self.violations && self.violations.count
  const strike_status = violation_count >= 3 ? "3 | Account termination" : violation_count === 2 ? "2 | Account suspension" : violation_count === 1 ? "1 | Warning" : undefined
  return (
    <div className="strikes">
      <div className="section header">
        {violation_count < 3 && <IconBack className="navigation-back" onClick={() => goto(`/home/content/post`)} />}
        <span className="title">Strike Management</span>
      </div>

      <div className="section strike-list">
        {!show_strike_list &&
          <div>
            <img className="no-strike" alt="" src={require("asset/img/no-strike.png")} />
            {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
            <div className="no-strike-text">Your account doesn't have any strikes. Keep up the good work 🎉. </div>
          </div>}
        {show_strike_list && <div>
          <div className='delete-warning'>We do not recommend deleting any content until the appeal process has been completed.
            If you choose to delete content prior to appealing, the strike will remain on your account.</div>
          {strike_status && <div className="strike-status">Strikes: {strike_status}</div>}
          {strikes && strikes.map((s, index) => <StrikeDetail {...s} key={s.task_id} index={index} />)}
        </div>}
      </div>
    </div>
  )
}


const StrikeDetail = (props) => {
  const context = React.useContext(ModalContext)
  const { title, status, task_id, updated_time, reason, index } = props
  const appeal_status = status === "not appealed" ? "appeal" : "appealed"
  const appeal_result_status = status !== "not appealed" ? status.status : ""
  const handleAppealClick = () => {
    context.updateAppealTask({ taskId: task_id, title: title })
    context.openAppealModal()
  }
  const appeal_review_update_time = time2durationSimple(status && status.update_time)
  const appeal_review_update_time_str = appeal_review_update_time === 'now' ? 'now' : appeal_review_update_time.includes('-') ? appeal_review_update_time : (appeal_review_update_time + ' ago')

  const updated_time_str = time2durationSimple(updated_time)
  const updated_time_str_display = updated_time_str === 'now' ? 'now' : updated_time_str.includes('-') ? updated_time_str : (updated_time_str + ' ago')


  return (
    <div className="strike-item">
      <div className="strike-title"> Strike issued
        <span className="strike-update-time"> {updated_time_str_display} </span>
      </div>

      <div className="strike-body">
        <div className="strike-text"> Your post <u>"{title}"</u> is found to violate our content policy <b>{reason}</b>.</div>
        <div className="strike-button-item">
          <Button className={`strike-button ${appeal_status}`} onClick={handleAppealClick} disabled={status !== "not appealed"}>{appeal_status} </Button>
        </div>
      </div>
      {appeal_status === "appealed" && <div className="appeal-result">
        <AppealResult status={appeal_result_status} reason={reason} title={title} />
      </div>}
    </div>
  )
}

const AppealResult = (props) => {
  const { status, reason, appeal_review_update_time } = props
  const [text, setText] = useState({ "title": "", "body": "" })

  useEffect(() => {
    if (status === "pending") {
      setText({ "title": "Review in progress", "body": "We will get back to you with a decision within one week. Please do not delete this content while we review it." })
    } else if (reason in policyRejectMap) {
      setText({ "title": "Appeal rejected 🚫", "body": "After careful review, our team has decided that your content violated our Content Policy. Strikes will be removed after 90 days as long as your account remains in good standing and does not receive additional strikes." })
    } else {
      setText({ "title": "Appeal approved ✅", "body": "Your appeal was accepted and your strike has been removed." })
    }
  }, [])

  return (
    <div className="appeal-result">
      <div className="appeal-result-title"> {text.title}
        <span className="strike-update-time"> {appeal_review_update_time} </span>
      </div>
      <div className="appeal-result-text"> {text.body}</div>
    </div>
  )
}

export default compose(
  withAuth,
  withQuery,
  connect(
    null,
    { getStrikeStatuses }
  )
)(Strikes)