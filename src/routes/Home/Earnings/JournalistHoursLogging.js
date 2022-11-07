import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Input, Button, DatePicker, Table } from 'antd'
import logEvent from 'utils/logEvent'
import withAuth from 'hocs/withAuth'
import { fetchJournalistHours, insertJournalistHours } from 'redux/login'

import './JournalistHoursLogging.scss'

const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Hours',
    dataIndex: 'hours',
    key: 'hours',
  },
  {
    title: 'State',
    dataIndex: 'state',
    key: 'state',
  },
];

const status_map = {
  0: "Submitted",
  1: "Approved",
  2: "Rejected"
}

const JournalistHoursLogging = (props) => {
  const { self, fetchJournalistHours, insertJournalistHours} = props
  const [hours, setHours] = useState("")
  const [date, setDate] = useState("")
  const [submitted, setSubmitted] = useState("")
  const [showHourInput, setShowHourInput] = useState(false)
  const [insertError, setInsertError] = useState("")

  useEffect(() => {
    logEvent('page_visit_start', { page: 'monetization' })
    refreshHours()
    return () => {
      logEvent('page_visit_end', { page: 'monetization' })
    }
  }, [])

  const refreshHours = () => {
    fetchJournalistHours(self.media_id).then((res) => {
      if (res.value && res.value.data.code === 0) {
        let value = res.value.data.data
        value.forEach(val => {
          let new_status = status_map[val["status"]]
          val["state"] = new_status
        })
        setSubmitted(value)
      }
    })
  }

  const updateHours = e => {
    setHours(e.target.value)
  }

  const onSubmit = () => {
    if(hours && date) {
      insertJournalistHours(hours, date).then((res) => {
        if (res.value && res.value.data.ret === 0) {
          refreshHours()
        } else {
          setInsertError(res.value.data.ret)
        }
      })
    }
  }

  const onSetDate = (date, dateString) => {
    setDate(dateString)
    setShowHourInput(true)
  }

  return (
    <div className="journalist-hours">
      <div className="title">Ready to log your hours?</div>
      <div className="journalist-datepicker">
        <span>Pick a date:    </span>
        <DatePicker
          onChange={onSetDate}
          format="YYYY-MM-DD"
          showToday={true}
        />
      </div>

      {/* <div> You have input 8 hours for today</div> */}
      {
        showHourInput &&
        <div className="input-area">
          <Input className="hours-text" placeholder={"Number of hours"} onChange={updateHours} />
          <Button key="submit" type="primary" onClick={onSubmit}>Submit</Button>
          {insertError && <span className='error-msg'> You have already submitted the hours for date {date}.</span>}
        </div>}
      <div className="past-submissions">Past submissions and status</div>
      {submitted && <Table className="past-submission-table"
        pagination={true}
        bordered={true}
        dataSource={submitted}
        columns={columns}
      />}
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    ({ login }) => login,
    { fetchJournalistHours, insertJournalistHours }
  ))(JournalistHoursLogging)