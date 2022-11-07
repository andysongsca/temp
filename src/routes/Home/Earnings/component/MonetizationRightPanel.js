import React from 'react'
import Tooltip from 'components/utils/Tooltip'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import '../MonetizationApplication.scss'

const MonetizationRightPanel = (props) => {
  const { applicationDetail } = props

  return (
    <div className="right-panel">
      <div className="status-block">
        <div className="status-counter">
          {applicationDetail.follower_count}/{applicationDetail.target_follower_count}
        </div>
        <div className="status-text">
          <div className="follower-text">Registered Followers</div>
          <Tooltip title="A registered follower means the follower has created a user account with NewsBreak (either on the web or downloaded the app) and is not just visiting on the web as a guest." placement="right">
            <IconInfo className="follower-icon"/>
          </Tooltip>
        </div>
        <div className="sep-line-horizontal" />
        <div className="status-counter">
          {applicationDetail.article_count}/{applicationDetail.target_article_count}
        </div>
        <div className="status-text">Articles</div>
      </div>
    </div>
  )
}

export default MonetizationRightPanel