import React from 'react'
import { Input, Spin } from 'antd'
import api from 'utils/api'
import cx from 'classnames'

import './Selector.scss'

const maxSearchItems = 4

class Selector extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchs: [],
      searching: false,
    }
    this.searchInputRef = React.createRef()
  }
  onChange = async (e) => {
    const { value } = e.target
    if (value.toLowerCase() === "n/a") {
      this.setState({
        searchs:
          [{ "key": "N/A", "value": "N/A" }]
      })
    }
    else if (value.length >= 3) {
      const url = `/geotag/service/local?word=${value}`
      this.setState({ searching: true })
      const { data } = await api.get(url)
      this.setState({ searching: false })
      const currentValue = this.searchInputRef.current.input.value
      if (data.code === 0 && value === currentValue) {
        const searchs = data.channels.map(({ key, value }) => ({
          key,
          value,
        }))
        this.setState({
          searchs,
        })
      }
    } else {
      this.setState({
        searchs: [],
      })
    }
  }
  render() {
    const { hideIcon, changeText, selected, onSelect } = this.props
    const { searchs, searching } = this.state
    const height = Math.min(maxSearchItems, this.state.searchs.length + 1) * 38
    const exactMax = searchs.length === maxSearchItems
    return (
      <div className="location-select">
        {selected ? (
          <div className="selected-box box">
            <div className="location">
              {!hideIcon && <img alt="" src={require("asset/img/location.png")} />}
              <span>{selected}</span>
              <button type="primary" shape="round"
                className="change-btn"
                onClick={() => {
                  onSelect(null);
                  this.setState({ searchs: [] })
                }}>{changeText || 'Change'}</button>
            </div>
          </div>
        ) : (
          <div className="search-box box">
            <Input
              ref={this.searchInputRef}
              placeholder='Enter city name or zip code'
              onChange={this.onChange}
              prefix={searching ? <Spin size="small" /> : <img alt="" src={require("asset/img/search.png")} />} />
            <div className={cx("search-result-parent", { "exact-max": exactMax }, { "not-empty": searchs.length > 0 })}>
              <div className="search-result" style={{
                height: height,
              }}>
                {searchs.map(({ key, value }, index) => (
                  <div key={index} className="search-item location"
                    onClick={() => onSelect(value)}>

                    <img alt="" src={require("asset/img/location.png")} />
                    <span>{value}</span>
                  </div>
                ))}
                {
                  searchs.length !== maxSearchItems &&
                  <div className="search-item last-item" />
                }
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}
export default Selector
