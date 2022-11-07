import React from 'react'
import styles from './LocationStats.module.scss'

const LocationStats = ({ data }) => {
  const locations = data ? Object.keys(data).sort((a, b) => {
    if (a === 'Others') {
      return 1
    }
    if (b === 'Others') {
      return -1
    }
    return data[a] > data[b] ? -1 : 1
  }) : null

  return <div className={styles['location-stats']}>
    <div className="section-title-lg">Your viewers' locations</div>
    <div className={styles['time-line']}>Last week</div>

    {locations ?
      <div className={styles.locations}>
        {locations.map((loc) => {
          const valueStr = parseInt(data[loc] * 1000) / 10 + '%'
          return <div className={styles['location-item']} key={loc}>
            <div className={styles['bar-container']}>
              <div className={styles.bar} style={{ width: valueStr }} />
            </div>
            <div className={styles.value}>{valueStr}</div>
            <div className={styles.name}>{loc}</div>
          </div>
        })}
      </div> :
      <div className={styles['no-data']}>
        Not enough audience data to show this information
      </div>
    }
  </div>
}

export default LocationStats