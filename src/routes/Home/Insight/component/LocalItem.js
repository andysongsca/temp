import React from 'react'
import dateFormat from 'dateformat'
import { ReactComponent as IconLocation } from 'asset/svg/location-icon.svg'
import { topicAttrs } from 'utils/utilities'

import './LocalItem.scss'

const LocalItem = (props) => {
  const { docid, date, title, source, image, topics, displayTag } = props

  const renderTopic = (topic) => {
    if (topicAttrs[topic] !== undefined) {
      const { color, title } = topicAttrs[topic]
      return <span key={title} className={`ant-tag ${color}-tag`}>{title}</span>
    }
  }

  const handleDetail = (loc) => {
    window.open(loc, '_blank')
  }

  const imageUrl = image !== undefined
    ? "https://img.particlenews.com/img/id/" + image + "?type=webp_512x512" : require('asset/img/insight-no-image.png')
  const url = "https://www.newsbreakapp.com/m/articles/" + docid

  return (
    <div className="info-item" onClick={() => handleDetail(url)}>
      <div className="info-item-content">
        <div className="info-item-left">
          <img src={imageUrl} alt="" />
          <div className="info-source">{source}</div>
        </div>
        <div className="info-item-right">
          <div className="info-item-line">
            {topics.map(p => renderTopic(p))}
          </div>
          <h3>{title}</h3>
          <div className="info-item-line">
            <span>{dateFormat(new Date(date), 'm/d/yyyy HH:MM')}</span>
            {displayTag && <>
              <IconLocation className="info-item-location-icon" />
              <span>{displayTag}</span>
            </>}
          </div>
        </div>
      </div>
    </div>
  )
}
export default LocalItem
