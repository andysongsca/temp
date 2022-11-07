import React, { useState } from 'react'
import { compose } from 'redux'
import { connect, useDispatch } from 'react-redux'
import { Input, Upload, Modal } from 'antd'
import { ReactComponent as IconAddImage } from 'asset/svg/circle-add-image.svg'

import withAuth from 'hocs/withAuth'
import logEvent from 'utils/logEvent'
import api from 'utils/api'
import { postMessage, getMessagesCount } from 'redux/circle'
import { notification } from 'components/Notification'

import './CreateMessage.scss'

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const contentMax = 500
const defaultPictureState = {
  previewVisible: false,
  previewImage: '',
  previewTitle: '',
}

const CreateMessage = (props) => {
  const dispatch = useDispatch();
  const { self, postMessage } = props
  const [message, setMessage] = useState("")
  const [picture, setPicture] = useState(defaultPictureState)
  const [fileList, setFileList] = useState([])

  const handleContentChange = (e) => {
    const content = e.target.value
    if (content.length > contentMax) {
      e.preventDefault()
      return;
    }
    setMessage(content)
  }

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
    setFileList(fileList)
  }

  const beforeUpload = file => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.addEventListener('load', event => {
      const _loadedImageUrl = event.target.result
      const image = document.createElement('img')
      image.src = _loadedImageUrl;
      image.addEventListener('load', () => {
        const { width, height } = image
        file.width = width
        file.height = height
      });
    });
    return true
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

  const handlePublish = () => {
    let pictureList = [];
    fileList.forEach(({ originFileObj }) => {
      pictureList.push({ url: originFileObj.url, width: originFileObj.width, height: originFileObj.height })
    })
    const draft = {
      message,
      circle_message_images: pictureList
    }

    const onSuccess = ({ value: { data } }) => {
      if (data.code === 0) {
        notification.success('Your message is published')
        logEvent('publish_message_success', { page: 'manage-circle' })
        setMessage("")
        setFileList([])
        dispatch(getMessagesCount())
      } else {
        notification.error(data.message)
        logEvent('publish_message_fail', { page: 'manage-circle' })
      }
    }
    postMessage(draft).then(onSuccess)
  }

  const uploadButton = (
    <div className="create-message-upload">
      <IconAddImage className="creator-message-upload-icon" />
      <span className="create-message-upload-text">Add Image</span>
    </div>
  )

  const { icon } = self
  const { previewVisible, previewImage, previewTitle } = picture

  return (
    <div className="circle-container circle-content create-message">
      <img src={icon} alt="" className="creator-image" />
      <div className="create-message-detail">
        <Input.TextArea
          bordered={false}
          className="create-message-info"
          placeholder="Send a message to your Circle now!"
          value={message}
          maxLength={contentMax}
          showCount={true}
          autoSize={{ minRows: 1, maxRows: 4 }}
          onChange={handleContentChange}
        />

        <div className="create-message-footer">
          <Upload
            className="create-message-image"
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handlePictureChange}
            onPreview={handlePicturePreview}
            customRequest={handleUploadPictures}
          >
            {fileList.length < 1 && uploadButton}
          </Upload>
          <Modal
            visible={previewVisible}
            title={previewTitle}
            footer={null}
            onCancel={handlePictureCancel}
          >
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
          <button
            className="Button create-message-button"
            onClick={handlePublish}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    null,
    { postMessage, getMessagesCount },
  ))(CreateMessage)