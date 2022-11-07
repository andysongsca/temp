import React from 'react'
import { Carousel } from 'antd'
import { ModalContext } from 'components/Creator'


const Announcements = (props) => {
  const { version } = props
  const context = React.useContext(ModalContext)

  const onHandleClick = () => {
    context.openMonetizationModal()
  }

  const should_show_monetizatioin = version && version.latest > 2 && (version.payment_tier === "Tier 1" || version.payment_tier === "Tier 2") && version.should_show_earning
  const accept_latest = version && version.latest === version.accepted
  return (
    <div className="section announcements">
      <div className="announcements-content">
        <div className="section-header">
          <div className="section-title-lg">New announcement</div>
          <div className="date">05/24/2022</div>
        </div>
        <Carousel>
          <div className='content'>
            As NewsBreak’s Contributor Network evolves, we are dedicated to evaluating our programs and processes to ensure everyone is set up for success at all times. 
            We’re happy to announce the <a href="/contributor-code-of-conduct" rel="noopener noreferrer" target="_blank">Contributor Code of Conduct</a> which consists of values, guidelines, and rules for participating within the various channels of our platform. 
            NewsBreak commits to upholding it fairly and transparently and will take swift action to remedy behaviors or actions that do not align with what has been set forth. 
            As such, we reserve the right to suspend or terminate accounts or remove content for any reason at any time, including if a contributor’s on- and/or off-platform behavior harms our users, community, employees, or ecosystem.
          </div>
          <div className='content'>
            As part of our commitment to the community, we have updated our <a href="/creator-content-policy" rel="noopener noreferrer" target="_blank">Content Policy</a>, <a href="/creator-content-requirements" rel="noopener noreferrer" target="_blank">Requirements</a> and rolled out a new set of <a href="/contributor-editorial-standards" rel="noopener noreferrer" target="_blank">Editorial Standards & Guidelines</a>. 
            The goal of these guidelines is to increase transparency, build credibility with the audience and make our Contributor ecosystem a safer and healthier place for all. Please take a moment, if you haven't already, to read them in full.
          </div>
        </Carousel>
      </div>
    </div>
  )
}

export default Announcements
