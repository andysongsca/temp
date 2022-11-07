import React from 'react'
import {Spin} from 'antd'
import './Loading.scss'

class Loading extends React.Component {
  render() {
    return (
      <div className="loading">
        <Spin size="large" />
      </div>
    )
  }
}
export default Loading
