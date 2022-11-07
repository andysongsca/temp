import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Input, Modal, Checkbox, DatePicker } from 'antd'
import { isEqual } from 'underscore'
import withAuth from 'hocs/withAuth'
import withQuery from 'hocs/withQuery'
import logEvent from 'utils/logEvent'
import moment from 'moment'

import { Preview } from 'components/utils'
import Editor from '../Post/components/Editor'
import { convertToHtml, convertToPureHtml } from '../Post/components/Editor/convert'
import {
  fetchNewsletter,
  fetchWelcomeEmail,
  publishNewsletter,
  updateNewsletter,
  saveNewsletterDraft,
  updateNewsletterDraft,
  saveNewsletterWelcome,
  updateNewsletterWelcome,
} from 'redux/newsletter'
import { notification } from 'components/Notification'

import './CreateNewsletter.scss'

const defaultDraft = {
  title: '',
  content: 'Newsletter placeholder',
}
const defaultEmailDraft = {
  emailSubject: '',
  emailContent: 'Welcome!',
}
const titleMax = 120
const emailSubjectMax = 120

class CreateNewsletter extends React.Component {
  constructor(props) {
    super(props)
    const { match: { params: { id } } } = props
    this.id = id || ''
    this.origMediaId = null
    this.state = {
      canEdit: id === undefined,
      canRenderEmail: false,
      draft: { ...defaultDraft },
      emailDraft: { ...defaultEmailDraft },
      publishComfirmVisible: false,
      publishComfirmLoading: false,
      emailEditorVisible: false,
      schedulePublish: false,
      scheduleTime: moment(new Date()),
      showPreview: false,
      lastSavedTime: '',
    }
  }

  get preview() {
    const { editorState } = this
    if (editorState) {
      return convertToHtml(editorState.getCurrentContent(), true)
    }
    return '<p></p>'
  }

  get pureHtml() {
    const { editorState } = this
    if (editorState) {
      return convertToPureHtml(editorState.getCurrentContent(), true)
    }
    return '<p></p>'
  }

  get pureWelcomeHtml() {
    const { welcomeEditorState } = this
    if (welcomeEditorState) {
      return convertToPureHtml(welcomeEditorState.getCurrentContent(), true)
    }
    return '<p></p>'
  }

  get currentDraft() {
    return {
      title: this.state.draft.title,
      content: this.pureHtml,
    }
  }

  get currentEmailDraft() {
    return {
      title: this.state.emailDraft.emailSubject,
      content: this.pureWelcomeHtml,
    }
  }

  get isChanged() {
    return !isEqual(this.saved, this.currentDraft)
  }

  componentDidMount() {
    this.loadEmailData()
    this.loadPostData()
    this.autoSave = setInterval(this.handleAutoSave, 30000)
    logEvent('page_visit_start', { page: 'create-newsletter' })
  }

  componentWillUnmount() {
    clearInterval(this.autoSave)
    logEvent('page_visit_end', { page: 'create-newsletter' })
  }

  loadEmailData = () => {
    this.props.fetchWelcomeEmail().then(() => {
      const { welcomeEmail } = this.props
      if (welcomeEmail === null || !welcomeEmail.fetched || welcomeEmail.data === null) {
        this.setState({ canRenderEmail: true })
        return
      }
      this.setState({
        canRenderEmail: true,
        emailDraft: { emailId: welcomeEmail.data.id, emailSubject: welcomeEmail.data.title, emailContent: welcomeEmail.data.content }
      })
    })
  }

  loadPostData = () => {
    this.saved = { ...this.currentDraft }
    if (this.id) {
      this.props.fetchNewsletter(this.id).then(() => {
        const { currentNewsletter } = this.props
        if (currentNewsletter === null || !currentNewsletter.fetched) {
          return
        }
        this.saved = { title: currentNewsletter.data.title, content: currentNewsletter.data.content }
        this.origMediaId = currentNewsletter.data.mediaId
        this.setState({ canEdit: true, draft: this.saved })
      })
    }
  }

  togglePreview = () => {
    const showPreview = !this.state.showPreview
    if (showPreview) {
      logEvent('preview_button_click', { page: 'create-newsletter', postId: this.id })
    }
    this.setState({ showPreview: showPreview })
  }

  onTitleChange = e => {
    const title = e.target.value
    if (title.length > titleMax) {
      e.preventDefault()
      return;
    }
    this.setState(({ draft }) => ({ draft: { ...draft, title } }))
  }

  onEmailSubjectChange = e => {
    const emailSubject = e.target.value
    if (emailSubject.length > emailSubjectMax) {
      e.preventDefault()
      return;
    }
    this.setState(({ emailDraft }) => ({ emailDraft: { ...emailDraft, emailSubject } }))
  }

  onEditorChange = (editorState) => {
    this.editorState = editorState
  }

  onWelcomeEditorChange = (editorState) => {
    this.welcomeEditorState = editorState
  }

  onSchedulePublishChange = () => {
    const { schedulePublish } = this.state
    this.setState({ schedulePublish: !schedulePublish })
  }

  onSetSchedule = (val) => {
    if (!val || val.isBefore(new Date())) {
      this.setState({ scheduleTime: null })
    } else {
      this.setState({ scheduleTime: val })
    }
  }

  handleSaveWelcomeEmail = () => {
    const { saveNewsletterWelcome, updateNewsletterWelcome } = this.props

    const onSuccess = ({ value: { data } }) => {
      this.setState({
        emailEditorVisible: false,
      })
      this.loadEmailData()
      if (data.code === 0) {
        notification.success('Your welcome email is saved')
        logEvent('save_welcome_email_success', { page: 'newsletter' })
      } else {
        notification.error(data.message)
        logEvent('save_welcome_email_fail', { page: 'newsletter' })
      }
    }
    if (this.state.emailDraft.emailId) {
      updateNewsletterWelcome(this.state.emailDraft.emailId, {
        ...this.currentEmailDraft, mediaId: this.origMediaId
      }).then(onSuccess)
    } else {
      saveNewsletterWelcome(this.currentEmailDraft).then(onSuccess)
    }
  }

  saveDraft = (notify) => {
    const { saveNewsletterDraft, updateNewsletterDraft } = this.props
    const draft = this.currentDraft

    const onSuccess = ({ value: { data } }) => {
      this.setState({
        publishComfirmLoading: false,
        publishComfirmVisible: false,
      })
      if (data.code === 0) {
        this.saved = { ...draft }
        if (!this.id) {
          this.id = data.data + ''
          this.props.history.push(`/home/newsletter/create/${this.id}`)
        }
        if (notify) {
          notification.success('Your newsletter draft is saved')
        }
        this.setState({ lastSavedTime: (new Date()).toLocaleString() })
        logEvent('save_newsletter_draft_success', { page: 'newsletter' })
      } else {
        if (notify) {
          notification.error(data.message)
        }
        logEvent('save_newsletter_draft_fail', { page: 'newsletter' })
      }
    }

    if (this.id) {
      updateNewsletterDraft(this.id, { ...draft, mediaId: this.origMediaId }).then(onSuccess)
    } else {
      saveNewsletterDraft(draft).then(onSuccess)
    }
  }

  handleAutoSave = () => {
    if (!this.isChanged) {
      return
    }
    logEvent('auto_save_post', { page: 'newsletter', postId: this.id })
    this.saveDraft()
  }

  handleSaveAsDraft = () => {
    logEvent('save_newsletter_draft_btn_clicked', { page: 'newsletter' })
    this.saveDraft(true)
  }

  handlePublish = () => {
    this.setState({ publishComfirmLoading: true })
    const { publishNewsletter, updateNewsletter, goto } = this.props
    let draft = {
      ...this.currentDraft,
    }
    if (this.state.schedulePublish) {
      draft.scheduledTime = this.state.scheduleTime.valueOf()
    }
    if (this.origMediaId) {
      draft.mediaId = this.origMediaId
    }

    const onSuccess = ({ value: { data } }) => {
      this.setState({
        publishComfirmLoading: false,
        publishComfirmVisible: false,
      })
      if (data.code === 0) {
        notification.success('Your newsletter is published/scheduled')
        logEvent('publish_newsletter_success', { page: 'newsletter' })
      } else {
        notification.error(data.message)
        logEvent('publish_newsletter_fail', { page: 'newsletter' })
      }
      goto(`/home/newsletter/manage`)
    }
    if (this.id) {
      updateNewsletter(this.id, draft).then(onSuccess)
    } else {
      publishNewsletter(draft).then(onSuccess)
    }
  }

  render() {
    const { canEdit, canRenderEmail, showPreview, draft, emailDraft, schedulePublish, scheduleTime, publishComfirmLoading,
      publishComfirmVisible, emailEditorVisible, lastSavedTime } = this.state
    const { content, title } = draft
    const { emailId, emailContent, emailSubject } = emailDraft

    return (
      <div className='newsletter'>
        {emailEditorVisible && <Modal
          visible={true}
          closable={false}
          centered
          footer={null}
          wrapClassName="email-editor"
          width={950}
          bodyStyle={{ minHeight: 500 }}
        >
          <div className='title'>
            <Input.TextArea
              autoSize={{
                minRows: 1,
                maxRows: 6,
              }}
              key={0}
              placeholder='Email Subject'
              value={emailSubject}
              onChange={this.onEmailSubjectChange}
            />
            <div className="title-count" key="title-count">
              {`${emailSubject.length}/${emailSubjectMax}`}
            </div>
          </div>

          <div>
            <Editor
              initialContent={emailContent}
              onChange={this.onWelcomeEditorChange}
              showNewsletterEmbed={true}
            />
          </div>
          <div className="scheduler-button-group">
            <button className="Button cancel-button" onClick={() => this.setState({ emailEditorVisible: false })}>
              Cancel
            </button>
            <button className="Button save-button" onClick={this.handleSaveWelcomeEmail}>
              Save as Welcome Email
            </button>
          </div>
        </Modal>}

        {canRenderEmail && <div className='Card welcome-email'>
          <div>
            <h2>Welcome Email</h2>
            <p>Set a default email to welcome your new subscribers</p>
          </div>
          <button className="Button create-button" onClick={() => this.setState({ emailEditorVisible: true })}>
            {emailId ? "Edit" : "Create"}
          </button>
        </div>}

        {showPreview &&
          <Preview
            title={title}
            content={this.preview}
            onClose={this.togglePreview}
          />
        }

        {publishComfirmVisible && <Modal
          visible={true}
          closable={false}
          centered
          footer={null}
          wrapClassName="newsletter-publish-comfirm"
          width={500}
          bodyStyle={{ height: 260 }}
        >
          <h3>Schedule your publishing</h3>
          <div className="scheduler-body">
            <Checkbox onChange={this.onSchedulePublishChange} checked={schedulePublish}>Schedule your sending</Checkbox>
            <DatePicker
              className="scheduler-datepicker"
              showTime={{ minuteStep: 5 }}
              onChange={this.onSetSchedule}
              format="MM/DD/YYYY h:mm A"
              showToday={false}
              showNow={false}
              value={scheduleTime}
            />
          </div>
          <div className="scheduler-button-group">
            <button className="Button cancel-button" onClick={() => this.setState({ publishComfirmVisible: false })}>
              Cancel
            </button>
            {schedulePublish ?
              <button className="Button publish-button" onClick={this.handlePublish} loading={publishComfirmLoading}>
                Schedule
              </button>
              :
              <button className="Button publish-button" onClick={this.handlePublish} loading={publishComfirmLoading}>
                Schedule to send now
              </button>
            }
          </div>
        </Modal>}
        <div className='Card post-container'>
          <div className='title'>
            {canEdit && [(
              <Input.TextArea
                autoSize={{
                  minRows: 1,
                  maxRows: 6,
                }}
                key={0}
                placeholder='Title'
                value={title}
                onChange={this.onTitleChange}
              />
            ), (
              <div className="title-count" key="title-count">
                {`${title.length}/${titleMax}`}
              </div>
            ),
            ]}
          </div>

          <div className='editor-container'>
            {canEdit &&
              <Editor
                initialContent={content}
                onChange={this.onEditorChange}
                showNewsletterEmbed={true}
                lastSavedTime={lastSavedTime}
              />
            }
          </div>
        </div>
        <div className="newsletter-button-group">
          <button className="Button draft-button" onClick={this.handleSaveAsDraft}>
            Save as draft
          </button>
          <button className="Button draft-button" onClick={this.togglePreview}>
            Preview
          </button>
          <button className="Button create-button" onClick={() => this.setState({ publishComfirmVisible: true })}>
            Ready to publish?
          </button>
        </div>
      </div>
    )
  }
}

export default compose(
  withAuth,
  withQuery,
  connect(
    ({ newsletter }) => newsletter,
    {
      fetchNewsletter,
      fetchWelcomeEmail,
      saveNewsletterDraft,
      updateNewsletterDraft,
      publishNewsletter,
      updateNewsletter,
      saveNewsletterWelcome,
      updateNewsletterWelcome,
    }
  )
)(CreateNewsletter)