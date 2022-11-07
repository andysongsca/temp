import React, { useState } from 'react'
import cx from 'classnames'
import { ReactComponent as IconStars } from 'asset/svg/stars.svg'
import { ReactComponent as IconStepChecked } from 'asset/svg/checkmark-checked.svg'
import { ReactComponent as IconStepUnchecked } from 'asset/svg/checkmark-unchecked.svg'

const CreatorSetupGuide = (props) => {
  const { stepsDone, updatePreferences } = props
  const [status, setStatus] = useState(stepsDone)
  const [guidesVisible, setGuidesVisible] = useState(status.length < 3)
  const percent = parseInt(status.length * 100 / 3)

  const onClickStep = (e) => {
    const step = parseInt(e.currentTarget.dataset.id)
    if (status.indexOf(step) < 0) {
      const newStatus = [...status, step]
      setStatus(newStatus)
      updatePreferences(newStatus)
    }
  }

  const toggleGuides = () => {
    setGuidesVisible(!guidesVisible)
  }

  return (
    <div className="section setup-guide">
      <div className="section-header">
        <div className="section-title-xl">
          Welcome to the NewsBreak Contributor Network
        </div>
        <IconStars />
      </div>

      {status.length < 3 && <div className="desc">
        You're almost on your way to publishing amazing content on NewsBreak! First, please read through our guidelines and tutorials.
      </div>}

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: percent + '%' }} />
      </div>
      <div className="progress-desc">{percent}% set up</div>

      {status.length === 3 && <div className={cx('toggle-arrow', guidesVisible && 'up')} onClick={toggleGuides} />}

      <div className={cx('step-list', !guidesVisible && 'collapsed')}>
        <div className={cx('step-item', status.indexOf(1) >= 0 && 'checked')}>
          <a href="https://support.newsbreak.com/knowledge/policies-and-violations"
            data-id="1" target="_blank" rel="noopener noreferrer" onClick={onClickStep}>
            <div className="step-number">
              <div>Step 1</div>
              <IconStepChecked className="ic-checked" /><IconStepUnchecked className="ic-unchecked" />
            </div>
            <div className="step-title">Understand our guidelines</div>
            <div className="step-desc">Learn more about our content requirements and guidelines, including our violation policy.</div>
          </a>
        </div>
        <div className={cx('step-item', status.indexOf(2) >= 0 && 'checked')}>
          <a href="https://support.newsbreak.com/knowledge/editorial-best-practices"
            data-id="2" target="_blank" rel="noopener noreferrer" onClick={onClickStep}>
            <div className="step-number">
              <div>Step 2</div>
              <IconStepChecked className="ic-checked" /><IconStepUnchecked className="ic-unchecked" />
            </div>
            <div className="step-title">Learn our best practices</div>
            <div className="step-desc">More information on values, principles, and editorial best practices.</div>
          </a>
        </div>
        <div className={cx('step-item', status.indexOf(3) >= 0 && 'checked')}>
          <a href="https://support.newsbreak.com/knowledge/filling-out-your-profile"
            data-id="3" target="_blank" rel="noopener noreferrer" onClick={onClickStep}>
            <div className="step-number">
              <div>Step 3</div>
              <IconStepChecked className="ic-checked" /><IconStepUnchecked className="ic-unchecked" />
            </div>
            <div className="step-title">Check your profile</div>
            <div className="step-desc">Make sure your profile is complete and you are ready to start earning money.</div>
          </a>
        </div>
      </div>
    </div>
  )
}

export default CreatorSetupGuide
