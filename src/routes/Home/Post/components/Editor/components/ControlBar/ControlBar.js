import React from 'react'
import { connect } from 'react-redux'
import { actions } from 'redux/editor'
import { RichUtils } from 'draft-js'
import { Affix } from 'antd'

import { SelectFontSize, EditorButton } from '..'

import { ReactComponent as IconList } from 'asset/svg/icon-list.svg'
import { ReactComponent as IconQuote } from 'asset/svg/icon-quote.svg'
import { ReactComponent as IconLink } from 'asset/svg/link.svg'
import { ReactComponent as SIconLink } from 'asset/svg/icon-link.svg'
import { ReactComponent as IconImage } from 'asset/svg/icon-image.svg'
import { ReactComponent as IconItalics } from 'asset/svg/icon-italics.svg'
import { ReactComponent as IconBold } from 'asset/svg/icon-bold.svg'
import { ReactComponent as IconListNum } from 'asset/svg/icon-list-num.svg'
//import { ReactComponent as IconWidget } from 'asset/svg/ic-widget.svg'

import './ControlBar.scss'

class ControlBar extends React.Component {
  toggleBlockType = (blockType) => {
    const { editorState, onChange } = this.props
    onChange(
      RichUtils.toggleBlockType(
        editorState,
        blockType
      )
    )
  }

  toggleInlineStyle = (inlineStyle) => {
    const { editorState, onChange } = this.props
    onChange(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle
      )
    )
  }

  checkActive = item => {
    const { editorState } = this.props
    let active
    if (item.type === 'block') {
      const selection = editorState.getSelection()
      const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType()
      active = item.styleProp === blockType
    } else {
      const currentStyle = editorState.getCurrentInlineStyle()
      active = currentStyle.has(item.styleProp)
    }
    return active
  }

  EditorButtonFn = (props) => {
    const { editorState, onChange } = this.props
    const { component, ...rest } = props
    const Component = component || EditorButton

    return (
      <Component
        editorState={editorState}
        onChange={onChange}
        {...rest}
        onControlBarToggle={this.props.onControlBarToggle}
      />
    )
  }
  handleShowFont = () => {
    const { toggleShowFont } = this.props
    toggleShowFont()
  }

  handleHideFont = () => {
    const { hideFont } = this.props
    hideFont()
  }

  handleSetFont = (value) => {
    const { setCurrentFont } = this.props
    setCurrentFont(value)
  }

  render() {
    const { EditorButtonFn } = this
    const { editor } = this.props

    return (
      <Affix>
        <div className='ControlBar'>
          <div className="ControlBarRow">
            <div className='ControlBarSection'>
              <SelectFontSize showDropdown={editor.showFont} currentFont={editor.currentFont} onFontChange={this.handleSetFont} onDropdownChange={this.handleShowFont} onHideDropdown={this.handleHideFont} styles={this.props.styles} editorState={this.props.editorState} setEditorState={this.props.onChange} />
              <EditorButtonFn label='bold' icon={<IconBold />} type='inline' styleProp='BOLD' />
              <EditorButtonFn label='italics' icon={<IconItalics />} type='inline' styleProp='ITALIC' />
            </div>
            <div className='ControlBarSection'>
              <EditorButtonFn label='ul' icon={<IconList />} type='block' styleProp='unordered-list-item' />
              <EditorButtonFn label='ol' icon={<IconListNum />} type='block' styleProp='ordered-list-item' />
              <EditorButtonFn label='quote' icon={<IconQuote />} type='block' styleProp='blockquote' />
            </div>
            <div className='ControlBarSection'>
              <EditorButtonFn label='image' icon={<IconImage />} type="toggle" index={2} />
              {this.props.showImageSearch && <EditorButtonFn label='image' icon={<IconImage />} type="toggle" index={4} />}
              {!this.props.showNewsletterEmbed && <EditorButtonFn label='embed content' icon={<SIconLink />} type="toggle" index={3} />}
              {this.props.showNewsletterEmbed && <EditorButtonFn label='newsletter embed' icon={<SIconLink />} type="toggle" index={5} />}
              <EditorButtonFn label='link' icon={<IconLink />} index={0} type="toggle" />
              {/* <EditorButton onControlBarToggle={this.props.onControlBarToggle} label='widget' icon={<IconWidget />} type="widget" editorState={this.props.editorState} onChange={this.props.onChange}>
                <div className="widget-sub">
                  <ul>
                    <li onClick={() => { onControlBarToggle(1) }}>Follow</li>
                  </ul>
                </div>
              </EditorButton> */}
            </div>
          </div>

        </div>
      </Affix>
    )
  }
}


export default connect(
  ({ editor }) => ({ editor }),
  {
    toggleShowFont: actions.toggleShowFont,
    hideFont: actions.hideFont,
    setCurrentFont: actions.setCurrentFont
  }
)(ControlBar)
