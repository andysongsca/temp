import { Image } from 'antd'
import React, { useEffect, useState } from 'react'
import VisibilitySensor from 'react-visibility-sensor'
import { Loading } from '../utils'
import './LazyImage.scss'

const placeholderSrc = (width, height) =>
  `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"%3E%3C/svg%3E`

const LazyImage = props => {
  const [imageSrc, setImageSrc] = useState(placeholderSrc(200, 200))

  const { src, enablePreview, imageProps } = props

  const handleLoadImage = isVisible => {
    if (isVisible) {
      setImageSrc(src)
    }
  }

  useEffect(() => {
    setImageSrc(src)
  }, [src])

  return (
    <VisibilitySensor partialVisibility onChange={handleLoadImage}>
      <Image
        key={src}
        className={'lazy-image'}
        src={imageSrc}
        placeholder={<Loading />}
        preview={
          enablePreview && {
            visible: imageProps.visible,
            onVisibleChange: (visible) => {
              imageProps.onVisibleChange(visible);
              if (enablePreview && imageProps) {
                imageProps.onPreview(visible)
              }
            }
          }
        }
      />
    </VisibilitySensor>
  )
}

export default LazyImage
