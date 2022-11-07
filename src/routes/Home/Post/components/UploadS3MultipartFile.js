import React, { useState } from 'react'
import Axios from 'axios'
import cx from 'classnames'
import { Upload, Progress } from 'antd'
import { notification } from 'components/Notification'
import api from 'utils/api'

const FILE_CHUNK_SIZE = 5 * 1024 * 1024
const BATCH_COUNT = 5

export const UPLOAD_STATE = {
  NONE: 0,
  LOADING: 1,
  DONE: 2,
  FAILED: -1
}

const loadVideo = file => new Promise((resolve, reject) => {
  try {
      let video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = function () {
          resolve(this)
      }
      video.onerror = function () {
          reject("Invalid video. Please select a video file.")
      }
      video.src = window.URL.createObjectURL(file)
  } catch (e) {
      reject(e)
  }
})

const UploadS3MultipartFile = (props) => {
  const { children,
    className,
    beforeUpload,
    customFilename,
    onStart,
    onSuccess,
  } = props
  const [percent, setPercent] = useState(-1)
  const [originalFilename, setOriginalFilename] = useState('')
  const [uploadState, setUploadState] = useState(UPLOAD_STATE.NONE)

  const customRequest = async ({ file }) => {
    const video = await loadVideo(file)
    const duration = video ? video.duration : 0
    if (duration > 3600) {
      notification.error(`Upload failure: video duration must be under 1 hour.`)
      return false
    }
    // prepare multiparts
    onStart(file)
    setUploadState(UPLOAD_STATE.LOADING)
    const axios = Axios.create()
    delete axios.defaults.headers.put['Content-Type']
    const partCount = Math.ceil(file.size / FILE_CHUNK_SIZE)
    const mimeType = file.type
    const filename = customFilename ? customFilename(file.name) : file.name
    setOriginalFilename(file.name)
    const { data } = await api.get('/s3upload/init', { filename, mimeType, partCount })
    const { data: { UploadId, urls } } = data
    setPercent(0)
    const details = {
      "status": "started"
    }
    api.put('/add_video_upload_logs', {
      UploadId,
      details
    })
    // track progress
    let partsDone = 0
    const updateProgess = resp => {
      if (resp.status === 200) {
        ++partsDone
        const percent = Math.floor(Math.round((partsDone * 100) / keys.length))
        setPercent(percent)
        const details = {
          "status": percent + "%"
        }
        api.put('/add_video_upload_logs', {
          UploadId,
          details
        })
      }
      return resp
    }

    // upload multiparts
    const keys = Object.keys(urls)
    let promises = []
    const numOfParts = keys.length
    let curIndex = 1
    let res = []
    while (curIndex <= numOfParts) {
      const batchCount = Math.min(numOfParts - curIndex + 1, BATCH_COUNT)
      for (let i = 0; i < batchCount; i++) {
        // url index starts with 1 whereas file slice should start with 0
        const urlIndex = curIndex + i;
        const index = urlIndex - 1;
        const start = index * FILE_CHUNK_SIZE
        const blob = index < keys.length ? file.slice(start, start + FILE_CHUNK_SIZE) : file.slice(start)
        promises.push(axios.put(urls[urlIndex], blob, {
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }).then(updateProgess))
      }
      // complete multipart upload
      const rets = await Promise.all(promises)
      res.push.apply(res, rets)
      curIndex += batchCount
      // clear the list for next batch
      promises = []
    }

    const Parts = res.map((part, i) => ({
      ETag: part.headers.etag,
      PartNumber: i + 1
    }))
    api.put('/s3upload/complete', {
      filename,
      UploadId,
      Parts
    }).then(() => {
      onSuccess(file)
      setUploadState(UPLOAD_STATE.DONE)
      setPercent(100)
      const details = {
        "status": "complete"
      }
      api.put('/add_video_upload_logs', {
        UploadId,
        details
      })
    })
  }

  const uploadProps = {
    className,
    showUploadList: false,
    beforeUpload,
    customRequest,
    accept: ".mov, .mp4, .webm, .mkv, .avi, .mpeg, .m2ts",
  }

  return (
    <>
      <Upload.Dragger {...uploadProps}>
        {children}
      </Upload.Dragger>

      {uploadState !== UPLOAD_STATE.NONE &&
        <div className={cx('upload-status', uploadState !== UPLOAD_STATE.LOADING && 'done')}>
          <div className="progress">
            {percent > -1 && <Progress percent={percent} showInfo={false} strokeColor='#FF5A5A' trailColor='#F2F2F2' strokeWidth={4} />}
          </div>
          <div className="header">
            {percent < 0 ?
              <span>Prepare to upload file <b>{originalFilename}</b> ...</span> : percent === 100 ?
                <span>File <b>{originalFilename}</b> is uploaded successfully.</span> :
                <span>File <b>{originalFilename}</b> is being uploaded: <b>{percent}%</b> done ...</span>
            }
          </div>
          <div className="warning">
            <div>Do not leave this page until the video is fully uploaded.</div>
            <span>Otherwise you will lose the content.</span>
          </div>
        </div>
      }
    </>
  )
}

export default UploadS3MultipartFile
