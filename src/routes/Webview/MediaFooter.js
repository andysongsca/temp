import React from "react"

export default (props) => {
  const { account: { account, is_creator, icon, var_info } } = props
  const desc = JSON.parse(var_info).des || ''

  return <>
    <div className="media-info-card">
      <div className="mediaAvatar">
        <img alt="name" src={icon} />
      </div>
      <div className="media-info">
        <div className="nickname">{account || '...'}</div>
        <div className="desc">{desc}</div>
      </div>
      <button className='follow-btn nf'>Follow</button>
    </div>
  </>;
}