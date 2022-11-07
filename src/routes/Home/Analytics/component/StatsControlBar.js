import React, { useState } from 'react'
import { Button } from 'antd'

export default function StatsControlBar(props) {
  const [dateRange, setDateRange] = useState(props.timeRange)
  const selectors = [
    { title: 'All', value: 'all' },
    { title: 'Today', value: 'today' },
    { title: 'Last 7 days', value: '7days' },
  ]
  const dateTitle = selectors.find(({ value }) => value === dateRange).title

  const onSelectTime = (range) => {
    let from, to = new Date()
    switch (range) {
      case 'today':
        from = new Date(to.toLocaleDateString())
        break
      case '7days':
        from = new Date(to.getTime() - 7 * 86400000)
        from = new Date(from.toLocaleDateString())
        break
      case 'all':
      default:
        from = new Date(0)
        break
    }

    from = parseInt(from.getTime() / 1000)
    to = parseInt(to.getTime() / 1000)
    props.selectTimeRange({ value: range, from, to })
    setDateRange(range)
  }

  const generateDateString = () => {
    switch (dateRange) {
      case 'all':
        return 'All time'
      case 'today':
        return (new Date()).toLocaleDateString()
      case '7days':
        const now = new Date()
        const from = new Date(now.getTime() - 7 * 86400000)
        return (from.toLocaleDateString() + ' to ' + now.toLocaleDateString())
      default:
        return ''
    }
  }

  return (
    <div className="stats-control-bar">
      <h1 className="date-title">{dateTitle}</h1>
      <div className="date-string">({generateDateString()})</div>
      <div className="date-selectors">
        {selectors.map(({ title, value }) => <Button
          className={dateRange === value ? 'selected' : ''}
          onClick={() => onSelectTime(value)}
          key={value}>
          {title}
        </Button>)}
      </div>
    </div>
  )
}
