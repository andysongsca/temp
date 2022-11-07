import React from 'react'
import { formatStats } from 'utils/utilities'
import './StatsItem.scss'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import { ReactComponent as IconQuestion } from 'asset/svg/question.svg'
import { Tooltip } from 'components/utils'
import { ModalContext } from 'components/Creator'

const StatsItem = ({ text, num, is_video, toolTipText }) => {
  const context = React.useContext(ModalContext)
  const numStr = num === "N/A" || is_video ? "N/A" : formatStats(num)

  const handleClickChange = (e) => {
    e.preventDefault()
    context.openCVScoreModal()
  }

  return <>
    <div className="stats-item">
      <div className="score-area">
        {numStr === "N/A" ? <h1 className="score" title="N/A" >N/A</h1> : <h1 className="score" title={numStr.original}>{numStr.short}</h1>}
        {numStr === "N/A" && !is_video && <div className="na-tooltip-area">
          <Tooltip
            placement="topRight"
            title="Hang on! Your content is under review. Editing a piece three or more times could cause a delay of at least a day for approval and the more you edit, the longer it can take to go through our approval process."
          >
            <IconQuestion />
          </Tooltip>
        </div>}
      </div>
      <div className="title-area">
        {toolTipText &&
          <Tooltip
            placement="bottomLeft"
            title={<div>{toolTipText}<span>Click </span>
              <a href={window.location.href} onClick={handleClickChange}> here</a> to learn how it works</div>}
          >
            <IconInfo />
          </Tooltip>}
        <span>{text}</span>
      </div>
    </div>
  </>
}
export default StatsItem
