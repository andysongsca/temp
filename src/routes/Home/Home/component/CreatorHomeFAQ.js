import React from 'react'
import { ReactComponent as IconLightbulb } from 'asset/svg/lightbulb.svg'
import { ReactComponent as IconSmiley } from 'asset/svg/smiley.svg'
import { ReactComponent as IconResources } from 'asset/svg/resouces.svg'

const CreatorHomeFAQ = (props) => {
  return (
    <div className="section creator-faq">
      <div className="section-title-lg">
        FAQ & resources
      </div>

      <div className="step-list">
        <div className="step-item">
          <IconLightbulb />
          <div className="content">
            <div className="step-title">Creating great content</div>
            <a href="https://support.newsbreak.com/knowledge/content#best-practices" className="step-desc" target="_blank" rel="noopener noreferrer">
              A simple guide to creating engaging content on NewsBreak
            </a>
          </div>
        </div>
        <div className="step-item">
          <IconSmiley />
          <div className="content">
            <div className="step-title">Finding your audience</div>
            <a href="https://support.newsbreak.com/knowledge/finding-your-audience" className="step-desc" target="_blank" rel="noopener noreferrer">
              Learn more about our best practices for building your following
            </a>
          </div>
        </div>
        <div className="step-item">
          <IconResources />
          <div className="content">
            <div className="step-title">More resources</div>
            <a href="https://www.newsbreak.com/publishers/@561460" className="step-desc" target="_blank" rel="noopener noreferrer">
              NewsBreak Contributors Blog
            </a>
            <br />
            <a href="https://support.newsbreak.com/knowledge" className="step-desc" target="_blank" rel="noopener noreferrer">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatorHomeFAQ
