import React from 'react'
import { RichUtils } from 'draft-js'
import cx from 'classnames'
import { connect } from 'react-redux'
import { actions } from 'redux/editor'

import './EditorButton.scss'

class EditorButton extends React.Component {
  get active() {
    const { type, styleProp, editorState } = this.props
    let { active = false } = this.props
    if (styleProp) {
      if (type === 'block') {
        const selection = editorState.getSelection()
        const blockType = editorState
          .getCurrentContent()
          .getBlockForKey(selection.getStartKey())
          .getType()
        active = styleProp === blockType
      } else {
        const currentStyle = editorState.getCurrentInlineStyle()
        active = currentStyle.has(styleProp)
      }
    }
    return active
  }

  toggleWidget = e => {
    const { type } = this.props
    e.preventDefault()
    if (type === 'widget') {
      this.props.toggleWidget()
    }
  }

  onToggle = (index, e) => {
    e.preventDefault()
    this.props.onControlBarToggle(index)
    const { type, styleProp } = this.props
    if (type === 'widget' || type === 'toggle' || type==='custom') {
      // do nothing
    } else if (styleProp) {
      if (type === 'inline') {
        this.toggleInlineStyle(styleProp)
      } else {
        this.toggleBlockType(styleProp)
      }
    }
  }

  toggleBlockType = blockType => {
    const { editorState, onChange } = this.props
    onChange(
      RichUtils.toggleBlockType(
        editorState,
        blockType
      )
    )
  }

  toggleInlineStyle = inlineStyle => {
    const { editorState, onChange } = this.props
    onChange(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle
      )
    )
  }

  render() {
    const { className, icon, label, children, editor = {}, index = undefined } = this.props
    const { showWidget } = editor

    return (
      <div
        className={cx('EditorButton', className, this.active && 'active')}
        onMouseDown={(e) => { this.onToggle(typeof index === 'undefined' ? -1 : index, e) }}
        onClick={this.toggleWidget}
      >
        <div className='icon'>{icon}</div>
        <span>{label}</span>
        <div className={cx('showChild', showWidget && 'active')}>{children}</div>
      </div>
    );
  }
}


export default connect(
  ({ editor }) => ({ editor }),
  { ...actions }
)(EditorButton)
