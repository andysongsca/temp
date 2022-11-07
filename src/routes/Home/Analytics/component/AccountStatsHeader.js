import React, { useEffect, useMemo } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { result } from 'underscore'

import { ReactComponent as IconImpressions } from 'asset/svg/impressions.svg'
import { ReactComponent as IconPV } from 'asset/svg/pg.svg'
import { ReactComponent as IconFollow } from 'asset/svg/follower.svg'
import { ReactComponent as IconViews } from 'asset/svg/view.svg'
import { ReactComponent as IconFollowers } from 'asset/svg/person.svg'
import { fetchOverallStats, fetchFollowerStats, fetchSubscriberStats } from 'redux/stats'
import { formatStats } from 'utils/utilities'
import withAuth from 'hocs/withAuth'

import './StatsHeader.scss'
import { MEDIA_TYPE_NEWSLETTER } from '@/constant/content'

const AccountStatsHeader = (props) => {
  const { overall: { data }, follower, subscribers, self } = props

  if (Object.keys(follower).length > 0 && follower.hasOwnProperty('fetched') && follower["fetched"]) {
    data.follower = follower.data
  }

  useEffect(() => {
    if (props.overall.fetched === undefined) {
      props.fetchOverallStats()
    }
    if (self.mediaType !== MEDIA_TYPE_NEWSLETTER && props.follower.fetched === undefined) {
      props.fetchFollowerStats()
    }
    if (self.mediaType === MEDIA_TYPE_NEWSLETTER && props.subscribers.fetched === undefined) {
      props.fetchSubscriberStats()
    }
  }, [])

  if (!self) {
    return null
  }

  const { is_creator, should_show_earning, policy, mediaType } = self
  const showTotalEarnings = should_show_earning && policy && policy.payment_version >= policy.latest_payment_v

  const statsArray = useMemo(() => {
    if (mediaType === MEDIA_TYPE_NEWSLETTER) {
      return [
        {
          icon: <IconImpressions />,
          title: 'Total Sent',
          key: 'impression'
        },
        {
          icon: <IconPV />,
          title: 'Total Opened',
          key: 'page_view'
        },
        {
          icon: <IconFollow />,
          title: 'Subscribers',
          key: 'subscribers'
        }
      ]
    }

    if (is_creator) {
      return [
        {
          icon: <IconViews />,
          title: 'Total page views',
          key: 'page_view'
        },
        {
          icon: <IconFollowers />,
          title: 'Total followers',
          key: 'follower'
        }
      ]
    }

    return [
      {
        icon: <IconImpressions />,
        title: 'Total Impressions',
        key: 'impression'
      },
      {
        icon: <IconPV />,
        title: 'Total Page Views',
        key: 'page_view'
      },
      {
        icon: <IconFollow />,
        title: 'Followers',
        key: 'follower'
      }
    ]
  }, [is_creator, mediaType])

  const dataObj = useMemo(() => {
    if (mediaType === MEDIA_TYPE_NEWSLETTER && subscribers) {
      return { ...data, subscribers: subscribers.data || 0 }
    }
    return data
  }, [data, mediaType, subscribers])

  const Item = ({ icon, text, num }) => {
    let numStr
    if (num === '-') {
      numStr = { original: '', short: num }
    } else {
      numStr = formatStats(num)
    }

    return (
      <div className="stats-header-item">
        {icon}
        <div className="stats-header-item-num">
          <span>{text}</span>
          <div title={numStr.original} className="number">{numStr.short}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="stats-header">
      {statsArray.map(({ icon, title, key }) => {
        if (showTotalEarnings || key !== 'total_earning') {
          return <Item
            icon={icon}
            text={title}
            num={result(dataObj, key, "-")}
            key={key}
          />
        }
        return null
      })}
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    ({ stats: { overall, follower, subscribers } }) => ({ overall, follower, subscribers }),
    { fetchOverallStats, fetchFollowerStats, fetchSubscriberStats },
  )
)(AccountStatsHeader)
