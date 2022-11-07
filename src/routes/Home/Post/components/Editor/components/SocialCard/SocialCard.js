import React from 'react'
import { EditorState, AtomicBlockUtils } from 'draft-js'
import { Form } from 'antd'
import { TYPE_SOCIAL } from '@/constant/content'
import { createDecorator } from '../../utils/decorator'

import './SocialCard.scss'

const formatContent = content => {
  return content.replace(/<script.+?src="([^"]+?)"[^>]*?><\/script>/g, (match, src) => {
    return `<input type="image" src="empty.gif" style="opacity:0;width:0;" onerror="s=document.createElement(&quot;script&quot;);s.src=&quot;${src}&quot;;document.body.appendChild(s);">`
  })
}

export const SocialCardHtml = props => {
  return `<div style="overflow:hidden;display:flex;justify-content:center" data-type="${TYPE_SOCIAL}">${formatContent(props.content)}</div>`
}

const SocialCardComponent = props => {
  const { content } = props.contentState.getEntity(props.entityKey).getData()

  return (
    <div
      style={{
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center'
      }}
      contentEditable={false}
      dangerouslySetInnerHTML={{ __html: formatContent(content) }}
    />
  )
}

export class SocialCard extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  socialCardForm = props => {
    return (
      <Form
        onFinish={this.handleSubmit}
      >
        <Form.Item
          name='content'
        >
          <input
            type="text"
            className="form-input"
            placeholder="Paste embed code here"
            ref={this.inputRef}
          />
        </Form.Item>
      </Form>
    )
  }

  focus = () => {
    this.inputRef.current.focus()
  }

  handleSubmit = values => {
    const { content } = values
    const { editorState, onChange, onToggle } = this.props
    if (!content) {
      onToggle && onToggle()
      return
    }

    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
      TYPE_SOCIAL,
      'IMMUTABLE',
      { content }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity })
    onChange(
      AtomicBlockUtils.insertAtomicBlock(
        newEditorState,
        entityKey,
        ' '
      )
    )
    onToggle && onToggle()
  }

  render() {
    const SocialCardForm = this.socialCardForm
    return (
      <div className="form-wrapper">
        <SocialCardForm />
      </div>
    )
  }
}

export const SocialCardDecorator = createDecorator(TYPE_SOCIAL, SocialCardComponent)
