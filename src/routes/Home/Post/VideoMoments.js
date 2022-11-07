import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import { Button, Input, Form } from 'antd'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";

import withAuth from 'hocs/withAuth'
import logEvent from 'utils/logEvent'
import api from 'utils/api'
import { notification } from 'components/Notification'
import { publishPost } from 'redux/post'
import { POST_STATUS } from 'constant/content'
import { ReactComponent as IconUpload } from 'asset/svg/upload-small.svg'
import UploadS3, { UPLOAD_STATE } from './components/UploadS3MultipartFile'
import UploadThumbnail from './components/UploadThumbnail'
import EditButtonsGroup from './components/EditButtonsGroup'

import './VideoPost.scss'

const SIZE_NUM_GB = 4; // number of gb
const SIZE_LIMIT = SIZE_NUM_GB * 1024 * 1024 * 1024 // max allowed size is 4 GB
const titleMax = 90
const defaultDraft = {
  covers: [],
  title: '',
  content: '',
  ugc_content: '',
  ugc_display_location: null,
  ugc_place_detail: null,
  ugc_user_tags: null,
  ugc_videos: [],
  status: POST_STATUS.DRAFT,
  word_count: 0,
  is_ugc: true,
}
const coverPhotoUrlBase = 'https://d7305srekmd8y.cloudfront.net/cover/'
const storageBase = 'creator/origin/'

const VideoMoments = (props) => {
  const { publishPost, goto, self } = props
  const [form] = Form.useForm()
  const [uploadStatus, setUploadStatus] = useState(UPLOAD_STATE.NONE)
  const [draft, setDraft] = useState(defaultDraft)
  const [showPublish, setShowPublish] = useState(false)
  const [coverImgSrc, setCoverImgSrc] = useState(require('asset/img/default-video.png'))
  const [coverImgText, setCoverImgText] = useState('Processing')
  const [defaultThumbnailSelected, setDefaultSelectedThumbnail] = useState(true)
  const [customizedThumbnailImgSrc, setCustomizedThumbnailImgSrc] = useState('')
  const [customizedThumbnailLocalImgSrc, setCustomizedThumbnailLocalImgSrc] = useState('')
  const [defaultThumbnailImgSrc, setDefaultThumbnailImgSrc] = useState(coverImgSrc)
  const [hasNewCustomThumbnail, setHasNewCustomThumbnail] = useState(false)
  const [videoFileId, setVideoFileId] = useState('')
  // used to save the s3 url of the generated thumbnail
  const [generatedThumbnailUrl, sestGeneratedThumbnailUrl] = useState('')

  useEffect(() => {
    logEvent('page_visit_start', { page: 'video-moments' })
    return () => {
      logEvent('page_visit_end', { page: 'video-moments' })
    }
  }, [])

  if (!self) {
    return null
  }

  const { media_id, enable_video_thumbnail } = self
  let coverUrl = ""
  let retryIntervalInSeconds = 3
  let maxTry = 600 / retryIntervalInSeconds;
  let retryTimes = maxTry

  const uploadProps = {
    name: 'file',
    className: 'video-upload',
    beforeUpload: (file) => {
      if (file.size > SIZE_LIMIT) {
        notification.error(`Upload failed: file size cannot exceed ${SIZE_NUM_GB} GB.`)
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

      let current_ugc_videos = draft.ugc_videos
      current_ugc_videos.push(file_id)
      setDraft({ ...draft, ugc_videos: current_ugc_videos })
      sestGeneratedThumbnailUrl(coverUrl)
      return storageBase + fn
    },
    onStart: () => {
      setUploadStatus(UPLOAD_STATE.LOADING)
    },
    onSuccess: () => {
      setUploadStatus(UPLOAD_STATE.DONE)
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
    setDraft({ ...draft, title })
  }

  const handleContentChange = (e) => {
    const desc = e.target.value
    const wordArray = desc.match(/\S+/g)
    setDraft({ ...draft, ugc_content: desc, word_count: wordArray ? wordArray.length : 0})
  }

  const handleAddressSelect = async value => {
    const results = await geocodeByAddress(value)
    if (!results) {
      setDraft({
        ...draft,
        ugc_place_detail: null
      })
      return
    }
    const latLng = await getLatLng(results[0])
    if (!latLng) {
      setDraft({
        ...draft,
        ugc_place_detail: null
      })
      return
    }

    const { data } = await api.get('/places/detail', { id: results[0].place_id })
    if (data.code === 0) {
      setDraft({ 
        ...draft,
        ugc_display_location: value,
        ugc_place_detail: {
          display_location: value,
          place_lat: latLng.lat,
          place_lng: latLng.lng,
          place_name: data.name,
          place_id: data.place_id,
          formatted_address: data.formatted_address,
        }
      })
    } else {
      setDraft({
        ...draft,
        ugc_place_detail: null
      })
    }
  }

  const handleAddressChange = value => {
    setDraft({ 
      ...draft,
      ugc_display_location: value,
    })
  }

  const handleTagsChange = (e) => {
    const tagString = e.target.value
    setDraft({ ...draft, ugc_user_tags: tagString })
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

  const handlePublish = (location = null, locationPid = null, isEvergreen = false) => {
    const newCovers = prepareCovers();
    draft.covers = newCovers;
    let ugcUserTags = []
    if (draft.ugc_user_tags) {
      const tagArray = draft.ugc_user_tags.match(/#(\w+)/g)
      tagArray.forEach(p => {
        ugcUserTags.push({ id: p, name: p })
      })
    }
    if (ugcUserTags.length < 3 || ugcUserTags.length > 10) {
      notification.error('Please enter valid tags (3-10) for your post')
      return
    }
    const post = {
      ...draft,
      ugc_user_tags: ugcUserTags,
      location,
      locationPid,
      isEvergreen,
    }
    logEvent('publish_button_click', { page: 'video-moments' })

    const cb = ({ value: { data } }) => {
      if (data.code === 0) {
        notification.success('Your post is being published')
        logEvent('publish_post_success', { page: 'video-moments' })
        goto('/home/content/post')
      } else {
        notification.error(data.message)
        logEvent('publish_post_fail', { page: 'video-moments' })
      }
    }
    publishPost(post).then(cb)
  }

  const validateDraft = () => {
    const { title, ugc_content, ugc_display_location, ugc_place_detail, word_count } = draft
    if (!title) {
      notification.error('Please enter title for your post')
      return false
    } else if (title.match('^[^a-z]*$')) {
      notification.error('All capital letters are not allowed in titles')
      return false
    }
    if (!ugc_content || word_count < 100) {
      notification.error('Please enter content for your post, min req: 100 words')
      return false
    }
    if (ugc_display_location && (!ugc_place_detail || !ugc_place_detail.display_location || ugc_place_detail.display_location !== ugc_display_location)) {
      notification.error('Please enter valid display location for your post')
      return false
    }
    if (uploadStatus !== UPLOAD_STATE.DONE) {
      notification.error('Video is not ready, cannot publish')
      return false
    }
    return true
  }

  const togglePublish = () => {
    // validate before show publish modal
    if (!showPublish && !validateDraft()) {
      return
    }
    if (showPublish) {
      logEvent('publish_button_click', { page: 'video-moments' })
    } else {
      logEvent('publish_modal_close')
    }
    setShowPublish(!showPublish)
  }

  const { title, ugc_content, ugc_display_location, ugc_user_tags, word_count } = draft
  return (
    <div className={cx('video-post', uploadStatus !== UPLOAD_STATE.NONE && 'hide-upload')}>
      <UploadS3 {...uploadProps}>
        <div className="dropzone">
          <img className="banner" src={require('asset/svg/upload-large.svg')} alt="upload your video" />
          <p className="ant-upload-text">Drag and drop your video file</p>
          <p>Upload only a square or landscape video with the height of more than 240p</p>
          <Button type="primary" className="Button">
            <IconUpload /> Browse to upload
          </Button>
        </div>
      </UploadS3>

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
            initialValues={{ title, ugc_content, ugc_display_location, ugc_user_tags, word_count }}
            layout="vertical"
          >
            <Form.Item>
              <div className="header">Video Moments</div>
            </Form.Item>
            <Form.Item name="title" label="Video title" rules={[{ required: true }]}>
              <Input.TextArea
                placeholder="Enter your video title here"
                value={title}
                maxLength={titleMax}
                showCount={true}
                rows={1}
                onChange={handleTitleChange}
              />
            </Form.Item>
            <Form.Item name="content" label="Video description" rules={[{ required: true }]}>
              <Input.TextArea
                placeholder="E.g., tell something about your video"
                value={ugc_content}
                autoSize={{ minRows: 5 }}
                onChange={handleContentChange}
              />
              <div>Words: {word_count}</div>
            </Form.Item>

            <Form.Item name="displayLocation" label="Display location">
              <div>Filling a location is required unless the content is not associated with a specific place</div>
              <PlacesAutocomplete
                value={ugc_display_location}
                onChange={handleAddressChange}
                onSelect={handleAddressSelect}
              >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                  <div>
                    <input {...getInputProps({ placeholder: "Point of interest, or address" })} style={{ width: '100%' }} value={ugc_display_location}/>
                    <div>
                      {loading ? <div>...loading</div> : null}
                      {suggestions.map(suggestion => {
                        const className = suggestion.active
                          ? 'suggestion-item--active'
                          : 'suggestion-item';
                        const style = suggestion.active
                          ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                          : { backgroundColor: '#ffffff', cursor: 'pointer' }

                        return (
                          <div {...getSuggestionItemProps(suggestion, { className, style })}>
                            <span>{suggestion.description}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
            </Form.Item>



            <Form.Item name="tag" label="Tags (req: 3-10 tags)" rules={[{ required: true }]}>
              <Input.TextArea
                placeholder="#lifestyle,#local"
                value={ugc_user_tags}
                rows={1}
                onChange={handleTagsChange}
              />
            </Form.Item>
            {enable_video_thumbnail &&
              <div className="thumbnail-panel">
                <div className='thumbnail-title'>Video thumbnail </div>
                <span>Upload an image that shows what's in your video or select the auto-generated thumbnail for your video.</span>
                <div className="thumbnail-container"  >
                  <UploadThumbnail videoId={videoFileId} uploadThumbnailProps={uploadThumbnailProps} defaultThumbnailSelected={defaultThumbnailSelected} onClick={handleSelect} existingImageUrl={customizedThumbnailImgSrc} />
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

      <EditButtonsGroup
        data={{
          title,
          ugc_content: '',
        }}
        showPublish={showPublish}
        onPublish={handlePublish}
        togglePublish={togglePublish}
        blockSaveAsDraft={true}
      />
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    ({ post }) => post,
    {
      publishPost,
    }
  ))(VideoMoments)
