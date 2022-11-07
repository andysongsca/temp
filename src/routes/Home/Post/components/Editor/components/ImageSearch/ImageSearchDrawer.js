import Drawer from '@/components/Drawer'
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { actions } from 'redux/editor'

import { ReactComponent as IconBack } from 'asset/svg/navigation-back.svg'
import SelectMethod from './SelectMethod'
import ImageSearch from './ImageSearch'
import './ImageSearchDrawer.scss'
import './ImageSearch.scss'
import { apiLogImageSearch } from './utils'
import {
  LOG_IMAGE_SEARCH_IMAGE_SELECT,
  LOG_IMAGE_SEARCH_METHOD_UPLOAD,
  LOG_IMAGE_SEARCH_METHOD_SEARCH,
  LOG_IMAGE_SEARCH_NAV_BACK
} from './constants'
import logEvent from '@/utils/logEvent'

const PAGE_SELECT = 1
const PAGE_SEARCH = 2

const ImageSearchDrawer = props => {
  const {
    setActionToggle,
    editor: {
      search: { status, images, suggestions, sources }
    },
    fetchSearchImages,
    post
  } = props

  const [page, setPage] = useState(PAGE_SELECT)
  const [isVisible, setIsVisible] = useState(true)
  const handleNext = image => {
    const config = {
      src: image.thumbnail_uri,
      credit: image.credit_text,
      caption: image.caption,
      step: 2,
      skipSave: true
    }

    const regex = /^unsplash-/
    if (regex.test(image.id)) {
      config['type'] = 'unsplash'
      config['metadata'] = image.metadata || {}
    }
    apiLogImageSearch(LOG_IMAGE_SEARCH_IMAGE_SELECT, {
      url: image.thumbnail_uri || '',
      doc_id: (post && post.post && post.post.doc_id) || undefined,
      post_id: (post && post.post && post.post.post_id) || undefined
    })
    setIsVisible(false)
    setActionToggle(2, undefined, config)
  }

  const handleUpload = () => {
    logEvent(LOG_IMAGE_SEARCH_METHOD_UPLOAD)
    setIsVisible(false)
    setActionToggle(2)
  }

  const handleSearch = (keyword, sources) => {
    logEvent(LOG_IMAGE_SEARCH_METHOD_SEARCH)
    fetchSearchImages(keyword, 0, 100, sources)
  }

  const handleClose = () => {
    setActionToggle(-1)
    setIsVisible(false)
  }

  const handlePageSearch = () => {
    setPage(PAGE_SEARCH)
  }

  const handleBack = () => {
    logEvent(LOG_IMAGE_SEARCH_NAV_BACK)
    setPage(oldPage => {
      if (oldPage <= PAGE_SELECT) {
        return PAGE_SELECT
      }
      return oldPage - 1
    })
  }

  return (
    <Drawer isVisible={isVisible} onClose={handleClose} title="Add Image">
      <div className="ImageSearchDrawer">
        <div className="ImageSearchDrawer-back-wrapper">
          {page > PAGE_SELECT ? (
            <div className="ImageSearchDrawer-back-btn" onClick={handleBack}>
              <IconBack className="ImageSearchDrawer-back-btn-icon" />
              <span>Back</span>
            </div>
          ) : (
            ''
          )}
        </div>
        {page === PAGE_SELECT && (
          <SelectMethod
            onUploadClick={handleUpload}
            onSearchClick={handlePageSearch}
          />
        )}
        {page === PAGE_SEARCH && (
          <ImageSearch
            onNext={handleNext}
            onClose={handleClose}
            onSearch={handleSearch}
            images={images || []}
            status={status}
            suggestions={suggestions || []}
            sources={sources || []}
          />
        )}
      </div>
    </Drawer>
  )
}

export default connect(({ editor, post }) => ({ editor, post }), {
  ...actions
})(ImageSearchDrawer)
