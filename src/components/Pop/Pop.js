import React from 'react'
import cx from 'classnames'
import './Pop.scss'

class Pop extends React.Component {
  render() {
    const {className, style, position, children} = this.props

    return (
      <div 
        className={cx('Pop', className, position)}
        style={style}
      >
        {position && <div className='Pop-Triangle' />}
        <div className='Pop-Content'>
          {children}
        </div>
      </div>
    )
  }
}

export default Pop