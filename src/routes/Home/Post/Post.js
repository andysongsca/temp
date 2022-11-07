import React from 'react'
import { isEqual } from 'underscore'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { withCookies } from 'react-cookie'
import { Input } from 'antd'
import { convertToRaw } from 'draft-js'
import dateFormat from 'dateformat'

import withAuth from 'hocs/withAuth'
import withQuery from 'hocs/withQuery'
import { notification } from 'components/Notification'
import { ModalContext } from 'components/Creator'
import { Tooltip } from 'components/utils'
import { POST_STATUS } from 'constant/content'
import { createDraft, updateDraft, publishPost, updatePost, fetchPost, getPostRejectedReason, getMediaViolations, getMediaSuspensionOrTermination } from 'redux/post'
import api from 'utils/api'
import logEvent from 'utils/logEvent'
import { requirementRejectMap, policyRejectMap, editorialStandardsMap, newContenPolicyAndRequirementMap } from 'utils/utilities'
import { MEDIA_TYPE_NEWSLETTER, TYPE_IMAGE, MEDIA_TYPE_CREATOR } from '@/constant/content'
import Editor from './components/Editor'
import { convertToHtml, convertToPureHtml } from './components/Editor/convert'
import EditButtonsGroup from './components/EditButtonsGroup'
import { ReactComponent as IconQuestion } from '@/asset/svg/question.svg'

import './Post.scss'


const defaultDraft = {
  covers: [],
  title: '',
  content: '',
  status: POST_STATUS.DRAFT,
  message: '',
  location: null,
  locationPid: '',
  isEvergreen: false,
  rejectedReason: null,
}

const titleMax = 120
const messageMax = 500

class Post extends React.Component {
  constructor(props) {
    super(props)
    const { match: { params: { id } } } = props
    this.id = id || ''
    this.state = {
      canEdit: id === undefined,
      draft: { ...defaultDraft },
      showPreview: false,
      showPublish: false,
      lastSavedTime: '',
      blockPublish: false,
      wordCount: 0,
      rejectedReason: null,
      showGrammarly: true,
      suspended: false,
    }
  }

  get isCreator() {
    return this.props.self.mediaType === MEDIA_TYPE_CREATOR
  }

  get covers() {
    if (!this.editorState) {
      return []
    }
    const { entityMap } = convertToRaw(this.editorState.getCurrentContent())
    for (let key in Object.keys(entityMap)) {
      const entity = entityMap[key]
      if (entity.type === TYPE_IMAGE) {
        return [entity.data.src]
      }
    }
    return []
  }

  get currentDraft() {
    const { snapshot, covers } = this
    const { mp_tags_manual, location, locationPid, isEvergreen } = this.state.draft
    return {
      mp_tags_manual,
      location,
      locationPid,
      isEvergreen,
      ...snapshot,
      covers,
    }
  }

  get snapshot() {
    return {
      title: this.state.draft.title,
      content: this.pureHtml,
    }
  }

  get followCardCounter() {
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(this.pureHtml, 'text/html');
    const followCardList = parsedHtml.getElementsByClassName('FollowCard');
    return followCardList.length
  }

  get imageViolationCounter() {
    const parser = new DOMParser();
    const parsedHtml = parser.parseFromString(this.pureHtml, 'text/html');
    const imageList = parsedHtml.getElementsByTagName('img');
    if (imageList.length === 0) {
      return -1
    } else {
      var violationCounter = 0
      for (let i = 0; i < imageList.length; i++) {
        if (!imageList[i].getAttribute('data-credit')) {
          violationCounter++
        }
      }
      return violationCounter
    }
  }

  isChanged = () => !isEqual(this.saved, this.snapshot)

  save() {
    this.saved = this.snapshot
    this.setState({ draft: { ...this.state.draft, content: this.saved.content } })
  }

  get preview() {
    const { editorState } = this
    const { self } = this.props

    if (editorState) {
      return convertToHtml(editorState.getCurrentContent(), { isNewsletter: self && self.mediaType === MEDIA_TYPE_NEWSLETTER })
    } else {
      return '<p></p>'
    }
  }

  get pureHtml() {
    const { editorState } = this
    const { self } = this.props

    if (editorState) {
      return convertToPureHtml(editorState.getCurrentContent(), { isNewsletter: self && self.mediaType === MEDIA_TYPE_NEWSLETTER })
    } else {
      return '<p></p>'
    }
  }

  componentDidMount() {
    this.loadData()
    this.autoSave = setInterval(this.handleAutoSave, 30000)
    const { props } = this
    if (props.self && props.self.is_creator) {
      const elements = document.getElementsByTagName("grammarly-desktop-integration");
      const grammarly_installed = elements && elements.length > 0
      if (grammarly_installed) {
        logEvent('page_visit_start', { page: 'post', postId: this.id, grammarly_installed })
        this.setState({ showGrammarly: false })
      } else {
        logEvent('get_media_preferences', { page: 'Post' })
        api.get('/media/get_media_preferences', { media_id: props.self.media_id }).then(({ data }) => {
          if (data.data) {
            this.setState({ showGrammarly: data.data.grammarly !== 1 })
          }
        })
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.autoSave)
    logEvent('page_visit_end', { page: 'post', postId: this.id })
  }

  componentWillReceiveProps(nextProps) {
    const { match: { params: { id } } } = nextProps
    if (this.id !== id) {
      this.id = id
      if (id) {
        this.loadData()
      } else {
        this.setState({
          draft: { ...defaultDraft },
        })
      }
    }
  }

  loadData = () => {
    const { props } = this
    props.getMediaSuspensionOrTermination(this.props.self.media_id).then((res) => {
      if (res && res.value && res.value.data) {
        const should_suspend = res.value.data.type === "suspend"
        const updated_time = res.value.data.updated_time
        if (should_suspend && this.isSuspensionEffective(updated_time)) {
          this.setState({
            suspended: true
          })
        }
      }
    })
    if (this.id) {
      props.fetchPost(this.id).then(() => {
        const { post } = this.props
        if (post === null) {
          return
        }
        this.setState({
          canEdit: true,
          draft: post,
        })
        this.save()
        // fetch rejected reason if post is in rejected state
        if ((post.status === POST_STATUS.POSTED || post.status === POST_STATUS.POSTED_DRAFT)
          && post.doc_id && props.self && props.self.is_creator) {
          props.getPostRejectedReason(post.doc_id).then((res) => {
            if (res && res.value && res.value.data) {
              // translate the rejected reason to external facing reason
              // if error cannot be surfaced, we will show a default message
              let reason = res.value.data.title
              let violationType = ""
              const date = res.value.data.date
              const source = this.props.self && this.props.self.creator_info && this.props.self.creator_info.source
              const isSourceOpen = source === "open registration"
              let postStatus = ""
              if (reason && post.audit_status !== 0) {
                const is_strike = this.props.self && this.props.self.violations && this.props.self.violations.doc_ids &&
                  this.props.self.violations.doc_ids.includes(post.doc_id)
                if (reason in editorialStandardsMap) {
                  reason = editorialStandardsMap[reason]
                  violationType = "editorial"
                  postStatus = "drop"
                }
                else if (reason in policyRejectMap && is_strike) {
                  reason = policyRejectMap[reason]
                  violationType = "content"
                  postStatus = "drop"
                  if (date > '2021-09-28' || (date > '2021-08-23' && isSourceOpen)) {
                    violationType = "policy"
                    postStatus = "remove"
                  }
                }
                else if (reason in newContenPolicyAndRequirementMap) {
                  reason = newContenPolicyAndRequirementMap[reason]
                  violationType = "content"
                  postStatus = "remove"
                }
                else if (reason in requirementRejectMap) {
                  reason = requirementRejectMap[reason]
                  violationType = "content"
                  postStatus = "remove"
                }
                else {
                  reason = "default"
                }
              } else {
                violationType = "none"
                postStatus = "online"
              }
              this.setState({
                rejectedReason: { reason: reason, details: res.value.data.details, type: violationType, post_status: postStatus }
              })
            }
          })
        }
      })
    } else {
      this.save()
    }
  }

  validateDraft = () => {
    const { draft: { title } } = this.state
    const imageViolations = this.imageViolationCounter
    if (!title) {
      notification.error('Please enter title for your post.')
      return false
    } else if (/\r|\n/.exec(title)) {
      notification.error('Please remove any line breaks from titles.')
      return false
    } else if (title.match('^[^a-z]*$')) {
      notification.error('All capital letters are not allowed in titles.')
      return false
    } else if (this.followCardCounter > 2) {
      notification.error('Only two follow widgets are allowed per article.')
      return false
    } else if (imageViolations === -1) {
      notification.error('Every post needs at least one image. This image will appear in the article and be used as the thumbnail.')
      return false
    } else if (imageViolations > 0) {
      notification.error('Please add a credit for your image. If you took it yourself, you can use your name.')
      return false
    }
    return true
  }

  togglePublish = () => {
    // show if latest policy is required but not agreed
    if (this.context.openMonetizationModal()) {
      return
    }
    const showPublish = !this.state.showPublish
    // validate before show publish modal
    if (showPublish && !this.validateDraft()) {
      return
    }
    if (showPublish) {
      logEvent('publish_button_click', { page: 'post', postId: this.id })
    } else {
      logEvent('publish_modal_close')
    }
    this.setState({ showPublish: showPublish })
  }

  togglePreview = () => {
    const showPreview = !this.state.showPreview
    // validate before show publish modal
    if (showPreview && !this.validateDraft()) {
      return;
    }
    if (showPreview) {
      logEvent('preview_button_click', { page: 'post', postId: this.id })
    }
    this.setState({ showPreview: showPreview })
  }

  onTitleKeyDown = e => {
    if (e.which === 13) {
      e.preventDefault()
    }
  }

  onTitleChange = e => {
    const title = e.target.value
    if (title.length > titleMax) {
      e.preventDefault()
      return;
    }
    this.setState(({ draft }) => ({ draft: { ...draft, title } }))
  }

  onMessageChange = e => {
    const message = e.target.value
    if (message.length > messageMax) {
      e.preventDefault()
      return;
    }
    this.setState(({ draft }) => ({ draft: { ...draft, message } }))
  }

  onEditorChange = (editorState, wordCount) => {
    this.editorState = editorState
    this.setState({ wordCount: wordCount })
  }

  saveDraft = (notify) => {
    const { createDraft, updateDraft } = this.props
    const logInfo = { page: 'post', postId: this.id }

    const onSuccess = ({ value: { data } }) => {
      if (data.code === 0) {
        if (!this.id) {
          this.id = data.data + ''
          this.save()
          this.props.history.push(`/home/post/${this.id}`)
        } else {
          this.save()
        }
        this.setState({ lastSavedTime: (new Date()).toLocaleString(), wordCount: this.state.wordCount })
        if (notify) {
          notification.success('Your draft is saved')
        }
        logEvent('save_draft_success', logInfo)
      } else {
        if (notify) {
          notification.error(data.message || 'Failed to save your draft')
        }
        logEvent('save_draft_fail', logInfo)
      }
    }

    if (this.id) {
      updateDraft(this.id, this.currentDraft, this.state.draft.status !== POST_STATUS.DRAFT).then(onSuccess)
    } else {
      createDraft(this.currentDraft).then(onSuccess)
    }
  }

  handleAutoSave = () => {
    if (!this.isChanged()) {
      return
    }
    logEvent('auto_save_post', { page: 'post', postId: this.id })
    this.saveDraft()
  }

  handleSaveAsDraft = () => {
    logEvent('save_draft_button_click', { page: 'post', postId: this.id })
    this.saveDraft(true)
  }

  handlePublish = (publishData) => { // mp_tags_manual, location, locationPid, isEvergreen, schedule_time
    const { publishPost, updatePost, goto } = this.props
    const post = {
      ...this.currentDraft,
      ...publishData,
      message: this.state.draft.message,
    }
    logEvent('publish_button_click', {
      page: 'post',
      postId: this.id,
      length: post.content.length,
      content: post.content.substr(0, 40)
    })

    const onSuccess = ({ value: { data } }) => {
      if (data.code === 0) {
        if (!this.id) {
          this.id = data.data
        }
        this.save()
        notification.success('Your post is being published')
        logEvent('publish_post_success', { page: 'post', postId: this.id })
        if (this.state.draft.message) {
          logEvent('publish_article_message_success', { page: 'post' })
        }
        goto(`/home/content/post`)
      } else {
        notification.error(data.message)
        logEvent('publish_post_fail', { page: 'post', postId: this.id, error: data.message })
      }
    }

    const onError = (error) => {
      logEvent('publish_post_fail', { page: 'post', postId: this.id, error })
    }

    if (this.id) {
      updatePost(this.id, post).then(onSuccess).catch(onError)
    } else {
      publishPost(post).then(onSuccess).catch(onError)
    }
  }

  updateTitleNoticeVisibility = () => {
    this.props.cookies.set('nb_show_title_hint_v2', 'false', { path: '/' })
  }

  shouldShowSuspendModal = (violations) => {
    if (!violations) {
      return false
    }
    if (violations.count !== 2) {
      return true
    }

    return this.isSuspensionEffective(violations.updated_time)
  }

  isSuspensionEffective = (last_update_time) => {
    let sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = dateFormat(sevenDaysAgo, 'yyyy-mm-dd');
    return last_update_time > startDate
  }

  render() {
    const { id, pureHtml } = this
    const { canEdit, draft, lastSavedTime, showPreview, showPublish, showGrammarly } = this.state
    const { isFetchPostPending, self, cookies } = this.props
    if (isFetchPostPending || !draft || !self) {
      return null
    }
    const { content, title, mp_tags_manual, location, status, schedule_time, message, locationPid, isEvergreen } = draft
    const { medias, media_id, internal_writer, is_creator, is_journalist, mediaType } = self
    let blocked = false;
    let violations = {}
    if (medias && media_id) {
      medias.forEach(media => {
        if (media.media_id === media_id) {
          blocked = (media.state === 1);
          if (media.violations && media.violations.count) {
            violations = {
              "title": media.violations.latest_doc_title,
              "violation_count": media.violations.count,
              "updated_time": media.violations.updated_time,
              "taskId": media.violations.task_id,
              "should_suspend": this.shouldShowSuspendModal(media.violations)
            }
          }
        }
      });
    }
    let blockCreatorPublish = false;
    let blockCreatorPublishReason = '';
    let pass_word_count_limit = this.state.wordCount && ((self.short_story_enabled && this.state.wordCount > 50) || this.state.wordCount > 250)
    if (self && self.is_creator) {
      if ((self.violations && self.violations.count >= 2 && this.isSuspensionEffective(self.violations.updated_time)) || this.state.suspended) {
        blockCreatorPublish = true;
        blockCreatorPublishReason = 'Your account has been suspended for 7 days. You are not able to publish during this time.'
      } else if (!pass_word_count_limit) {
        blockCreatorPublish = true;
        blockCreatorPublishReason = 'Hold on! Articles on NewsBreak must include at least 250 words, and articles over 600 words are best for optimization.'
      }
    }

    return (
      <div className='Post'>
        <div className='Card post-container'>
          <div className='title'>
            {canEdit && <>
              <Input.TextArea
                autoSize={{
                  minRows: 1,
                  maxRows: 6,
                }}
                key={0}
                spellCheck={true}
                placeholder='Title'
                value={title}
                onKeyDown={this.onTitleKeyDown}
                onChange={this.onTitleChange}
              />
              <div className="title-count" key="title-count">
                {`${title.length}/${titleMax}`}
              </div>
              <Tooltip
                overlayInnerStyle={{ color: '#ffffff', whiteSpace: 'nowrap' }}
                color="#017EF9"
                placement="left"
                visible={cookies.get('nb_show_title_hint_v2') !== 'false'}
                autoWidth={true}
                title="Important notice to the title"
              >
                <div className="notice-holder"></div>
              </Tooltip>
              <Tooltip
                placement="topRight"
                trigger="click"
                title={<div>All headlines should follow the below guidelines to ensure proper distribution:
                  <ul>
                    <li>be free of clickbait words and formats (this includes exaggerated words like "best" or "must-see" and listicles for non-local topics)</li>
                    <li>does not include misleading statements such as “This is the one thing you need to know…”</li>
                    <li>be factually correct and directly related to the content and free of any other sensationalized or deceptive wording</li>
                    <li>be free of spelling and grammatical errors</li>
                  </ul>
                </div>}
              >
                <div onClick={this.updateTitleNoticeVisibility}><IconQuestion /></div>
              </Tooltip>
            </>}
          </div>

          <div className='editor-container'>
            {canEdit &&
              <Editor
                key={id}
                initialContent={content}
                onChange={this.onEditorChange}
                rejectedReason={this.state.rejectedReason}
                isInternalWriter={internal_writer || mediaType === MEDIA_TYPE_NEWSLETTER}
                isCreator={this.isCreator}
                violations={violations}
                showGrammarly={showGrammarly}
                lastSavedTime={lastSavedTime}
              />
            }
          </div>
        </div>

        {self && self.enable_internal_circle && status !== 2 && <div className="post-message">
          <h2 className="message-title">Send this article as a push notification?</h2>
          <span className="message-footer">Your article will automatically be sent to your Circle, but only articles sent with a Circle message will generate a push notification.</span>
          <Input.TextArea
            bordered={false}
            className="message-input-area"
            placeholder="Write your Circle message here!"
            value={message}
            maxLength={messageMax}
            showCount={true}
            autoSize={{ minRows: 2, maxRows: 4 }}
            onChange={this.onMessageChange}
          />
        </div>}

        {status === POST_STATUS.SCHEDULED && <div className="scheduled-time">Scheduled to be published on {(new Date(schedule_time)).toLocaleString()}</div>}

        <EditButtonsGroup
          data={{
            title,
            mp_tags_manual: this.isCreator ? (mp_tags_manual || []) : null,
            location,
            content: this.preview,
            isChanged: this.isChanged,
            schedule_time,
            internal_writer,
            is_journalist,
            locationPid,
            isEvergreen,
          }}
          showPreview={showPreview}
          showPublish={showPublish}
          isBlocked={blocked || (is_creator && blockCreatorPublish)}
          onPublish={this.handlePublish}
          onSaveAsDraft={this.handleSaveAsDraft}
          togglePublish={this.togglePublish}
          togglePreview={this.togglePreview}
          blockPublish={blockCreatorPublish}
          blockCreatorPublishReason={blockCreatorPublishReason}
        />

        {self && self.enable_html_textbox && <Input.TextArea
          autoSize={{
            minRows: 6,
            maxRows: 6,
          }}
          placeholder='Html'
          value={pureHtml}
        />}
      </div>
    )
  }
}

Post.contextType = ModalContext

export default compose(
  withCookies,
  withAuth,
  withQuery,
  connect(
    ({ post }) => post,
    {
      createDraft,
      updateDraft,
      publishPost,
      updatePost,
      fetchPost,
      getPostRejectedReason,
      getMediaViolations,
      getMediaSuspensionOrTermination
    }
  )
)(Post)
