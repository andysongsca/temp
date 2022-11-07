import React, { useState, useRef } from 'react'
import { Modal, Input, Button, Radio, Spin, DatePicker } from 'antd'
import moment from 'moment'
import cx from 'classnames'

import api from 'utils/api'
import logEvent from 'utils/logEvent'
import { TagList } from '@/components/Creator'
import { ReactComponent as IconPublish } from 'asset/svg/publish.svg'

import './PublishModal.scss'

const maxSearchItems = 5

export default function PublishModal(props) {
  const {
    onClose,
    onPublish,
    tags,
    selectedLocation,
    selectedLocationPid,
    isEvergreen,
    internal_writer,
    is_journalist,
    schedule_time,
  } = props
  const [mp_tags_manual, setTags] = useState(tags)
  const [searches, setSearches] = useState([])
  const [searching, setSearching] = useState(false)
  const [locationOption, setLocationOption] = useState(1)
  const [location, setLocation] = useState(selectedLocation)
  const [locationPid, setLocationPid] = useState(selectedLocationPid)
  const [newsTypeOption, setNewsTypeOption] = useState(!!isEvergreen ? 1 : 0)
  const [scheduleTime, setScheduleTime] = useState(schedule_time ? moment(new Date(schedule_time)) : null)
  const searchInputRef = useRef(null)
  const height = Math.min(maxSearchItems, searches.length + 1) * 38 + 16

  logEvent('publish_modal_open')

  const onChange = async (e) => {
    const { value } = e.target
    if (value.length >= 3) {
      const url = `/geotag/service/local?word=${value}`
      setSearching(true)
      const { data } = await api.get(url)
      setSearching(false)
      const currentValue = searchInputRef.current.input.value
      if (data.code === 0 && value === currentValue) {
        setSearches(data.channels.map(({ pid, value }) => ({ pid, value })))
      }
    } else {
      setSearches([])
    }
  }

  const onChangeLocationOption = (e) => {
    const { value } = e.target
    setLocationOption(value)
    if (value === 0) {
      setSearches([])
    }
  }

  const onChangeNewsTypeOption = (e) => {
    const { value } = e.target
    setNewsTypeOption(value)
  }

  const onSetSchedule = (val) => {
    if (!val || val.isBefore(new Date())) {
      setScheduleTime(null)
    } else {
      setScheduleTime(val)
    }
  }

  const Scheduler = () => <div className="section">
    <div className="title">Schedule to publish</div>
    <div className="info">Choose a time in the future, or leave it empty to publish now:</div>
    <div className="schedule-time">
      <DatePicker
        showTime={{ minuteStep: 5 }}
        onChange={onSetSchedule}
        format="MM/DD/YYYY h:mm A"
        showToday={false}
        showNow={false}
        value={scheduleTime}
      />
    </div>
  </div>

  return (
    <Modal
      visible={true}
      onCancel={onClose}
      centered
      footer={null}
      width={888}
      wrapClassName="publish-modal"
      bodyStyle={{
        padding: '50px 0 30px 0',
        backgroundImage: `url(${require('asset/img/publish-modal-bg.png')})`,
        backgroundSize: 'contain',
      }}
    >
      <div className="box">
        {Array.isArray(mp_tags_manual) && <div className="section" >
          <div className="title">Add tags most relevant to your post</div>
          <div className="info">Input your tag and press 'Enter' key to add. You may add up to 5 tags per post.</div>
          <TagList
            className="tag-list"
            tags={mp_tags_manual}
            editable={true}
            maxCount={5}
            onChange={setTags}
            validate={(val) => !!val.match(/^[\w\s]+$/)}
          />
        </div>}

        <div className="section" >
          <div className="title">Is your post based on current trends or recent events?</div>
          <Radio.Group onChange={onChangeNewsTypeOption} value={newsTypeOption}>
            <Radio value={0}>Yes, it's relevant and timely!</Radio>
            <Radio value={1}>No, it's timeless!</Radio>
          </Radio.Group>
        </div>

        <div className="search-box section">
          <div className="title">Which location is this post about?</div>
          <div className="info">
            Select the most relevant location (city, county or state) for your post.
          </div>
          <Radio.Group onChange={onChangeLocationOption} value={locationOption}>
            <Radio value={1}>Choose a specific location: </Radio>
            <Radio value={0}>All of the U.S.</Radio>
          </Radio.Group>

          {locationOption === 1 && location && <div className="selected-box">
            <div className="location">
              <img alt="" src={require('asset/img/location.png')} />
              <span>{location}</span>
              <button type="primary" ghost="true" shape="round"
                className="change-btn"
                onClick={() => {
                  setSearches([])
                  setLocation(null)
                }}>Change</button>
            </div>
          </div>}
          {locationOption === 1 && !location && <div className="search-box">
            <Input
              ref={searchInputRef}
              placeholder="Enter location name or zip code"
              onChange={onChange}
              prefix={searching ? <Spin size="small" /> : <img alt="" src={require('asset/img/search.png')} />}
            />
            <div className={cx('search-result-parent', searches.length > 0 && 'not-empty')}>
              <div className="search-result" style={{ height: height }}>
                {searches.map(({ pid, value }) => (
                  <div
                    key={pid}
                    className="search-item location"
                    onClick={() => {
                      setLocation(value)
                      setLocationPid(pid)
                    }}
                  >
                    <img alt="" src={require('asset/img/location.png')} />
                    <span>{value}</span>
                  </div>
                ))}
                {searches.length !== maxSearchItems && <div className="search-item last-item" />}
              </div>
            </div>
          </div>}
        </div>

        {(internal_writer || is_journalist) && <Scheduler />}
      </div>

      <Button
        disabled={!location && locationOption === 1 && searches.length === 0}
        shape="round"
        type="primary"
        className="publish-btn"
        onClick={() => {
          logEvent('publish_button_click', { page: 'publish-modal' })
          onClose()
          onPublish({
            mp_tags_manual,
            location,
            locationPid,
            isEvergreen: newsTypeOption !== 0, // isEvergreen = false if user indicates the article is time sensitive
            schedule_time: scheduleTime ? scheduleTime.valueOf() : null,
          })
        }}
      >
        <IconPublish /> Publish
      </Button>
    </Modal >
  )
}
