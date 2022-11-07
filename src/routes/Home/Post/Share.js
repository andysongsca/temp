import React from 'react'
import { isEqual } from 'underscore'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Input } from 'antd'

import withAuth from 'hocs/withAuth'
import withQuery from 'hocs/withQuery'
import { notification } from 'components/Notification'
import { POST_STATUS } from 'constant/content'
import { createDraft, updateDraft, publishPost, updatePost, fetchPost } from 'redux/post'
import { resetPosts } from 'redux/content'
import logEvent from 'utils/logEvent'

import EditButtonsGroup from './components/EditButtonsGroup'
import OGLinkEditor, { defaultOG } from './components/OGLinkEditor'

import './Post.scss'

// A dummy OG draft object
const defaultDraft = {
  title: '',
  content: '',
  ctype: 'og',
  og: defaultOG,
  location: '',
  status: POST_STATUS.DRAFT,
}

const messageMax = 280

class Share extends React.Component {
  constructor(props) {
    super(props)
    const { match: { params: { id } } } = props
    this.id = id
    this.state = {
      canEdit: id === undefined,
      draft: {
        ...defaultDraft
      },
      showPreview: false,
      showPublish: false,
      lastSavedTime: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    const { match: { params: { id } } } = nextProps
    if (this.id !== id) {
      this.id = id
      if (id) {
        this.loadData()
      } else {
        this.setState({
          draft: {
            ...defaultDraft,
          },
        })
      }
    }
  }

  componentDidMount() {
    this.loadData()
    this.autoSave = setInterval(this.handleAutoSave, 60000)
    logEvent('page_visit_start', { page: 'new-share' })
  }

  componentWillUnmount() {
    clearInterval(this.autoSave)
    logEvent('page_visit_end', { page: 'new-share' })
  }

  get currentDraft() {
    const { snapshot } = this
    const { location } = this.state.draft
    return {
      title: '',
      content: '',
      ctype: 'og',
      location,
      ...snapshot,
    }
  }

  get og() {
    return this.state.draft.og
  }

  get snapshot() {
    return { og: this.og }
  }

  get preview() {
    if (!this.og) {
      return ''
    }
    const { title, url, site_name, description, img, text_message } = this.og
    return `<div class="og-comment">${text_message}</div>
    <a class="og-body" target="_blank" href="${url}">${img ? ('<img src="' + img + '" />') : ''}
      <h4>${title}</h4>
      ${description ? ('<div class="og-desc">' + description + '</div>') : ''}
      ${site_name ? ('<div class="og-site">' + site_name + '</div>') : ''}
    </a>`
  }

  isChanged = () => !isEqual(this.saved, this.snapshot)

  save() {
    this.saved = this.snapshot
    this.setState({ draft: { ...this.state.draft, og: this.saved.og } })
  }

  loadData = () => {
    if (this.id) {
      this.props.fetchPost(this.id).then(() => {
        const { post } = this.props
        if (post === null) {
          return
        }
        this.setState({
          canEdit: true,
          draft: { title: '', content: '', ...post },
        })
        this.save()
      })
    } else {
      this.save()
    }
  }

  validateDraft = () => {
    if (this.og.status === 'none') {
      notification.error('Please validate the link of the article you want to share')
      return false
    }
    if (this.og.text_message.trim().length === 0) {
      notification.error('Please enter your thoughts on the article')
      return false
    }
    return true
  }

  togglePublish = () => {
    const showPublish = !this.state.showPublish
    // validate before show publish modal
    if (showPublish && !this.validateDraft()) {
      return
    }
    if (showPublish) {
      logEvent('publish_button_click', { page: 'new-share' })
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
      logEvent('preview_button_click', { page: 'new-share' })
    }
    this.setState({ showPreview: showPreview })
  }

  handleOGLinkChange = data => {
    this.setState({ draft: { ...this.state.draft, og: data } })
  }

  onTextMessageChange = e => {
    if (e.target.value.length > messageMax) {
      e.preventDefault()
      return;
    }
    const text_message = e.target.value
    this.setState(({ draft }) => ({
      draft: { ...draft, og: { ...this.og, text_message } }
    }))
  }

  handleAutoSave = () => {
    const { draft } = this.state
    if (!this.isChanged()) {
      return
    }
    const { createDraft, updateDraft } = this.props
    const onSuccess = ({ value: { data } }) => {
      if (data.code === 0) {
        if (!this.id) {
          this.id = data.data
        }
        this.save()
        this.setState({ lastSavedTime: (new Date()).toLocaleString() })
      }
    }

    if (this.id) {
      updateDraft(this.id, this.currentDraft, draft.status !== POST_STATUS.DRAFT).then(onSuccess)
    } else {
      createDraft(this.currentDraft).then(onSuccess)
    }
  }

  handleSaveAsDraft = () => {
    const { draft } = this.state
    const { createDraft, updateDraft } = this.props
    logEvent('save_draft_button_click', { page: 'new-share' })

    const onSuccess = ({ value: { data } }) => {
      if (data.code === 0) {
        if (!this.id) {
          const id = data.data
          this.id = id
        }
        notification.success('Your draft is saved')
        logEvent('save_draft_success', { page: 'new-share' })
        this.save()
      } else {
        notification.error(data.message)
        logEvent('save_draft_fail', { page: 'new-share' })
      }
    }

    if (this.id) {
      updateDraft(this.id, this.currentDraft, draft.status !== POST_STATUS.DRAFT).then(onSuccess)
    } else {
      createDraft(this.currentDraft).then(onSuccess)
    }
  }

  handlePublish = (location = null) => {
    const { status } = this.og
    if (status === 'none') {
      notification.error('Please validate the link of the article you want to share')
      return
    }
    const { publishPost, updatePost, goto } = this.props
    const post = {
      ...this.currentDraft,
      location,
    }
    logEvent('publish_button_click', { page: 'new-share' })

    const onSuccess = ({ value: { data } }) => {
      if (data.code === 0) {
        if (!this.id) {
          this.id = data.data
        }
        notification.success('Your post is being published')
        logEvent('publish_post_success', { page: 'new-share' })
        this.save()
        goto(`/home/content/post`)
      } else {
        notification.error(data.message)
        logEvent('publish_post_fail', { page: 'new-share' })
      }
    }

    if (this.id) {
      updatePost(this.id, post).then(onSuccess)
    } else {
      publishPost(post).then(onSuccess)
    }
  }

  render() {
    const { canEdit, draft, lastSavedTime, showPreview, showPublish } = this.state
    const { isFetchPostPending, self } = this.props

    if (isFetchPostPending || !draft) {
      return null
    }

    const { location, og } = draft

    return (
      <div className='Share'>
        <div className='Card post-container share-container'>
          {canEdit && (<div className='title'>
            <h3 className="section-header">
              Share an article with your thoughts *
            </h3>
            <div className="title-editor-container">
              <Input.TextArea
                autoSize={{ minRows: 2 }}
                placeholder="Your thoughts to be added..."
                value={og.text_message}
                onChange={this.onTextMessageChange}
              />
              <span className="title-count" key="title-count">
                {`${og.text_message.length}/${messageMax}`}
              </span>
            </div>
          </div>)}

          {canEdit && (<div className='og-container'>
            <h3 className="section-header">Article link *</h3>
            <OGLinkEditor
              mediaId={self.media_id}
              placeholder="Link to the article you want to share"
              onChange={this.handleOGLinkChange}
              content={og}
            />
          </div>)}

          {lastSavedTime && <div className="last-saved-time">last saved on {lastSavedTime}</div>}
        </div>

        <EditButtonsGroup
          data={{
            title: '',
            location,
            content: this.preview,
            isChanged: this.isChanged
          }}
          showPreview={showPreview}
          showPublish={showPublish}
          onPublish={this.handlePublish}
          onSaveAsDraft={this.handleSaveAsDraft}
          togglePublish={this.togglePublish}
          togglePreview={this.togglePreview}
        />
      </div>
    )
  }
}

export default compose(
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
      resetPosts,
    }
  )
)(Share)
