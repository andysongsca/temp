import React from 'react'
import { Tooltip } from 'components/utils'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import './Setting.scss'

const badgeAltText = {
  'local_expert': 'Local expert',
  'top_contributor': 'Top contributor',
  'nb_select': 'NewsBreak select',
}

export const BadgeList = ({ data: { certifications_badges, badges } }) => (
  <div className="badge-list">
    {certifications_badges.length > 0 &&
      certifications_badges.map(({ type, light_icon, name, text }) => {
        if (type !== 'certification') {
          return null
        }
        return (
          <div className={`badge ${name}`} key={name}>
            {light_icon && <img src={light_icon} alt={text} />}
            <span>{text}</span>
          </div>
        )
      })
    }
    {certifications_badges.length === 0 && (badges.length > 0 ?
      badges.map(({ light_icon, name }) =>
        <img src={light_icon} alt={badgeAltText[name]} className="badge-img" key={name} />)
      : 'Badges you achieve will appear here. Keep creating to earn your first!'
    )}
  </div>
)

export const BadgeTooltip = () => (
  <Tooltip
    placement="right"
    autoWidth={true}
    overlayInnerStyle={{ width: 350 }}
    title={<div>
      <h4>Journalist:</h4>
      <p>A journalist who has a track record of editorial excellence across writing, videography, and audio reporting. Our
        Editorial Team reviews users for eligibility based on a candidate’s experience, coverage history and track
        record of being a nonpartisan reporter.</p>

      <h4>Community Voice Pro:</h4>
      <p>Community Voice Pros represent contributors who have consistently met NewsBreak's standards for quality,
        along with adhering to all policies, requirements, and editorial guidelines.</p>

      <h4>Community Voice:</h4>
      <p>We believe communities are enriched by the people who know them best, and Community Voices are the ones who can offer this type of insight. These
        are contributors who have an affinity for covering local events and/or sharing insights on a variety of topics.</p>

      <h4>Subject Matter Specialist:</h4>
      <p>SMSs have demonstrated knowledge or experience in a topic area. Our Editorial Team evaluates SMSs based on their relevant experience,
        qualifications, and writing and multimedia ability.</p>
      <p>NewsBreak is not responsible for and does not create content provided by Subject Matter Specialists. If you need personal advice or
        advice, please consult a professional licensed or knowledgeable in the subject matter.</p>
    </div>}
  >
    <IconInfo />
  </Tooltip>
)
