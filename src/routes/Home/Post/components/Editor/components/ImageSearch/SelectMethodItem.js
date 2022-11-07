import React from 'react'

const SelectMethodItem = props => {
  const { children, onClick, title } = props

  return (
    <div className="SelectMethodItem" onClick={() => onClick()}>
      <div className="SelectMethodItem-wrapper">
        <div className="SelectMethodItem-icon">{children}</div>
        <span>{title}</span>
      </div>
    </div>
  )
}
export default SelectMethodItem
