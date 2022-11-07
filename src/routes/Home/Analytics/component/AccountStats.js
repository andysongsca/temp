import React, { useState, useEffect } from 'react'
import { result } from 'underscore'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import cx from 'classnames'
import { Table } from 'antd'
import dateFormat from 'dateformat'
import { connect } from 'react-redux'
import { compose } from 'redux'

import { fetchDailyStats } from 'redux/stats'
import { formatStats, formatNumber } from 'utils/utilities'
import { totals, createTotals } from './StatsConfig'
import withAuth from 'hocs/withAuth'
import { MEDIA_TYPE_NEWSLETTER } from '@/constant/content'

echarts.use([TooltipComponent, LegendComponent, LineChart, GridComponent, CanvasRenderer])

const createTableColumns = mediaType => {
  return [
    {
      title: <img src={require('asset/img/date@2x.png')} width={18} alt="" />,
      dataIndex: 't_date',
      align: 'center'
    },
    {
      title: mediaType === MEDIA_TYPE_NEWSLETTER ? 'Sent' : 'Impressions',
      dataIndex: 't_impression',
      align: 'center'
    },
    {
      title: mediaType === MEDIA_TYPE_NEWSLETTER ? 'Opened' : 'Page Views',
      dataIndex: 't_page_view',
      align: 'center'
    },
    {
      title: 'Shares',
      dataIndex: 't_share',
      align: 'center'
    },
    {
      title: 'Unique Visitors',
      dataIndex: 't_unique_visitor',
      align: 'center'
    },
    {
      title: 'Likes',
      dataIndex: 't_thumb_up',
      align: 'center',
    },
    {
      title: 'Comments',
      dataIndex: 't_comment',
      align: 'center'
    }
  ]
}

const default_data = Object.assign({ c_date: 'Today' }, ...totals.map(({ key }) => ({ [key]: 0 })))

const tooltipTextStyle = {
  color: '#656565',
  fontSize: 12,
  fontFamily: 'Roboto',
}

const AccountStats = (props) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [last30Days, setLast30Days] = useState(false)

  useEffect(() => {
    if (props.daily.fetched === undefined) {
      props.fetchDailyStats()
    }
  }, [])

  if (!props.self) {
    return null
  }

  const Total = ({ num, index, text }) => {
    let numStr
    if (num === '-') {
      numStr = { original: '', short: num }
    } else {
      numStr = formatStats(num)
    }
    return (
      <div
        className={cx("total", activeIndex === index && "active")}
        onClick={() => setActiveIndex(index)}
      >
        <h2 title={numStr.original}>{numStr.short}</h2>
        <div className="total-icon">
          <span>{text}</span>
        </div>
      </div>
    )
  }

  const Filters = () => <div className="filters">
    <div className={cx(last30Days && "selected")} onClick={() => setLast30Days(true)}>Last 30 days</div>
    <div className={cx(!last30Days && "selected")} onClick={() => setLast30Days(false)}>More</div>
  </div>

  const getPVOptions = (stats) => {
    let sdata = stats.length === 0 ? [default_data] : stats

    return {
      xAxis: {
        axisLine: {
          lineStyle: { color: "#656565", width: 2, }
        },
        data: sdata.map(({ c_date }) => c_date),
      },
      yAxis: {
        axisLine: {
          show: false,
          lineStyle: { color: "#c8c8c8", }
        },
        splitLine: {
          lineStyle: { type: "doted", color: "#c8c8c8", },
        },
      },
      color: ['#FF5A5A', '#656565', '#8C98FF', '#60B304', '#FF9900'],
      legend: {
        orient: 'horizontal',
        bottom: 0,
        left: 'center',
        itemWidth: 16,
        itemHeight: 16,
        itemGap: 15,
        icon: 'path://M1 0C0.447715 0 0 0.447715 0 1V15C0 15.5523 0.447715 16 1 16H15C15.5523 16 16 15.5523 16 15V1C16 0.447715 15.5523 0 15 0H1ZM3.96967 7.96969C4.26256 7.6768 4.73744 7.6768 5.03033 7.96969L6.9496 9.88896L11.4238 4.51988C11.689 4.20167 12.1619 4.15868 12.4801 4.42385C12.7983 4.68903 12.8413 5.16195 12.5762 5.48016L7.57617 11.4802C7.29383 11.819 6.78152 11.8422 6.46967 11.5303L3.96967 9.03035C3.67678 8.73746 3.67678 8.26258 3.96967 7.96969Z',
        tooltip: {
          show: true,
          position: 'bottom',
          textStyle: tooltipTextStyle,
          formatter: (item) => {
            switch (item.name) {
              case 'In-app views':
                return 'Your views from the NewsBreak app'
              case 'Total web views':
                return 'Your combined web views from<br />search, share and other'
              case 'Web search views':
                return 'Your views for your Newsbreak.com<br />content coming from web searches'
              case 'Web share views':
                return 'Your views from shares on <br /> social media sites'
              case 'Other views':
                return 'Your views from all other web traffic<br />that aren’t included in search or share'
              default:
                return ''
            }
          }
        },
        data: ['In-app views', 'Total web views', 'Web search views', 'Web share views', 'Other views'],
      },
      tooltip: {
        trigger: 'axis',
        textStyle: tooltipTextStyle,
      },
      series: [
        {
          name: 'In-app views',
          type: 'line',
          symbol: 'rect',
          data: sdata.map((d) => d['in_app_page_view']),
          lineStyle: { color: '#FF5A5A' }
        },
        {
          name: 'Total web views',
          type: 'line',
          symbol: 'rect',
          data: sdata.map((d) => d['web_search_page_view'] + d['web_share_page_view'] + d['web_other_page_view']),
          lineStyle: { color: '#656565' }
        },
        {
          name: 'Web search views',
          type: 'line',
          symbol: 'rect',
          data: sdata.map((d) => d['web_search_page_view']),
          lineStyle: { color: '#8C98FF' }
        },
        {
          name: 'Web share views',
          type: 'line',
          symbol: 'rect',
          data: sdata.map((d) => d['web_share_page_view']),
          lineStyle: { color: '#60B304' }
        },
        {
          name: 'Other views',
          type: 'line',
          symbol: 'rect',
          data: sdata.map((d) => d['web_other_page_view']),
          lineStyle: { color: '#FF9900' }
        },
      ]
    }
  }

  const getOptions = (stats) => {
    const active = totals[activeIndex].key
    let sdata = stats.length === 0 ? [default_data] : stats
    return {
      color: ['#FF5A5A'],
      xAxis: {
        axisLine: {
          lineStyle: { color: "#656565", width: 2, }
        },
        data: sdata.map(({ c_date }) => c_date),
      },
      yAxis: {
        axisLine: {
          show: false,
          lineStyle: { color: "#c8c8c8", }
        },
        splitLine: {
          lineStyle: { type: "doted", color: "#c8c8c8", },
        },
      },
      tooltip: {
        trigger: 'axis',
        textStyle: tooltipTextStyle,
      },
      series: [{
        type: "line",
        symbol: 'circle',
        data: sdata.map(({ [active]: v }) => v),
        name: "Total " + active + "s"
      }],
    }
  }

  const calculateTotal = (stats) => {
    const res = Object.assign({}, ...totals.map(({ key }) => ({ [key]: 0 })))
    stats.forEach((e) => {
      // e.date return dates in format "2020/12/10", when converting to Date
      // it will convert to local timezone
      // Append the timezone info to the original date so the stats date stay consistent
      const date = new Date(e.date + "T00:00:00")
      e['c_date'] = dateFormat(date, 'mmmm dS')
      e['t_date'] = dateFormat(date, 'mm/dd/yyyy')
      e['t_impression'] = formatNumber(e.impression)
      e['t_page_view'] = formatNumber(e.page_view)
      e['t_share'] = formatNumber(e.share)
      e['t_unique_visitor'] = formatNumber(e.unique_visitor)
      // e['t_follower'] = formatNumber(e.follower)
      e['t_thumb_up'] = formatNumber(e.thumb_up)
      e['t_comment'] = formatNumber(e.comment)
      Object.keys(res).forEach((i) => {
        res[i] += e[i]
      })
    })
    return res
  }

  const { daily: { fetched, data }, self: { is_creator, mediaType } } = props
  let startDate = "2021-01-01";
  if (last30Days) {
    let thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    startDate = dateFormat(thirtyDaysAgo, 'yyyy-mm-dd');
  }
  const statsData = data ? data.filter(d => d.date >= startDate) : []
  const total = calculateTotal(statsData)

  return (
    <div className="section stats-content">
      <h2>Analytics</h2>

      <div className="chart-tips">
        <span >Click columns below to view in charts</span>
        <Filters />
      </div>
      <div className="totals"> {
        createTotals(mediaType).map(({ icon, title, key }, index) => [
          index > 0 && <div className="sep" key={"sep-" + index} />,
          <Total icon={icon} text={title} num={result(total, key, "-")}
            index={index} key={index} />
        ])
      }
      </div>

      {fetched && <>
        <div style={{ position: 'relative', width: '100%', height: 300 }}>
          {activeIndex === 1 && <ReactEChartsCore
            echarts={echarts}
            style={{ width: 'calc(100% + 100px)', position: 'absolute', left: -25 }}
            option={is_creator ? getPVOptions(statsData) : getOptions(statsData)}
          />}
          {activeIndex !== 1 && <ReactEChartsCore
            echarts={echarts}
            style={{ width: 'calc(100% + 100px)', height: 320, position: 'absolute', left: -25 }}
            option={getOptions(statsData)}
          />}
        </div>

        {!is_creator && <Table
          pagination={true}
          bordered={true}
          dataSource={statsData.reverse()}
          columns={createTableColumns(mediaType)}
          rowKey={r => r.t_date}
        />}
      </>}
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    ({ stats: { daily } }) => ({ daily }),
    { fetchDailyStats },
  )
)(AccountStats)
