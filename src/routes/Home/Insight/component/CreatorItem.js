import React from 'react'
import { ReactComponent as IconLocation } from 'asset/svg/location-icon.svg'
import { ReactComponent as IconArticle } from 'asset/svg/creator-article.svg'

import './CreatorItem.scss'

const CreatorItem = (props) => {
  const { media_name, icon, location, articles, profile } = props

  const handleDetail = (url) => {
    window.open(url, '_blank')
  }

  return (
    <div className="creator-item" onClick={() => handleDetail(profile)}>
      <div className="creator-item-content">
        <div className="creator-item-avatar">
          <img src={icon} alt="" className="creator-image" />
          <div className="creator-info">
            <span className="creator-info-name">{media_name}</span>
            <div className="creator-info-location">
              <IconLocation className="creator-info-location-icon" />
              <span className="creator-info-text">{location}</span>
            </div>
          </div>
        </div>
        <IconArticle className="creator-article-icon" />
        <div className="creator-item-article">
          <span className="creator-article-info">Top articles</span>
          {articles.map((p, i) => <div className="creator-article-title" key={p.url} onClick={() => handleDetail(p.url)}><span>{i + 1}. {p.title}</span></div>)}
        </div>
      </div>
    </div>
  )
}
export default CreatorItem
