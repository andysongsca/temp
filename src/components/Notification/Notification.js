import React from 'react'
import ReactDOM from 'react-dom'
import cx from 'classnames'
import './Notification.scss'

let idx = 0

class Notification extends React.Component {
  constructor(props) {
    super(props)
    const {visible} = props

    this.state = {
      visible,
      hidding: false
    }
  }

  componentWillReceiveProps(props) {
    const {visible} = this.state
    if (props.visible === false && visible === true) {
      this.hide()
    }
  }

  componentDidMount() {
    const {duration = 2000} = this.props
    if (typeof duration === 'number') {
      setTimeout(this.hide, duration)
    }
  }

  componentWillUnmount() {
    this._unmounted = true
  }

  hide = () => {
    if (this._unmounted) return
    
    this.setState({
      hidding: true
    })

    setTimeout(() => {
      this.setState({
        visible: false,
        hidding: false
      })
    }, 300)
  }

  render() {
    const {visible, hidding, idx} = this.state
    const {type, content} = this.props

    if (!visible) {
      return null
    }

    return (
      <div 
        key={idx} 
        className={cx(
          'Notification', 
          type && `Notification-${type}`, 
          hidding && 'Notification-hidding'
        )}
      >
        {content}
      </div>
    )
  }
}

export const notification = (content, type, duration) => {
  // if (type === 'error' && duration === undefined) {
  //   duration = null
  // }

  let visible = true
  if (content === null || content === undefined) {
    visible = false
  } else {
    idx += 1
  }

  ReactDOM.render(
    <Notification
      key={idx}
      visible={visible}
      content={content}
      type={type}
      duration={duration}
    />,
    document.getElementById('notification')
  )
}

const createNotificationFunc = type => {
  return (content, duration) => {
    notification(content, type, duration)
  }
}

notification.success = createNotificationFunc('success')
notification.error = createNotificationFunc('error')
notification.hide = () => notification()

export default Notification