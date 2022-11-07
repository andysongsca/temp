import React from 'react'
import { connect } from 'react-redux'
import { actions } from 'redux/editor'
import cx from 'classnames'
import { Editor as DraftEditor, EditorState, RichUtils, convertToRaw } from 'draft-js'
import createStyles from 'draft-js-custom-styles'
import { ModalContext } from 'components/Creator'
import api from 'utils/api'
import { Popover } from 'antd';

import decorators from './decorators'
import { convertFromHtml } from './convert'
import {
  ControlBar,
  LinkEditComponent,
  CursorPop,
  FollowingCardModal,
  ImageUploadModal,
  SocialCard,
  blockTypeToFont,
  ImageSearch,
  NewsletterCard,
} from './components'
import { applyLink, getCurrentBlockType } from './utils/operations'
import { blockRenderMap } from './utils/editorProps'
import StrikeModal from '../../../Home/StrikeModal'

import 'draft-js/dist/Draft.css'
import './Editor.scss'
import './components/Widgets/FollowingCard.scss'

const { styles } = createStyles(['font-size', 'font-weight'])

const Toggles = [
  LinkEditComponent,
  FollowingCardModal,
  ImageUploadModal,
  SocialCard,
  ImageSearch,
  NewsletterCard,
]
const ToggleTypes = [
  'popup', 'popup', 'modal', 'popup', 'drawer', 'modal'
]

class Editor extends React.Component {
  constructor(props) {
    super(props)

    this.cursor = {
      key: null,
      offset: null
    }
    const { initialContent, onChange } = props

    let editorState
    if (initialContent) {
      editorState = EditorState.createWithContent(
        convertFromHtml(initialContent),
        decorators
      )
    } else {
      editorState = EditorState.createEmpty(decorators)
    }
    const wordCount = this.getWordCount(editorState)

    this.state = {
      editorState,
      showLinkBox: false,
      showOGCardEditor: false,
      wordCount,
      lastSavedTime: '',
      showGrammarly: { hide: false, cross: false }
    }
    onChange(editorState, wordCount)
    this.editorRoot = React.createRef()
    props.bindEditRoot(this.editorRoot);

    if (props.isInternalWriter) {
      props.fetchSearchSuggestions()
      props.fetchSearchSources()
    }
  }

  static getDerivedStateFromProps(props/*, state*/) {
    return { lastSavedTime: props.lastSavedTime }
  }

  getWordCount = (editorState) => {
    const blocks = convertToRaw(editorState.getCurrentContent()).blocks
    const wordArray = (blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n')).match(/\S+/g)
    return wordArray ? wordArray.length : 0;
  }

  onEditorStateChange = (editorState) => {
    const { cursor } = this
    const { onChange, setCurrentFont } = this.props

    const selectionState = editorState.getSelection()
    const startKey = selectionState.getStartKey()
    const startOffset = selectionState.getStartOffset()
    this.props.hideWidget()
    this.props.hideFont()
    cursor.key = startKey
    cursor.offset = startOffset

    //update font dropdown
    setCurrentFont(blockTypeToFont(getCurrentBlockType(editorState)))

    this.setState({
      editorState,
      wordCount: this.getWordCount(editorState)
    })
    onChange && onChange(editorState, this.getWordCount(editorState))
  }

  handleKeyCommand = (command, editorState) => {
    /*
        // disabling reset for later date
        if (command === 'split-block'){
          const newEditorState = resetBlockType(editorState, styles)
          this.onEditorStateChange(newEditorState)
          return true
        } */

    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onEditorStateChange(newState)
      return true
    }
    return false
  }

  handlePastedText = (text, html, editorState) => {
    if (/^https?:\/\//.test(text)) {
      const editorStateWithLink = applyLink(editorState, text)
      this.onEditorStateChange(editorStateWithLink)
      return true
    }
  }

  onFocus = () => {
    this.props.setActionToggle(-1)
    this.props.hideWidget()
    this.props.hideFont()
  }

  setEditorFocus = (signal) => {
    if (signal !== -1) {
      this.editorRoot.current.focus()
    } else {
      window.setTimeout(() => this.editorRoot.current.focus())
    }
  }

  onControlBarToggle = (index) => {
    const newActiveToggle = this.props.editor.activeToggle !== index ? index : -1;
    this.setEditorFocus(newActiveToggle)
    this.props.setActionToggle(newActiveToggle)
  }

  get Pop() {
    const { editorState } = this.state
    const { activeToggle, removeKey, data } = this.props.editor

    if (activeToggle >= 0 && activeToggle < Toggles.length) {
      const Toggle = Toggles[activeToggle]
      const toggleType = ToggleTypes[activeToggle]
      const props = {
        editorState,
        editorRef: this.editorRoot,
        onChange: this.onEditorStateChange,
        onToggle: () => this.onControlBarToggle(activeToggle),
      }
      if (toggleType === 'popup') {
        let c = React.createRef()
        return (
          <CursorPop {...props} childrenRef={c}>
            <Toggle {...props} ref={c} removeKey={removeKey} data={data} />
          </CursorPop>
        )
      } else if (toggleType === 'modal') {
        return <Toggle {...props} removeKey={removeKey} data={data} />
      } else if (toggleType === 'drawer') {
        return <Toggle />
      }
    }
    return null
  }

  // When closing the modal, redirect to Home Page
  onStrikeModalClose = () => {
    window.location.href = '/home'
  }

  handleAppealClick = (e) => {
    e.preventDefault()
    this.context.updateAppealTask({ taskId: this.props.violations.taskId, title: this.props.violations.title })
    this.context.openAppealModal()
  }

  onGrammarlyCheck = () => {
    this.updatePreferences()
    this.setState({ showGrammarly: { "cross": true, "hide": true } })
  }

  closeGrammarlyCheck = () => {
    this.setState({ showGrammarly: { "hide": true } })
  }

  updatePreferences = () => {
    api.post('/media/set_media_preferences', { preferences: { "grammarly": this.state.showGrammarly.cross ? 0 : 1 } })
  }

  showRejectedReason = (rejectedReason) => {
    const { reason, type, post_status, details } = rejectedReason
    const showDefaultReason = reason === "default"
    return <>
      {type === "content" && <div className={post_status !== 'remove' ? "warning" : "error"}>
        <div>{showDefaultReason ? "Changes Needed" : ("Changes Needed: " + reason)}</div>
        {details && !showDefaultReason && <p>{details}</p>}
        <p>Please review our
          <a href="https://creators.newsbreak.com/creator-content-policy" rel="noopener noreferrer" target="_blank"> Content Policy</a> and
          <a href="https://creators.newsbreak.com/creator-content-requirements" rel="noopener noreferrer" target="_blank"> Requirements</a>.  </p>
        {showDefaultReason && <p> If you need assistance, please email us. </p>}
      </div>}
      {type === "editorial" && <div className="warning">
        <div>{"Editor feedback: " + reason}</div>
        {details && !showDefaultReason && <p>{details}</p>}
        <p>Please review our
          <a href="https://creators.newsbreak.com/contributor-editorial-standards" rel="noopener noreferrer" target="_blank"> Editorial Standards and Guidelines</a>.
        </p>
        {showDefaultReason && <p> If you need assistance, please email us. </p>}
      </div>}
      {type === "policy" && <div className="error">
        <div>Received a strike</div>
        {details && <p>{details}</p>}
        <p>
          This violates our  <b>{reason}</b> policy. Please review our
          <a href="https://creators.newsbreak.com/creator-content-policy" rel="noopener noreferrer" target="_blank"> Content Policy</a> and
          <a href="https://creators.newsbreak.com/creator-content-requirements" rel="noopener noreferrer" target="_blank"> Requirements</a>.  </p>
        <p>  If you think we made a mistake, you can appeal this decision under <a href="/home/content/strike" rel="noopener noreferrer" target="_blank">Strike Management</a>.</p>
      </div>}
      {details && type === "none" && <div className="warning">
        <div>Editor feedback</div>
        {details && !showDefaultReason && <p>{details}</p>}
        <p>Please review our
          <a href="https://creators.newsbreak.com/contributor-editorial-standards" rel="noopener noreferrer" target="_blank"> Editorial Standards and Guidelines</a>.
        </p>
        {showDefaultReason && <p> If you need assistance, please email us. </p>}
      </div>}
    </>
  }

  showGrammarlyNotice = () => {
    const { showGrammarly } = this.state
    if (showGrammarly.hide || !this.props.showGrammarly) {
      return null
    }
    return <div className="grammarly">
      <div className="grammarly-middle">
        <p className={cx('grammarly-title', showGrammarly.cross && 'hideGrammarly')}> Check your grammar and spelling before publishing. </p>
        <p className={cx('grammarly-desc', showGrammarly.cross && 'hideGrammarly')}>We recommend using Grammarly or another grammar and spellcheck
          tool before you submit to avoid any delays in publishing.
          Here are instructions to install Grammarly's browser <a href="https://support.grammarly.com/hc/en-us/articles/115000091552-Install-the-Grammarly-browser-extension"
            rel="noopener noreferrer" target="_blank">extension</a>.</p>
      </div>
      <div className="grammarly-right">
        <button onClick={this.onGrammarlyCheck}>
          <img src={require('asset/svg/ic-close.svg')} alt="dismiss" className='grammarly-close' />
        </button>
      </div>
    </div>
  }

  render() {
    const { editorState, activeToggle, wordCount, lastSavedTime } = this.state
    const { rejectedReason, isInternalWriter, showNewsletterEmbed, violations } = this.props
    const contentState = editorState.getCurrentContent();
    const hidePlaceholder = !contentState.hasText() && contentState.getBlockMap().first().getType() !== 'unstyled'

    return (
      <div className='Editor'>
        <ControlBar
          editorState={editorState}
          onChange={this.onEditorStateChange}
          activeToggle={activeToggle}
          onControlBarToggle={this.onControlBarToggle}
          styles={styles}
          showImageSearch={isInternalWriter}
          showNewsletterEmbed={showNewsletterEmbed}
        />

        <div className={cx('Editor-Content', hidePlaceholder && 'Editor-hidePlaceholder')}>
          {rejectedReason && this.showRejectedReason(rejectedReason)}
          {this.showGrammarlyNotice()}

          <div id='Editor-Pop' />

          <DraftEditor
            blockRenderMap={blockRenderMap}
            //customStyleFn={customStyleFn}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onClick={this.onFocus}
            placeholder='Tell your story...'
            spellCheck={true}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onEditorStateChange}
            ref={this.editorRoot}
            handlePastedText={this.handlePastedText}
          />

          {this.Pop}
        </div>

        <div className="editor-status-bar">
          <span className="editor-word-counter">Words: {wordCount}</span>
          {lastSavedTime && <span className="editor-last-saved">Last saved: {lastSavedTime}</span>}
        </div>

        {violations && violations.violation_count > 2 && violations.should_suspend && (
          <StrikeModal
            visible={true}
            title={violations.title}
            count={violations.violation_count}
            taskId={violations.taskId}
            onClose={this.onStrikeModalClose}
          />
        )}
      </div>
    )
  }
}

Editor.contextType = ModalContext;

export default connect(
  ({ editor }) => ({ editor }),
  { ...actions }
)(Editor)
