import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'

import { fetchCreatorInfo } from 'redux/insight'
import CreatorItem from './CreatorItem'
import Loading from 'components/utils/Loading'
import Tooltip from 'components/utils/Tooltip'

import './CreatorInfo.scss'

const CreatorInfo = ({
  creatorInfo
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (creatorInfo && creatorInfo.fetched !== undefined) {
      return;
    }
    dispatch(fetchCreatorInfo())
  }, [])

  return (
    <div className="insight-container insight-content">
      <div className="creator-header">
        <h2 className="creator-h2">Editorial Picks</h2>
        <Tooltip title="Hand-picked content and contributors by NewsBreak in-house editorial team." placement="right">
          <IconInfo className="creator-info-icon"/>
        </Tooltip>
      </div>
      { creatorInfo && creatorInfo.fetched ?
        <div className="creator-panel">
          {creatorInfo.infos.map(p => <CreatorItem {...p} key={p.media_name} />)}
        </div>
        :
        <Loading />}
    </div>
  )
}
export default connect(
  ({ insight: { creatorInfo } }) => ({ creatorInfo }),
  { fetchCreatorInfo },
)(CreatorInfo)