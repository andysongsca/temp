import React, { useCallback, useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { Tabs, Pagination, Button, Select, Empty } from 'antd'
import logEvent from 'utils/logEvent'
import api from 'utils/api'
import { uniq } from 'underscore'
import { fetchLocalInfo } from 'redux/insight'
import Loading from 'components/utils/Loading'
import Tooltip from 'components/utils/Tooltip'
import LocalItem from './LocalItem'

import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import { ReactComponent as IconLocation } from 'asset/svg/location-icon-black.svg'

const TabPane = Tabs.TabPane

const tabs = [
  { key: 'All', title: 'All' },
  { key: 'business', title: 'Business' },
  { key: 'education', title: 'Education' },
  { key: 'lifestyle', title: 'Lifestyle' },
  { key: 'election', title: 'Politics' },
  { key: 'sports', title: 'Sports' },
  { key: 'weather', title: 'Weather' },
  { key: 'safety', title: 'Safety' },
  { key: 'traffic', title: 'Traffic' },
]

const baseLocationSelectOptions = [
  { label: 'Bay Area', value: 'San Francisco, CA' },
  { label: 'New York City', value: 'New York City, NY' },
  { label: 'Miami', value: 'Miami, FL' },
  { label: 'Tampa', value: 'Tampa, FL' }
]

const LocalInfo = ({
  localInfo,
  userLocation
}) => {
  const PAGE_SIZE = 10
  const TOTAL_CONTENT = 50

  const dispatch = useDispatch()
  const [tab, setTab] = useState("All")
  const [pageNumber, setPageNumber] = useState(0)
  const [locationCity, setLocationCity] = useState((userLocation && userLocation !== 'N/A') ? userLocation : "San Francisco, CA")
  const locationSelectOptions = uniq(
    [
      { label: locationCity, value: locationCity },
      ...baseLocationSelectOptions,
    ],
    item => item.value,
  )

  useEffect(() => {
    async function loadData() {
      const url = `/geotag/service/local?word=${locationCity}`
      const { data } = await api.get(url)

      if (data.channels.length) {
        const params = { client: 'local', zip: data.channels[0].subValues[0], start: pageNumber, count: PAGE_SIZE }

        if (tab !== "All") {
          params.facet = tab
        }

        dispatch(fetchLocalInfo(params))
      }
    }
    loadData();
  }, [tab, pageNumber, locationCity])

  const handleTabChange = (key) => {
    logEvent('insight_tab_selected', { page: key })
    setTab(key)
    setPageNumber(0)
  }

  const handlePageChange = (page) => {
    setPageNumber((page - 1) * PAGE_SIZE)
  }

  const handleLocationChange = useCallback(newSelectedCity => {
    setLocationCity(newSelectedCity);
  }, []);

  return (
    <div className="insight-container insight-content">
      <div className="local-header">
        <div className='title-wrap'>
          <div>Local Trending Content</div>
          <Tooltip
            title="Local trending content features stories that are performing well across different topics with local users in the NewsBreak app."
            placement="rightBottom"
          >
            <IconInfo className="info-item-info-icon"/>
          </Tooltip>
        </div>

        <div className='location-wrap'>
          <IconLocation className="info-item-location-icon" />
          <Select className="location-selector"
            defaultValue={locationSelectOptions[0].value}
            onChange={handleLocationChange}
          >
            {
              locationSelectOptions.map(option => (
                <Select.Option
                  className="selector-option"
                  value={option.value}
                  key={option.value}
                >
                  {option.label}
                </Select.Option>
              ))
            }
          </Select>
        </div>
      </div>

      <Tabs
        defaultActiveKey="All"
        onChange={handleTabChange}
        type="card">
        {tabs.map(({ key, title }) => (
          <TabPane tab={title} key={key}>
            {localInfo && localInfo.fetched ?
              (localInfo.infos.length > 0 ? <div className="local-info">
                {localInfo.infos.map(p => <LocalItem key={p.docid} {...p} />)}
              </div> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{margin: '146px auto'}} />)
              :
              <div className="info-loading"><Loading /></div>}
          </TabPane>
        ))}
      </Tabs>

      <Pagination
        className="local-page"
        defaultCurrent={1}
        current={Math.floor(pageNumber / PAGE_SIZE) + 1}
        pageSize={PAGE_SIZE}
        total={TOTAL_CONTENT}
        onChange={handlePageChange}
        showSizeChanger={false}
      />
    </div>
  )
}
export default connect(
  ({ insight: { localInfo } }) => ({ localInfo }),
  { fetchLocalInfo },
)(LocalInfo)
