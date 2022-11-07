import LazyImage from '@/components/LazyImage'
import React, { useState } from 'react'
import { UploadOutlined } from '@ant-design/icons'

import { apiGetFullImage } from './utils'

const LOADED = 2

const ListImagesItem = props => {
  const {
    columnIndex,
    rowIndex,
    style,
    data,
    itemStatusMap,
    numColumns,
    onNextClick
  } = props
  let label
  const itemIndex = rowIndex * numColumns + columnIndex
  const [src, setSrc] = useState(data[itemIndex].thumbnail_uri)
  const [showPreview, setShowPreview] = useState(false)
  if (itemStatusMap[itemIndex] === LOADED) {
    const item = data[itemIndex]

    label = item ? (
      <div key={item.thumbnail_uri} className="ListImagesItem">
        <LazyImage
          src={src}
          enablePreview
          imageProps={{
            visible: showPreview,
            onVisibleChange: visible => {
              setShowPreview(visible)
            },
            onPreview: async visible => {
              if (visible) {
                const temp = await apiGetFullImage(item.id)
                if (temp) {
                  setSrc(temp.image_uri || temp.thumbnail_uri)
                }
              }
            }
          }}
        />

        <div className="ListImagesItem-next-btn" onClick={() => onNextClick(item)}>
          <UploadOutlined />
        </div>
      </div>
    ) : (
      <div>unknown</div>
    )
  } else {
    label = 'Loading...'
  }
  return (
    <div className="ListItem" style={style}>
      {label}
    </div>
  )
}

export default ListImagesItem
