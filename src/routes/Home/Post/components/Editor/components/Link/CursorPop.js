import React from 'react'
import cx from 'classnames'

import { getVisibleSelectionRect } from 'draft-js'

import './CursorPop.scss'

const editorPadding = {
  left: 33,
  right: 33,
  bottom: 50,
}
const triangleHeight = 10

export class CursorPop extends React.Component {
  state = {
    style: { visibility: "hidden" },
    triangleStyle: {},
    below: true,
  }
  root = React.createRef()

  calcPosition = () => {
    const { editorState, editorRef } = this.props
    if (!editorRef.current) {
      return
    }
    const { editor } = editorRef.current
    if (!editor.contains(document.activeElement)) {
      // editor.focus()
    }
    const selectionState = editorState.getSelection();
    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey()
    if (startKey !== endKey) {
      return
    }
    const editorRootRect = editor.getBoundingClientRect();
    if (!this.root.current) return
    const linkBoxRect = this.root.current.getBoundingClientRect()
    // calc postion
    let selectionRect = getVisibleSelectionRect(window);
    if (!selectionRect) {
      // it's a empty line, use another way calc
      const contentElement = document.getElementsByClassName('public-DraftEditor-content')[0].children[0]
      let currentBlockElement = {
        offsetLeft: 0,
        offsetTop: 0,
        offsetHeight: 0
      }
      Array.prototype.find.call(contentElement.children, item => {
        const offsetKey = item.getAttribute('data-offset-key') || ''
        if (offsetKey.indexOf(startKey) === 0) {
          currentBlockElement = item
        }
      })
      selectionRect = {
        left: currentBlockElement.offsetLeft + editorRootRect.left,
        top: editorRootRect.top + currentBlockElement.offsetTop,
        height: currentBlockElement.offsetHeight
      }
    }

    let below = true
    const style = {}
    const triangleStyle = {
      left: editorPadding.left - triangleHeight,
    }
    const cursorLeft = selectionRect.left - editorRootRect.left
    const cursorTop = selectionRect.top - editorRootRect.top
    style.top = cursorTop + selectionRect.height + triangleHeight
    style.left = cursorLeft - editorPadding.left

    if (style.left + linkBoxRect.width >= editorRootRect.width +
      editorPadding.right) {
      style.left = editorRootRect.width + editorPadding.right - linkBoxRect.width
      triangleStyle.left = cursorLeft - style.left - triangleHeight
    }
    if (style.top + linkBoxRect.height > editorRootRect.height +
      editorPadding.bottom) {
      style.top = cursorTop - linkBoxRect.height - triangleHeight
      below = false
    }
    this.setState({
      style,
      triangleStyle,
      below,
    }, () => {
      const c = this.props.childrenRef.current
      if (c && c.focus) {
        window.setTimeout(() => c.focus())
      }
    })
  }
  componentDidMount() {
    const p = setInterval(() => {
      if (this.root.current) {
        clearInterval(p)
        this.calcPosition()
      }
    }, 10)
    // window.setTimeout(() => this.calcPosition())
  }
  render() {
    const { style, triangleStyle, below } = this.state
    return (
      <div
        className="cursor-pop"
        style={style}
        ref={this.root}
      >
        <div className={cx('triangle', below ? "below" : "up", 'sa')}
          style={triangleStyle} />
        <div className={cx('triangle', below ? "below" : "up", 'ra')}
          style={triangleStyle} />
        {this.props.children}
      </div>
    )
  }
}
