import React from 'react'
import { Button, Empty } from 'antd'
import './Empty.scss'
import { Link } from 'react-router-dom'

const desc = {
  "post": <span><span>Wanna post your first article?</span><br /><span>Please click Post Now</span></span>,
  "deleted": <span>You don’t have any deleted articles.</span>,
  "draft": <span>You don’t have any Drafts here.</span>,
}

class ContentEmpty extends React.Component {
  render() {
    let status = this.props.status
    if (status === 'all') {
      status = 'post'
    }
    return (
      <div className="content-empty">
        <Empty
          image={require(`asset/img/empty/${status}@2x.png`)}
          imageStyle={{ height: 200 }}
          description={desc[status]}
        >
          {status === 'post' &&
            <Button type="primary" shape="round"><Link to="/home/post">Post Now</Link></Button>
          }
        </Empty>
      </div>
    )
  }
}
export default ContentEmpty
