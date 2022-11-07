import React, { useState } from 'react'
import { Upload } from 'antd';
import Axios from 'axios'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { notification } from 'components/Notification'
import api from 'utils/api'
import cx from 'classnames'

const THUMBNAIL_FOLDER = 'creator/origin_custom_cover/'
const urlBase = 'https://d7305srekmd8y.cloudfront.net/origin_custom_cover/'

export const UPLOAD_STATE = {
    NONE: 0,
    LOADING: 1,
    DONE: 2,
    FAILED: -1
}

export const THUMBNAIL_FILE_TYPE = [
    'image/jpeg',
    'image/png',
    'image/gif',
]


function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    })
}

function loadImgAsync(imgSrc) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.onerror = reject;
        img.src = imgSrc;
    })
}

function beforeUpload(file) {
    const is_image_file = THUMBNAIL_FILE_TYPE.indexOf(file.type) > -1;
    if (!is_image_file) {
        notification.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        notification.error('Image must smaller than 2MB!');
    }
    return is_image_file && isLt2M;
}

function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}


const UploadThumbnail = (props) => {
    const [loadStatus, setUploadState] = useState(UPLOAD_STATE.NONE)
    const [imageUrl, setImageUrl] = useState(props.existingImageUrl !== "" ? props.existingImageUrl : require(`asset/svg/upload-large.svg`))
    const [hasCustomThumbnail, setHasCustomThumbnail] = useState(props.existingImageUrl !== "")
    const [, setLocalImageUrl] = useState("")
    const { videoId, uploadThumbnailProps, onClick, defaultThumbnailSelected } = props
    let retryIntervalInSeconds = 3
    let maxTry = 600 / retryIntervalInSeconds;
    let retryTimes = maxTry

    const handleImageLoadingError = (e) => {
        if (--retryTimes >= 0) {
            const original_url = e.target.src;
            setTimeout(() => {
                setImageUrl(original_url)
            }, retryIntervalInSeconds * 1000);
        }
    }

    const customRequest = async ({ file }) => {
        setUploadState(UPLOAD_STATE.LOADING)
        const axios = Axios.create()
        delete axios.defaults.headers.put['Content-Type']
        const index = file.name.lastIndexOf('.')
        const ext = index > -1 ? file.name.substr(index) : ''
        const filename = THUMBNAIL_FOLDER + videoId + "_cover" + ext
        const s3ImageUrl = urlBase + videoId + "_cover" + ext
        const mimeType = file.type

        const imgSrc = await readFileAsync(file);
        const img = await loadImgAsync(imgSrc)
        if (img && (img.width < 240 || img.height < 240)) {
            notification.error('Thumbnail images must be at least 240 x 240 pixels.');
            return;
        }
        const { data } = await api.get('/s3upload/video_thumbnail/get_url', { filename, mimeType })
        const { data: { url } } = data
        getBase64(file, callback => {
            setLocalImageUrl(callback)
            setImageUrl(callback);
            uploadThumbnailProps.onUploading(callback);
        })
        axios.put(url, file, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        }).then(response => {
            if (response.status === 200) {
                setUploadState(UPLOAD_STATE.DONE)
                setHasCustomThumbnail(true);
                uploadThumbnailProps.onSuccess(s3ImageUrl);
            }
        })
    }

    const uploadButton = (
        <div className="upload-button" >
            {loadStatus === UPLOAD_STATE.NONE ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );


    return (
        <div className={cx('thumbnail-upload-wrapper', !defaultThumbnailSelected && 'selected')} onClick={onClick} >
            <div className="thumbnail-uploader">
                <Upload
                    className="thumbnail-uploader"
                    showUploadList={false}
                    customRequest={customRequest}
                    beforeUpload={beforeUpload}
                    accept="image/*"
                >
                    {imageUrl ? <img src={imageUrl} alt="cover" onError={handleImageLoadingError} style={{ width: '100%', height: '100%' }} /> : uploadButton}
                </Upload>
            </div>
            {hasCustomThumbnail ? <div className='thumbnail-edit-cover'>
                <Upload
                    className="thumbnail-uploader"
                    showUploadList={false}
                    customRequest={customRequest}
                    beforeUpload={beforeUpload}
                    accept="image/*"
                >
                    <img className="edit-icon" alt="" src={require(`asset/svg/edit-thumbnail.svg`)} />
                </Upload>
            </div> : null}
        </div>
    );
}

export default UploadThumbnail