import React from 'react'
import { Button, message } from 'antd'
import { applyLink as editorApplyLink } from '../../utils/operations'
import './LinkEditComponent.scss'
import { REG_URL } from '@/constant'

export class LinkEditComponent extends React.Component {
  state = {
    applyDisable: true,
    loading: false,
  }

  url = React.createRef()

  applyLink = () => {
    let url = this.urlLink.value
    if (!url) {
      message.error(`The url can't be empty`)
      return
    }
    if (!REG_URL.test(url)) {
      message.error('The url you input is not a valid url')
      return
    }
    const text = this.urlText.value || url
    const { editorState, onChange, onToggle } = this.props
    const withProperCursor = editorApplyLink(editorState, url, text)
    onChange(withProperCursor)
    onToggle()
  }

  onLinkInputChange = (e) => {
    if (e.target) {
      this.setState({
        applyDisable: e.target.value === '',
      })
    }
  }

  onLinkInputKeyDown = (e) => {
    if (e.which === 13 && !this.state.applyDisable) {
      this.applyLink()
      e.preventDefault()
    } else if (e.which === 27) { // esc
      this.props.onToggle()
      e.preventDefault()
    }
  }

  get selectedText() {
    const { editorState, editorRef } = this.props
    if (!editorRef.current) {
      return null
    }
    const { editor } = editorRef.current
    if (!editor.contains(document.activeElement)) {
      return null
    }
    const selectionState = editorState.getSelection();
    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey()
    if (startKey !== endKey) {
      return null
    }
    const currentContent = editorState.getCurrentContent();
    const currentContentBlock = currentContent.getBlockForKey(startKey)
    const start = selectionState.getStartOffset();
    const end = selectionState.getEndOffset();
    const selectedText = currentContentBlock.getText().slice(start, end)
    return selectedText
  }

  render() {
    const { state: { applyDisable }, selectedText } = this
    return (
      <div className="link-box">
        <div className="tab-header">
          <div className="tab-header-item">URL</div>
        </div>
        <div className="tab-content">
          <input
            placeholder="Text"
            ref={(node) => this.urlText = node}
            defaultValue={selectedText}
          />
          <input
            autoFocus={true}
            placeholder="Link"
            onKeyDown={this.onLinkInputKeyDown}
            onChange={this.onLinkInputChange}
            ref={(node) => this.urlLink = node}
          />
        </div>

        <Button shape="round" type="primary" ghost={true}
          loading={this.state.loading}
          disabled={applyDisable}
          onClick={this.applyLink}>Apply</Button>
      </div>
    )
  }
}
