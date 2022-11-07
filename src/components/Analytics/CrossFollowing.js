import React from 'react'
import { ReactComponent as IconLocation } from '@/asset/svg/location-icon.svg'
import styles from './CrossFollowing.module.scss'

const CrossFollowing = ({ data, location }) => {
  const { creator, non_creator } = data
  // sample a few from contributors as well as non-creators
  const creatorList = creator ? Object.entries(creator) : []
  const publisherList = non_creator ? Object.entries(non_creator) : []
  const cutoff = publisherList.length >= 3 ? 3 : (6 - publisherList.length)
  const follows = creatorList.slice(0, cutoff).concat(publisherList).slice(0, 6)

  return <div className={styles['cross-following']}>
    <div className="section-title-lg">Other local accounts your viewers follow</div>
    <div className={styles['time-line']}>
      Last week &nbsp; {location ? <><IconLocation /> {location}</> : null}
    </div>
    {follows.length > 0 ?
      <div className={styles['follow-list']}>
        {follows.map((entry) => {
          const mediaId = entry[0]
          const { icon, name, about, follower_count } = entry[1]
          const desc = about && about.length <= 70 ? about : (about.substr(0, 70) + '...')
          const count = follower_count < 1000 ? follower_count : (Math.floor(follower_count / 100) / 10 + 'k')
          return <a
            className={styles['follow-item']}
            key={mediaId}
            href={'https://www.newsbreak.com/@c/' + mediaId}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img className={styles['icon']} src={icon} alt={name} />
            <div className={styles['profile']}>
              <div className={styles['follower-count']}>{count} followers</div>
              <div className={styles['name']}>{name}</div>
              <div className={styles['about']}>{desc}</div>
            </div>
          </a>
        })}
      </div> : <div className={styles['no-data']}>
        Not enough audience data to show this information
      </div>
    }
  </div>
}

export default CrossFollowing
