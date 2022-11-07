import React from 'react'
import { Base64 } from 'js-base64'
import { connect } from 'react-redux'
import { Button } from 'antd'

import { actions, DEFAULT_FOLLOW_TEXT } from 'redux/editor'
import { TYPE_FOLLOWING } from '@/constant/content'
import { ReactComponent as IconClose } from 'asset/svg/ic-close.svg'
import { getAccountId } from 'utils/user'
import { createDecorator } from '../../utils/decorator'
import { applyFollow } from '../../utils/operations'

import './FollowingCard.scss'


const { REACT_APP_API_BASE_URL } = process.env

export const FollowingCardPreview = (content) => {
  const { data } = content
  const url = `${REACT_APP_API_BASE_URL}/editor/tmpl_preview/FollowCard/${encodeURIComponent(data)}`
  return (
    <div className="tpl-fl-wrapper">
      <div
        className="iframe-wrapper"
      >
        <iframe title="following-preview" src={url} width="100%" frameBorder="0">
          Please use the modern browser.
        </iframe>
      </div>
    </div>
  )
}

export const FollowingCardTmpl = (content) => {
  const { data } = content || {};
  const mediaId = getAccountId()
  const dataContent = Base64.encode(encodeURIComponent(`{"mediaId":${mediaId}, "text": "${data.replace(/"/g, '\\"')}"}`));
  return (
    <nbtemplate
      data-id="FollowCard"
      className="FollowCard"
      data-content={dataContent}>&nbsp;</nbtemplate>
  )
}


class _FollowingCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverIframe: false,
    }
    // index of Editor.js Toggles array
    this.myIndex = 1;
  }
  render() {
    const { data, allowEdit = true, block } = this.props;
    const { hoverIframe } = this.state
    const url = `${REACT_APP_API_BASE_URL}/editor/tmpl_preview/FollowCard/${encodeURIComponent(data)}`
    return (
      <div className="tpl-fl-wrapper">
        <div
          className="iframe-wrapper"
          onMouseEnter={() => { this.setState({ hoverIframe: true }) }}
          onMouseLeave={() => {
            this.setState({ hoverIframe: false })
          }}
        >
          <iframe title="following" src={url} width="360px" frameBorder="0">
            Please use the modern browser.
          </iframe>
          {allowEdit && hoverIframe && <div
            className="edit-mask"
            onClick={
              (e) => {
                e.preventDefault()
                const newActiveToggle = this.props.editor.activeToggle !== this.myIndex ? this.myIndex : -1;
                this.props.setActionToggle(newActiveToggle, block.key, data)
              }
            }
          >Click to edit</div>}
        </div>
      </div>
    )
  }
}

const FollowingCard = connect(
  ({ editor }) => ({ editor }),
  { ...actions }
)(_FollowingCard)

const FollowingCardComponent = props => {
  const { content } = props.contentState.getEntity(props.entityKey).getData()
  return (
    <FollowingCard {...content} entityKey={props.entityKey} block={props.children[0].props.block} />
  )
}

export const FollowingCardDecorator = createDecorator(TYPE_FOLLOWING, FollowingCardComponent)


export class FollowingCardModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      applyDisable: false,
      inputValue: props.data || DEFAULT_FOLLOW_TEXT
    }
  }

  onInputChange = (e) => {
    if (e.target) {
      this.setState({
        applyDisable: false,
        inputValue: e.target.value.substr(0, 140),
      })
    }
  }

  apply = () => {
    const { inputValue: data } = this.state
    const { editorState, onChange, onToggle, removeKey } = this.props;

    const newEditorState = applyFollow(editorState, data, removeKey)
    onChange(newEditorState)
    onToggle()
  }

  focus = () => {
    this.input.focus()
  }

  render() {
    const { applyDisable, inputValue } = this.state
    return (
      <div className="fl-wrapper">
        <IconClose className="modal-close" onClick={() => { this.props.onToggle(1) }} />
        <div className="desc">
          Tell the readers why they should follow you:
        </div>
        <div className="input-wrapper">
          <input
            autoFocus={true}
            value={inputValue}
            onChange={this.onInputChange}
            ref={(node) => this.input = node} />
          <p className="input-hint"><span style={{ color: '#017EF9' }}>{inputValue.length}</span>/140</p>
        </div>
        <Button shape="round" type="primary" ghost={true}
          loading={this.state.loading}
          disabled={applyDisable}
          onClick={this.apply}>Apply</Button>
      </div>
    )
  }
}
