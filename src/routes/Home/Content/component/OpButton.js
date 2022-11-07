import React from 'react'
import './OpButton.scss'

export default function OpButton(props) {
  return (
    <div className="op-btn">
      <button type="button" onClick={props.onClick}>
        <img src={props.src} height="18px" alt={props.text} className={props.className || ''} />
      </button>
      <span>{props.text}</span>
    </div>
  )
}
