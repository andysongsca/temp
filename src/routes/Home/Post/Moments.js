import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Input, Form, Upload, Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";

import withAuth from 'hocs/withAuth'
import logEvent from 'utils/logEvent'
import api from 'utils/api'
import { POST_STATUS } from 'constant/content'
import { publishPost } from 'redux/post'
import { notification } from 'components/Notification'
import EditButtonsGroup from './components/EditButtonsGroup'

const titleMax = 90
const defaultPictureState = {
  previewVisible: false,
  previewImage: '',
  previewTitle: '',
  fileList: [],
}
const defaultDraftState = {
  title: '',
  covers: [],
  ugc_content: '',
  location: null,
  ugc_display_location: null,
  ugc_place_detail: null,
  ugc_user_tags: null,
  ugc_images: [],
  status: POST_STATUS.DRAFT,
  is_ugc: true,
  word_count: 0,
}
function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const Moments = (props) => {
  const { publishPost } = props
  const [form] = Form.useForm()
  const [showPublish, setShowPublish] = useState(false)
  const [picture, setPicture] = useState(defaultPictureState)
  const [draft, setDraft] = useState(defaultDraftState)

  useEffect(() => {
    logEvent('page_visit_start', { page: 'moments' })
    return () => {
      logEvent('page_visit_end', { page: 'moments' })
    }
  }, [])

  const handlePictureCancel = () => {
    setPicture({ ...picture, previewVisible: false });
  }

  const handlePicturePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPicture({
      ...picture,
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  }

  const handlePictureChange = ({ fileList }) => {
    setPicture({ ...picture, fileList })
  }

  const checkImageWH = (file, width, height) => {
    return new Promise(function (resolve, reject) {
        let filereader = new FileReader()
        filereader.onload = e => {
          let src = e.target.result
          const image = new Image()
          image.onload = function () {
            if ((width && this.width < width) || (height && this.height < height)) {
              notification.error('Min height/width requirement is 600')
              reject()
            } else {
              file.width = this.width;
              file.height = this.height;
              resolve()
            }
          };
          image.onerror = reject
          image.src = src
        };
        filereader.readAsDataURL(file)
    });
  }

  const beforeUpload = file => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      notification.error('Only allow JPG/PNG file.');
    }
    return isJpgOrPng && checkImageWH(file, 600, 600)
  };

  const handleUploadPictures = async ({ file, onSuccess }) => {
    api.post('/storage/uploadFile',
      { file },
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ).then(({ data }) => {
      if (data.code === 0) {
        file.url = data.data
        setTimeout(() => {
          onSuccess("ok")
        }, 0)
      }
    })
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

  const validateDraft = () => {
    const { title, ugc_content, ugc_display_location, ugc_place_detail, word_count } = draft
    if (!title) {
      notification.error('Please enter title for your post')
      return false
    } else if (title.match('^[^a-z]*$')) {
      notification.error('All capital letters are not allowed in titles')
      return false
    } else if (!ugc_content || word_count < 100) {
      notification.error('Please enter content for your post, min req: 100 words')
      return false
    } else if (ugc_display_location && (!ugc_place_detail || !ugc_place_detail.display_location || ugc_place_detail.display_location !== ugc_display_location)) {
      notification.error('Please enter valid display location for your post')
      return false
    }
    return true
  }

  const togglePublish = () => {
    if (!showPublish && !validateDraft()) {
      return
    }

    if (showPublish) {
      logEvent('publish_button_click', { page: 'moments' })
    } else {
      logEvent('publish_modal_close')
    }
    setShowPublish(!showPublish)
  }

  const handlePublish = (location = null, locationPid = null, isEvergreen = true) => {
    let pictureList = []
    let covers = []
    let content = ""
    if (picture.fileList.length === 0) {
      notification.error('Please add images for your post')
      return
    }
    picture.fileList.forEach(({ originFileObj }) => {
      if (!originFileObj.url) {
        notification.error('Please wait for image uploading')
        return
      }
      pictureList.push({ url: originFileObj.url, width: originFileObj.width, height: originFileObj.height })
      content += "<figure><img style=\"width:100%\" src=\"" + originFileObj.url + "\" alt=\"\" /></figure><p></p>"
    })
    content += "<p>" + draft.ugc_content.replaceAll("\n", "</p><p>") + "</p>"
    covers.push(pictureList[0].url)

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
      content,
      covers,
      ugc_images: pictureList,
      ugc_user_tags: ugcUserTags,
      location,
      locationPid,
      isEvergreen,
    }

    logEvent('publish_button_click', { page: 'moments' })

    const onSuccess = ({ value: { data } }) => {
      if (data.code === 0) {
        notification.success('Your post is published')
        logEvent('publish_post_success', { page: 'moments' })
      } else {
        notification.error(data.message)
        logEvent('publish_post_fail', { page: 'moments' })
      }
    }
    publishPost(post).then(onSuccess)
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const { title, ugc_content, ugc_display_location, ugc_user_tags, word_count } = draft
  const { previewVisible, previewImage, fileList, previewTitle } = picture

  return (
    <div>
      <Form
        form={form}
        initialValues={{ title, ugc_content, ugc_display_location, ugc_user_tags }}
        layout="vertical"
      >
        <Form.Item>
          <h2>Moments</h2>
        </Form.Item>
        <Form.Item name="photo" label="Step 1: upload pictures (req: at least 1 pic)" rules={[{ required: true }]}>
          <span style={{paddingLeft: '10px'}}>Choose your cover image first, add multiple images to get more views.</span>
          <Upload
            listType="picture-card"
            defaultFileList={fileList}
            beforeUpload={beforeUpload}
            onPreview={handlePicturePreview}
            onChange={handlePictureChange}
            customRequest={handleUploadPictures}
            multiple={true}
          >
            {fileList.length >= 9 ? null : uploadButton}
          </Upload>
          <Modal
            visible={previewVisible}
            title={previewTitle}
            footer={null}
            onCancel={handlePictureCancel}
          >
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </Form.Item>
        <Form.Item name="title" label="Step 2: title" rules={[{ required: true }]}>
          <Input.TextArea
            placeholder="Enter your title here"
            value={title}
            maxLength={titleMax}
            showCount={true}
            rows={1}
            onChange={handleTitleChange}
          />
        </Form.Item>
        <Form.Item name="content" label="Step 3: content (req: at least 100 words)" rules={[{ required: true }]}>
          <Input.TextArea
            placeholder="E.g., tell something about your pictures"
            value={ugc_content}
            autoSize={{ minRows: 5 }}
            onChange={handleContentChange}
          />
          <div>Words: {word_count}</div>
        </Form.Item>
        <Form.Item name="displayLocation" label="Step 4: display location">
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
        <Form.Item name="tag" label="Step 5: tags (req: 3-10 tags)" rules={[{ required: true }]}>
          <Input.TextArea
            placeholder="#lifestyle,#local"
            value={ugc_user_tags}
            rows={1}
            onChange={handleTagsChange}
          />
        </Form.Item>
      </Form>

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
  ))(Moments)