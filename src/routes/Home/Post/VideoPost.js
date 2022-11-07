import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import { Button, Input, Form } from 'antd'

import withAuth from 'hocs/withAuth'
import withQuery from 'hocs/withQuery'
import logEvent from 'utils/logEvent'
import { notification } from 'components/Notification'
import { ModalContext } from 'components/Creator'
import { createDraft, updateDraft, publishPost, updatePost, fetchPost, getPostRejectedReason } from 'redux/post'
import { POST_STATUS } from 'constant/content'
import { ReactComponent as IconUpload } from 'asset/svg/upload-small.svg'
import UploadS3, { UPLOAD_STATE } from './components/UploadS3MultipartFile'
import UploadThumbnail from './components/UploadThumbnail'
import EditButtonsGroup from './components/EditButtonsGroup'
import { requirementRejectMap, policyRejectMap, newContenPolicyAndRequirementMap, editorialStandardsMap, nativeVideoPolicyMap } from 'utils/utilities'

import './VideoPost.scss'

const SIZE_NUM_GB = 4; // number of gb
const SIZE_LIMIT = SIZE_NUM_GB * 1024 * 1024 * 1024 // max allowed size is 4 GB
const titleMax = 100
const descMax = 1000
const defaultDraft = {
  covers: [],
  title: '',
  content: '',
  origin_video_url: '',
  video_description: '',
  status: POST_STATUS.DRAFT,
}
const defaultRejectReason = {
  reason: 'default',
  details: '',
}
const urlBase = 'https://d7305srekmd8y.cloudfront.net/origin/'
const coverPhotoUrlBase = 'https://d7305srekmd8y.cloudfront.net/cover/'
const storageBase = 'creator/origin/'
// hack solution to resolve jump to new vpost from a
let lastId = '';

const VideoPost = (props) => {
  const {
    createDraft,
    updateDraft,
    publishPost,
    updatePost,
    fetchPost,
    goto,
    post,
    isFetchPostPending,
    match: { params: { id = null } },
    getPostRejectedReason,
    self
  } = props
  const [form] = Form.useForm()
  const [uploadStatus, setUploadStatus] = useState(UPLOAD_STATE.NONE)
  const [draft, setDraft] = useState(defaultDraft)
  const [postId, setPostId] = useState(id)
  const [showPublish, setShowPublish] = useState(false)
  const [changed, setChanged] = useState(false)
  const [coverImgSrc, setCoverImgSrc] = useState(require('asset/img/default-video.png'))
  const [coverImgText, setCoverImgText] = useState('Processing')
  const context = React.useContext(ModalContext)
  const [defaultThumbnailSelected, setDefaultSelectedThumbnail] = useState(true)
  const [customizedThumbnailImgSrc, setCustomizedThumbnailImgSrc] = useState('')
  const [customizedThumbnailLocalImgSrc, setCustomizedThumbnailLocalImgSrc] = useState('')
  const [defaultThumbnailImgSrc, setDefaultThumbnailImgSrc] = useState(coverImgSrc)
  const [hasNewCustomThumbnail, setHasNewCustomThumbnail] = useState(false)
  const [videoFileId, setVideoFileId] = useState('')
  // used to save the s3 url of the generated thumbnail
  const [generatedThumbnailUrl, sestGeneratedThumbnailUrl] = useState('')
  const [rejectedReason, setRejectedReason] = useState(defaultRejectReason)

  const { media_id, enable_video_thumbnail, internal_writer, is_journalist, is_creator } = self
  let coverUrl = ''
  let retryIntervalInSeconds = 3
  let maxTry = 600 / retryIntervalInSeconds;
  let retryTimes = maxTry

  useEffect(() => {
    logEvent('page_visit_start', { page: 'new-video-post' })
    if (id) {
      fetchPost(id)
    } else {
      // hack
      if (lastId) {
        window.location.reload();
      }
    }
    lastId = id;
    return () => {
      logEvent('page_visit_end', { page: 'new-video-post' })
    }
  }, [id])

  useEffect(() => {
    // if existing post, load its content
    if (!id || isFetchPostPending || !post || post.post_id.toString() !== id || !self) {
      return
    }
    if (uploadStatus !== UPLOAD_STATE.DONE) {
      setUploadStatus(UPLOAD_STATE.DONE)
      setDraft(post)
      if (post && post.covers && post.covers.length > 0) {
        setCoverImgSrc(post.covers[0])
        setDefaultThumbnailImgSrc(post.covers[0])
        setCoverImgText('')
        if (post.covers.length > 1) {
          setDefaultThumbnailImgSrc(post.covers[1])
          sestGeneratedThumbnailUrl(post.covers[1])
          if (post.covers.length > 2) {
            setCustomizedThumbnailImgSrc(post.covers[2])
            if (post.covers[0] === post.covers[2]) {
              setDefaultSelectedThumbnail(false)
            }
          }
        }
      }
    }

  }, [id, isFetchPostPending, post, uploadStatus])

  useEffect(() => {
    if (!id || isFetchPostPending || !post || post.post_id.toString() !== id || !self) {
      return
    }
    // fetch rejected reason if post is in rejected state
    if ((post.status === POST_STATUS.POSTED || post.status === POST_STATUS.POSTED_DRAFT)
    && post.doc_id && is_creator) {
    getPostRejectedReason(post.doc_id).then((res) => {
      console.log('got reject reason', res)
      if (res && res.value && res.value.data) {
        // translate the rejected reason to external facing reason
        // if error cannot be surfaced, we will show a default message
        let reason = res.value.data.title
        let violationType = ""
        let postStatus = ""
        const is_strike = self.violations && self.violations.doc_ids &&
          self.violations.doc_ids.includes(post.doc_id)
        if (reason && post.audit_status !== 0) {
          if (reason in policyRejectMap && is_strike) {
            reason = "Received a strike"
            postStatus = "remove"
            violationType = "policy"
          } else if (reason in requirementRejectMap) {
            reason = requirementRejectMap[reason]
            violationType = "content"
            postStatus = "remove"
          } else if (reason in newContenPolicyAndRequirementMap) {
            reason = newContenPolicyAndRequirementMap[reason]
            violationType = "content"
            postStatus = "remove"
          }  else if (reason in nativeVideoPolicyMap) {
            reason = nativeVideoPolicyMap[reason]
            violationType = "content"
            postStatus = "remove"
          } else if (reason in editorialStandardsMap) {
            reason = editorialStandardsMap[reason]
            violationType = "editorial"
            postStatus = "drop"
          }
        }
        else {
          violationType = "none"
          postStatus = "online"
        }
        setRejectedReason({ reason: reason, details: res.value.data.details, type: violationType, post_status: postStatus })
      }
    })
    }
  }, [id, post, is_creator, self])


  if (!self || (id && (isFetchPostPending || !post || post.post_id.toString() !== id))) {
    return null
  }

  const uploadProps = {
    name: 'file',
    className: 'video-upload',
    beforeUpload: (file) => {
      if (file.size > SIZE_LIMIT) {
        notification.error(`Upload failure: file size cannot exceed ${SIZE_NUM_GB} GB.`)
        return false
      }
      return true
    },
    customFilename: (filename) => {
      // extract extension
      const index = filename.lastIndexOf('.')
      const ext = index > -1 ? filename.substr(index) : ''
      let file_id = `${media_id}_${parseInt(Date.now() / 1000).toString()}`
      setVideoFileId(file_id)
      let fn = file_id + `_origin${ext}`
      let photo_fn = file_id + '_cover.jpg'
      coverUrl = coverPhotoUrlBase + photo_fn
      setDraft({ ...draft, origin_video_url: urlBase + fn })
      sestGeneratedThumbnailUrl(coverUrl)
      return storageBase + fn
    },
    onStart: () => {
      setUploadStatus(UPLOAD_STATE.LOADING)
      setChanged(true)
    },
    onSuccess: () => {
      setUploadStatus(UPLOAD_STATE.DONE)
      setChanged(true)
      setTimeout(() => {
        setCoverImgText('')
        setCoverImgSrc(coverUrl)
        setDefaultThumbnailImgSrc(coverUrl)
      }, retryIntervalInSeconds * 1000);
    },
    onError: () => {
      setUploadStatus(UPLOAD_STATE.FAILED)
    },
  }

  const uploadThumbnailProps = {
    onUploading: (local_url) => {
      setDefaultSelectedThumbnail(false)
      setCustomizedThumbnailLocalImgSrc(local_url)
      setHasNewCustomThumbnail(true)
      setCoverImgSrc(local_url)
    },
    onSuccess: (s3_url) => {
      setDefaultSelectedThumbnail(false)
      setCustomizedThumbnailImgSrc(s3_url)
      setHasNewCustomThumbnail(true)
    },
  }

  const handleTitleChange = (e) => {
    const title = e.target.value
    if (title.length > titleMax) {
      e.preventDefault()
      return
    }
    setDraft({ ...draft, title })
    setChanged(true)
  }

  const handleDescChange = (e) => {
    const desc = e.target.value
    if (desc.length > descMax) {
      e.preventDefault()
      return;
    }
    setDraft({ ...draft, video_description: desc })
    setChanged(true)
  }

  const handleImageLoadingError = (e) => {
    if (--retryTimes >= 0) {
      const originalUrl = e.target.src;
      setTimeout(() => {
        setCoverImgText('')
        setDefaultThumbnailImgSrc(originalUrl)
        setCoverImgSrc(originalUrl)
      }, retryIntervalInSeconds * 1000);
    }
    setCoverImgText('Processing')
    setCoverImgSrc(require('asset/img/default-video.png'))
    setDefaultThumbnailImgSrc(require('asset/img/default-video.png'))
  }

  const save = () => {
    setChanged(false)
  }

  const handleSaveAsDraft = () => {
    if (!(id || uploadStatus === UPLOAD_STATE.DONE)) {
      notification.error('Video is not ready, cannot save the draft')
      return
    }
    logEvent('save_draft_button_click', { page: 'new-video-post' })

    const cb = ({ value: { data } }) => {
      if (data.code === 0) {
        if (!postId) {
          setPostId(data.data)
        }
        notification.success('Your draft is saved')
        logEvent('save_draft_success', { page: 'new-video-post' })
        save()
      } else {
        notification.error(data.message)
        logEvent('save_draft_fail', { page: 'new-video-post' })
      }
    }
    const newCovers = prepareCovers();
    draft.covers = newCovers;
    if (postId) {
      updateDraft(postId, draft, draft.status !== POST_STATUS.DRAFT).then(cb)
    } else {
      createDraft(draft).then(cb)
    }
  }

  const prepareCovers = () => {
    let newCovers = []
    newCovers[0] = defaultThumbnailSelected ? generatedThumbnailUrl : customizedThumbnailImgSrc
    if (generatedThumbnailUrl !== "") {
      newCovers[1] = generatedThumbnailUrl;
    }
    if (customizedThumbnailImgSrc !== "") {
      newCovers[2] = customizedThumbnailImgSrc
    }
    return newCovers
  }

  const handleSelect = () => {
    if (hasNewCustomThumbnail) {
      setCoverImgSrc(customizedThumbnailLocalImgSrc)
      setDefaultSelectedThumbnail(false)
    }
    else if (customizedThumbnailImgSrc !== '') {
      const timestamp = Date.now();
      const newUrl = customizedThumbnailImgSrc + "?t=" + timestamp
      setCoverImgSrc(newUrl)
      setDefaultSelectedThumbnail(false)
    }

  }

  const handlePublish = (publishData) => { // mp_tags_manual, location, locationPid, isEvergreen, schedule_time
    const newCovers = prepareCovers();
    draft.covers = newCovers;
    const post = {
      ...draft,
      ...publishData,
    }
    logEvent('publish_button_click', { page: 'new-video-post' })

    const cb = ({ value: { data } }) => {
      if (data.code === 0) {
        if (!postId) {
          setPostId(data.data)
        }
        save()
        notification.success('Your post is being published')
        logEvent('publish_post_success', { page: 'new-video-post' })
        goto('/home/content/post')
      } else {
        notification.error(data.message)
        logEvent('publish_post_fail', { page: 'new-video-post' })
      }
    }
    if (postId) {
      updatePost(postId, post).then(cb)
    } else {
      publishPost(post).then(cb)
    }
  }

  const validateDraft = () => {
    if (!draft.title) {
      notification.error('Please enter title for your post.')
      return false
    } else if (/\r|\n/.exec(title)) {
      notification.error('Please remove any line breaks from titles.')
      return false
    } else if (draft.title.match('^[^a-z]*$')) {
      notification.error('All capital letters are not allowed in titles.')
      return false
    } else if (!(id || uploadStatus === UPLOAD_STATE.DONE)) {
      notification.error('Video is not ready, cannot publish.')
      return false
    }
    return true
  }

  const togglePublish = () => {
    // show policy if not agreed, uncomment below on 8/1
    if (context.openMonetizationModal()) {
      return
    }
    // validate before show publish modal
    if (!showPublish && !validateDraft()) {
      return
    }
    if (showPublish) {
      logEvent('publish_button_click', { page: 'new-video-post' })
    } else {
      logEvent('publish_modal_close')
    }
    setShowPublish(!showPublish)
  }

  const { title, video_description, mp_tags_manual, location, status, schedule_time } = draft
  const showRejectReason = post && post.audit_status === 3
  const violation_type = rejectedReason && rejectedReason.type
  const post_status = rejectedReason && rejectedReason.post_status
  return (
    <div className={cx('video-post', uploadStatus !== UPLOAD_STATE.NONE && 'hide-upload')}>
      {!id && <UploadS3 {...uploadProps}>
        <div className="dropzone">
          <img className="banner" src={require('asset/svg/upload-large.svg')} alt="upload your video" />
          <p className="ant-upload-text">Drag and drop your video file</p>
          <p>Upload only a square or landscape video with the height of more than 240p</p>
          <Button type="primary" className="Button">
            <IconUpload /> Browse to upload
          </Button>
        </div>
      </UploadS3>}

      {(id || uploadStatus === UPLOAD_STATE.DONE) && !showRejectReason && <div className="upload-status"></div>}
      {rejectedReason && violation_type === "content" && <div className={post_status !== 'remove' ? "warning" : "error"}>
        <div>{"Changes Needed: " + rejectedReason.reason}</div>
        {rejectedReason.details && <p>{rejectedReason.details}</p>}
        <p>Please review our
          <a href="https://creators.newsbreak.com/creator-content-policy" rel="noopener noreferrer" target="_blank"> Content Policy</a> and
          <a href="https://creators.newsbreak.com/creator-content-requirements" rel="noopener noreferrer" target="_blank"> Requirements</a>.  </p>
        <p> If you need assistance, please email us. </p>
      </div>}
      {rejectedReason && violation_type === "editorial" && <div className="warning">
        <div>{"Editor feedback: " + rejectedReason.reason}</div>
        {rejectedReason.details && <p>{rejectedReason.details}</p>}
        <p>Please review our
          <a href="https://creators.newsbreak.com/contributor-editorial-standards" rel="noopener noreferrer" target="_blank"> Editorial Standards and Guidelines</a>.
        </p>
        <p> If you need assistance, please email us. </p>
      </div>}
      {rejectedReason && violation_type === "policy" && <div className="error">
        <div>Received a strike</div>
        {rejectedReason.details && <p>{rejectedReason.details}</p>}
        <p>
          This violates our  <b>{rejectedReason.reason}</b> policy. Please review our
          <a href="https://www.newsbreak.com/community-policy" rel="noopener noreferrer" target="_blank"> Content Policy</a> and
          <a href="https://creators.newsbreak.com/creator-content-requirements" rel="noopener noreferrer" target="_blank"> Requirements</a>.  </p>
          <p>  If you think we made a mistake, you can appeal this decision under <a href="/home/content/strike" rel="noopener noreferrer" target="_blank">Strike Management</a>.</p>
      </div>}
      {rejectedReason && rejectedReason.details && violation_type === "none" && <div className="warning">
        <div>Editor feedback</div>
        {rejectedReason.details && <p>{rejectedReason.details}</p>}
        <p>Please review our
          <a href="https://creators.newsbreak.com/contributor-editorial-standards" rel="noopener noreferrer" target="_blank"> Editorial Standards and Guidelines</a>.
        </p>
        <p> If you need assistance, please email us. </p>
      </div>}
      <div className="video-info">

        <div className="cover-container">
          <div className="div-container">
            <img src={coverImgSrc} alt="cover" onError={handleImageLoadingError} />
            <div className="center-text">{coverImgText}</div>
          </div>
        </div>
        <div className="video-details">
          <Form
            form={form}
            // initialValues={{ title, video_description }}
            layout="vertical"
          >
            <Form.Item>
              <div className="header">New video details</div>
            </Form.Item>
            <Form.Item label="Video title" rules={[{ required: true }]}>
              <Input.TextArea
                placeholder="Enter your video title here"
                value={title}
                maxLength={titleMax}
                showCount={true}
                rows={1}
                onChange={handleTitleChange}
              />
            </Form.Item>
            <Form.Item label="Video description">
              <Input.TextArea
                placeholder="E.g., tell something about your video"
                value={video_description}
                maxLength={descMax}
                showCount={true}
                autoSize={{ minRows: 5 }}
                onChange={handleDescChange}
              />
            </Form.Item>
            {enable_video_thumbnail &&
              <div className="thumbnail-panel">
                <div className='thumbnail-title'>Video thumbnail </div>
                <span>Upload an image that shows what's in your video or select the auto-generated thumbnail for your video.</span>
                <div className="thumbnail-container"  >
                  <UploadThumbnail videoId={id !== null ? id : videoFileId} uploadThumbnailProps={uploadThumbnailProps} defaultThumbnailSelected={defaultThumbnailSelected} onClick={handleSelect} existingImageUrl={customizedThumbnailImgSrc} />
                  <div className={cx('default-thumbnail-container', !defaultThumbnailSelected && 'gray-out', defaultThumbnailSelected && 'selected')}>
                    <img className={cx('default-thumbnail-cover')} src={defaultThumbnailImgSrc} alt="cover" onError={handleImageLoadingError} onClick={() => { setDefaultSelectedThumbnail(true); setCoverImgSrc(defaultThumbnailImgSrc); }} />
                    <div className="center-text-cover">{coverImgText}</div>
                  </div>
                  <div className="default-thumbnail-container-cover" />
                </div>
                <div className='thumbnail-desc-panel'>
                  <div className='custom-thumbnail-desc'>Upload an image ( JPG, PNG & GIF with the file size of no more than 2MB)</div>
                  <div className='default-thumbnail-desc'>Select auto-generated thumbnail</div>
                </div>
              </div>}
          </Form>
        </div>
      </div>

      {status === POST_STATUS.SCHEDULED && <div className="scheduled-time">Scheduled to be published at {(new Date(schedule_time)).toLocaleString()}</div>}

      <EditButtonsGroup
        data={{
          title,
          content: '',
          isChanged: changed,
          mp_tags_manual: is_creator ? (mp_tags_manual || []) : null,
          location,
          schedule_time,
          internal_writer,
          is_journalist,
        }}
        showPublish={showPublish}
        onPublish={handlePublish}
        onSaveAsDraft={handleSaveAsDraft}
        togglePublish={togglePublish}
      />

    </div>
  )
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
      getPostRejectedReason,
    }
  ))(VideoPost)