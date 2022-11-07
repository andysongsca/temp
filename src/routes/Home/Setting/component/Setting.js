import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { Skeleton, Button, Tag } from 'antd'
import { result } from 'underscore'

import { fetchMediaInfo, fetchRssStatus } from 'redux/setting'
import logEvent from 'utils/logEvent'
import api from 'utils/api'
import { handleCopy, monetizationApplicationMap } from 'utils/utilities'
import { Tooltip } from 'components/utils'
import { BadgeList, BadgeTooltip } from './Badges'

import { ReactComponent as IconLink } from 'asset/svg/icon-link-pink.svg'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import './Setting.scss'

const rssStatusMap = {
  "approved": "Verified",
  "verified": "Verified",
  "pending": "Pending",
  "declined": "Declined",
}

const Setting = (props) => {
  const { media, fetched, self, rss_status } = props
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    logEvent('page_visit_start', { page: 'profile' })
    props.fetchMediaInfo()
    props.fetchRssStatus()
    return () => logEvent('page_visit_end', { page: 'profile' })
  }, [])

  if (!self || !self.media_id) {
    return null
  }

  const { icon, first_name = '', last_name = '', company_name = '', mediaType,
    website = '', location = null, account, description = '', bio_tagline_new = '', rss = [], certifications_badges = [], badges = [] } = media
  const { media_id, is_creator, creator_info, phone_number, email, username, monetization_application } = self
  const links = rss !== '' ? rss : []
  const hasRss = is_creator ? Object.keys(rss_status).length > 0 : links.length > 0
  const source = creator_info && creator_info.source
  const isSourceOpen = source === "open registration"
  const phoneNeeded = phone_number !== '1(111)-1111'

  const handleTipaltiSettings = () => {
    const params = {
      "first": encodeURIComponent(first_name),
      "last": encodeURIComponent(last_name),
      "email": encodeURIComponent(email || username)
    }
    api.post('/setting/payment_settings', {
      params,
    }).then(({ data }) => {
      if (!data.startsWith("https:")) {
        // display error
      } else {
        window.open(data)
      }
    })
  }

  const handleTipaltiHistory = () => {
    api.post('/setting/payment_history', null).then(({ data }) => {
      if (!data.startsWith("https:")) {
        // display error
      } else {
        window.open(data)
      }
    })
  }

  const handleResetCopyLink = () => {
    setTimeout(() => setLinkCopied(false), 200)
  }

  const profileUrl = "https://www.newsbreak.com/@c/" + media_id
  // "?s=01" is for tracking icon wiget clicks
  const trackingProfileUrl = profileUrl + "?s=01"

  const handleCopyProfileLink = () => {
    handleCopy(trackingProfileUrl)
    logEvent('profile-settings-profile-url-copied')
    setLinkCopied(true)
  }

  return (
    <div className="setting">
      <div className="setting-section">
        <Skeleton loading={!fetched} paragraph={{ rows: 8 }}>
          <div className="edit">
            <Link to="setting-edit">
              <img alt="" src={require("asset/img/setting-edit.png")} />
              <span>Edit</span>
            </Link>
          </div>

          <div className="account-info">

            <a href={profileUrl} rel="noopener noreferrer" target="_blank">
              <div className="avator" style={{
                backgroundImage: `url(${icon})`,
              }} />
              <div className="account">{account}</div>

            </a>
            {location && location !== 'N/A' &&
              <div className="location">
                <img alt="" src={require("asset/img/location.png")} />
                <span>{location}</span>
              </div>
            }
            <div className="span-row" />
            <div className="span-row" />
            <div className="setting-row">
              <label className="key">Bio Tagline</label>
              <span className="value">
                {bio_tagline_new}
              </span>
            </div>
            <div className="span-row" />
            <div className="setting-row">
              <label className="key">Bio</label>
              <span className="value">
                {description}
              </span>
            </div>
          </div>
          <div className="user-info">
            <div className="setting-row">
              <label className="key">Name</label>
              <span className="value">
                {(first_name) + " " + (last_name)}
              </span>
            </div>
            <div className="setting-row">
              <label className="key">Profile URL</label>
              <span className="value">
                <div className="profile-url">
                  <a href={trackingProfileUrl} rel="noopener noreferrer" target="_blank">{trackingProfileUrl}</a>
                  <span className="copy-link" title="copy link" onClick={handleCopyProfileLink} onMouseLeave={handleResetCopyLink}>
                    <Tooltip
                      autoWidth={true}
                      title={linkCopied ? 'Link copied. Use Ctrl+V to paste and share' : 'Click to copy link'}
                    >
                      <IconLink />
                    </Tooltip>
                  </span>
                </div>
              </span>
            </div>
            {website &&
              <div className="setting-row">
                <label className="key">Website</label>
                <span className="value">
                  {website}
                </span>
              </div>
            }
            {mediaType === 1 && <div className="setting-row">
              <label className="key">Company Name</label>
              <span className="value">
                {company_name}
              </span>
            </div>}
            <div className="setting-row">
              <label className="key">User Account</label>
              <span className="value">
                {result(self, "media_role", 0) !== 10 ? result(self, "username", "") : result(self, "email", "")}
              </span>
            </div>
            {isSourceOpen && phoneNeeded && phone_number && <div className="setting-row">
              <label className="key">Phone Number</label>
              <span className="value">
                +{phone_number}
              </span>
            </div>}
            {!isSourceOpen && hasRss && <div className="setting-row">
              <label className="key">
                RSS Links
                <Tooltip
                  placement="bottom"
                  title={(
                    <div>
                      RSS stands for Really Simple Syndication. It helps you easily and automatically distribute your contents on a different platform, to reach a wider audience. With your permission, our RSS feed reader will periodically check your RSS and generate articles for you based on it
                    </div>
                  )}
                >
                  <IconInfo />
                </Tooltip>
              </label>
              <ul className="value">
                {is_creator ? Object.keys(rss_status).map((key) =>
                  <div>
                    <li>{key}
                      <Tag className={rss_status[key]}>{rssStatusMap[rss_status[key]]}</Tag>
                    </li>
                  </div>
                ) : links.map(
                  (link) =>
                    <li key={link.toString()}>
                      {link}
                    </li>
                )}
              </ul>
            </div>}
            {is_creator && <div className="setting-row badges">
              <label className="key">
                Earned Badges
                <BadgeTooltip />
              </label>

              <BadgeList data={{ certifications_badges, badges }} />
            </div>}
          </div>
        </Skeleton>
      </div>

      {is_creator && (monetization_application === monetizationApplicationMap.Approved ||
        monetization_application === monetizationApplicationMap.Not_Applicable ||
        monetization_application === monetizationApplicationMap.Applied) && <div className="setting-section payment">
          <div className="setting-row">
            <label className="key">
              Payment
              <Tooltip
                placement="bottom"
                title={<span>NewsBreak partners with <a href="https://tipalti.com/" target="_blank" rel="noopener noreferrer">Tipalti</a> to
                  offer contributors secure payments. We value your privacy and trust so your financial information is never stored
                  within NewsBreak’s systems and is sent directly to Tipalti’s certified secure platform. Learn more about
                  Tipalti’s data and privacy protection <a href="https://tipalti.com/product/platform/cloud/" target="_blank"
                    rel="noopener noreferrer">here</a></span>}
              >
                <IconInfo />
              </Tooltip>
            </label>
            <Button type="primary" className="Button" onClick={handleTipaltiSettings}>Payment settings via Tipalti</Button>
            <Button className="Button Button-Light right_button" onClick={handleTipaltiHistory}>Payment history via Tipalti</Button>
          </div>
        </div>}

      <div className="support">
        <img src={require("asset/img/support.png")} alt="" />
        <label>Support contact:</label>
        {is_creator ?
          <a href="mailto:creators.support@newsbreak.com">creators.support@newsbreak.com</a> :
          <a href="mailto:mp.support@newsbreak.com">mp.support@newsbreak.com</a>
        }
      </div>
    </div>
  )
}

export default connect(
  ({ setting, login }) => ({ ...setting, ...login }),
  { fetchMediaInfo, fetchRssStatus },
)(Setting)
