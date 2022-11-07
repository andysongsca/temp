import React from 'react'
import { Modal, Button } from 'antd'
import { text as welcomeLetter } from './letters/welcome'
import { text as UserGuide } from './letters/UserGuide'

import './Notification.scss'

const notifies = [{
  title: "Welcome aboard!",
  content: welcomeLetter,
}, {
  title: "How to post your first article and how to do it well ",
  content: UserGuide,
}]

class Notification extends React.Component {
  state = {
    index: 0,
    visible: false,
  }
  render() {
    return (
      <div className="home-notify">
        <Modal
          destroyOnClose={true}
          title={notifies[this.state.index].title}
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          footer={null}
          width={735}
          wrapClassName="notify-box"
        >
          <div className="notify-box-content">{notifies[this.state.index].content}</div>
          <div style={{ textAlign: "center" }}>
            <Button
              onClick={() => this.setState({ visible: false })}
              type="round"
              size="small"
              className="got-it"
              style={{
                width: 103,
                color: "#FF5A5A",
                border: "solid 1px #FF5A5A",
              }}
            >Got It</Button>
          </div>
        </Modal>
        <h3>Notifications</h3>
        {notifies.map(({ title }, index) => (
          <div className="notify-item" key={index}>
            <img src={require("asset/img/email@2x.png")} width={18} height={12} alt="" />
            <div onClick={() => this.setState({ index, visible: true })}>{title}</div>
          </div>
        ))}
      </div>
    )
  }
}
export default Notification;
