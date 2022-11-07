import React, { useEffect, useRef, useState, Fragment } from 'react'
import { Modal, Button, Input, Form } from 'antd'
import { connect } from 'react-redux'

import { actions } from 'redux/editor'
import withAuth from '@/hocs/withAuth'
import ImageUploader from '@/components/ImageUploader'
import { TYPE_IMAGE } from '@/constant/content'
import { notification } from 'components/Notification'
import { Loading } from 'components/utils'
import logEvent from 'utils/logEvent'
import api from '@/utils/api'
import { createDecorator } from '../../utils/decorator'
import { applyImage } from '../../utils/operations'

import './Image.scss'
import { apiLogImageSearch } from '../ImageSearch/utils'
import { LOG_IMAGE_SEARCH_IMAGE_EDIT } from '../ImageSearch/constants'

const EDITOR_IMAGE_TYPE_UNSPLASH = 'unsplash'
const EDITOR_IMAGE_UTM_UNSPLASH = 'newsbreak_media_platform'

const getImageHTML = ({ src, caption, credit, externalUrl, type, metadata }) => {
  const imgProps = {
    key: 0,
    style: { width: "100%" },
    src,
    'data-credit': credit,
    'data-externalurl': externalUrl,
  }

  if (type === EDITOR_IMAGE_TYPE_UNSPLASH) {
    imgProps['data-type'] = type;
    imgProps['data-url'] = metadata ? metadata.profile_url : "#"
  }

  let creditEl = null
  if (credit) {
    if (type === EDITOR_IMAGE_TYPE_UNSPLASH) {
      creditEl = <span className="img-credit">
        {metadata ?
          <>
            <span>
              Photo By <a href={metadata.profile_url}>{credit}</a> on{' '}
            </span>
            <a href={`https://unsplash.com/?utm_source=${EDITOR_IMAGE_UTM_UNSPLASH}&utm_medium=referral`}>
              Unsplash
            </a>
          </> : credit
        }
      </span>
    } else {
      creditEl = <span className="img-credit">
        {externalUrl ? (<a href={externalUrl}>{credit}</a>) : credit}
      </span>
    }
  }

  return [
    <img alt={caption} {...imgProps} key={0} />,
    credit || caption ? <div key={1} className="img-subtitle">
      {caption && <span className="img-caption">{caption}</span>}
      {credit && creditEl}
    </div> : <Fragment key={1} />
  ]
}

export const ImageHTML = props => (
  <div className="img-wrapper">{getImageHTML(props)}</div>
)

const _Image = props => {
  const { src, caption, credit, externalUrl, block, type, metadata } = props
  const myIndex = 2 // image index
  const [hoverState, setHoverState] = useState(false)

  return (
    <div
      className="img-wrapper"
      onMouseOver={() => setHoverState(true)}
      onMouseLeave={() => setHoverState(false)}
    >
      {getImageHTML(props)}
      {hoverState && (
        <div
          className="edit-mask"
          onClick={e => {
            e.preventDefault()
            const newActiveToggle =
              props.editor.activeToggle !== myIndex ? myIndex : -1
            props.setActionToggle(newActiveToggle, block.key, {
              src,
              credit,
              externalUrl,
              caption,
              type,
              metadata
            })
          }}
        >
          Click to edit
        </div>
      )}
    </div>
  )
}

const Image = connect(({ editor }) => ({ editor }), { ...actions })(_Image)

export const ImageDecorator = createDecorator(TYPE_IMAGE, props => {
  const data = props.contentState.getEntity(props.entityKey).getData()
  return (
    <Image
      {...data}
      entityKey={props.entityKey}
      block={props.children[0].props.block}
    />
  )
})

const _ImageUploadModal = props => {
  const { editorState, onChange, onToggle, removeKey, data, self } = props
  const isCreator = self && self.is_creator
  const [isLoading, setLoading] = useState(false)
  const [step, setStep] = useState(
    data && data.step ? data.step : !removeKey ? 0 : 2
  )
  let src = data ? data.src : ''
  const imgBlob = useRef(null)
  const [credit, setCredit] = useState(data ? data.credit : '')
  const [caption, setCaption] = useState(data ? data.caption : '')
  const [externalUrl, setExternalUrl] = useState(data ? data.externalUrl : '')
  const [disableSave, setDisableSave] = useState(
    isCreator && !(data && data.credit)
  )

  useEffect(() => {
    logEvent('post_edit_image_upload_modal_open')
  }, [])

  const updateImage = () => {
    const imgConfig = {
      src,
      credit: (credit && credit.trim()) || '',
      caption: (caption && caption.trim()) || '',
      externalUrl: (externalUrl && externalUrl.trim()) || ''
    }
    if (data) {
      imgConfig.type = data.type
      imgConfig.metadata = data.metadata

      if (data.type) {
        apiLogImageSearch(LOG_IMAGE_SEARCH_IMAGE_EDIT, {
          type: data.type || undefined,
          img_uri: data.src || ''
        })
      }
    }
    const newEditorState = applyImage(
      editorState,
      imgConfig,
      removeKey
    )
    onChange(newEditorState)
    onClose()
  }

  const onClose = () => {
    logEvent('post_edit_image_upload_modal_close')
    onToggle && onToggle()

    //hack to remove body style
    setTimeout(() => {
      document.body.removeAttribute('style')
    }, 1000)
  }

  const getImageBlob = blob => {
    imgBlob.current = blob
    setStep(2)
  }

  const onFinish = () => {
    if (removeKey) {
      updateImage()
    } else if (data && data.skipSave) {
      updateImage()
    } else {
      setLoading(true)
      api
        .post(
          '/storage/uploadFile',
          { file: imgBlob.current },
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then(({ data: res }) => {
          if (res.code === 0) {
            src = res.data
            logEvent('post_edit_image_upload_done')
            updateImage()
          } else {
            logEvent('post_edit_image_upload_failure')
            notification.error(res.message || 'Failed to upload image.')
          }
          setLoading(false)
        })
    }
  }

  const handleCreditChange = e => {
    const val = e.target.value
    setCredit(val)
    if (isCreator) {
      setDisableSave(val.trim().length <= 0)
    }
  }

  return (
    <Modal
      onCancel={onClose}
      centered
      footer={null}
      width={740}
      wrapClassName={`toolbar-upload-img step-${step}`}
      destroyOnClose={true}
      maskClosable={false}
      visible={true}
    >
      {step === 2 && (
        <>
          <div className="image-info">
            {isLoading ? (
              <Loading />
            ) : (
              <Form
                layout="vertical"
                initialValues={{
                  'Image credit': credit,
                  'Image caption': caption,
                  'Image source URL': externalUrl,
                }}
              >
                <Form.Item name="Image caption" label="Image caption">
                  <Input
                    placeholder="enter a brief description of the image"
                    value={caption}
                    maxLength={140}
                    onChange={e => setCaption(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  name="Image credit"
                  label="Image credit"
                  rules={[{ required: isCreator }]}
                >
                  <Input
                    placeholder="e.g. (John Smith/Unsplash)"
                    value={credit}
                    maxLength={100}
                    onChange={handleCreditChange}
                  />
                </Form.Item>
                <Form.Item name="Image source URL" label="Image source URL">
                  <Input
                    value={externalUrl}
                    onChange={e => setExternalUrl(e.target.value)}
                  />
                </Form.Item>
              </Form>
            )}
          </div>

          {!isLoading && (
            <div className="buttons step-2">
              <Button className="Button Button-Light" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="primary"
                className="Button"
                disabled={disableSave}
                onClick={onFinish}
              >
                OK
              </Button>
            </div>
          )}
        </>
      )}

      {step < 2 && (
        <ImageUploader
          className="no-image upload"
          coverText="Click or drag an image over here to preview"
          previewWidth={680}
          allowReselect={false}
          sizeLimit={20000000}
          maxWidth={2048}
          maxHeight={2048}
          minWidth={201}
          minHeight={201}
          onUpload={getImageBlob}
          onCancel={onClose}
          onPreview={() => {
            if (step === 0) {
              setStep(1)
            }
          }}
          onError={({ code }) => {
            onClose()
            if (code === 1) {
              notification.error(
                'The selected image resolution is too low. Minimum pixel dimensions are 201 x 201.'
              )
            } else if (code === 2) {
              notification.error(
                'The selected image exceeds the size limit. Try uploading an image less than 20MB.'
              )
            } else {
              notification.error(
                'Upload error, please try again.'
              )
            }
          }}
        />
      )}
    </Modal>
  )
}

export const ImageUploadModal = withAuth(_ImageUploadModal)
