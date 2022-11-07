import React, { useMemo, useState } from 'react'
import { Input } from 'antd'
import KeywordSuggestions from './KeywordSuggestions'

import './ImageSearch.scss'
import SourceFilter from './SourceFilter'
import ListImages from './ListImages'
import { apiGetFullImage } from './utils'
import { Loading } from '@/components/utils'
import logEvent from '@/utils/logEvent'
import { LOG_IMAGE_SEARCH_NAV_KEYWORD } from './constants'

const { Search } = Input

const ImageSearch = props => {
  const { onSearch, images, suggestions, sources, status } = props

  const [searchTerm, setSearchTerm] = useState('')
  const [resultTerm, setResultTerm] = useState('')
  const mapSourceNameToId = useMemo(() => {
    if (sources && sources.length > 0) {
      return sources.reduce((accum, source) => {
        return {
          ...accum,
          [source.name]: source.key
        }
      }, {})
    }
    return {}
  }, [sources])

  const handleNext = async image => {
    const data = await apiGetFullImage(image.id)

    if (data) {
      props.onNext({
        ...image,
        thumbnail_uri: data.image_uri || image.image_uri || image.thumbnail_uri
      })
    }
  }

  const handleSearch = value => {
    if (value) {
      if (onSearch) {
        setResultTerm(value)
        onSearch(
          value,
          selectedSources.map(source => mapSourceNameToId[source])
        )
      }
    }
  }

  const handleForceSearch = tag => {
    logEvent(LOG_IMAGE_SEARCH_NAV_KEYWORD, { keyword: tag })
    setSearchTerm(tag)
    setResultTerm(tag)
    onSearch(
      tag,
      selectedSources.map(source => mapSourceNameToId[source])
    )
  }

  const handleSearchTermChange = e => {
    setSearchTerm(e.target.value)
  }

  const [selectedSources, setSelectedSources] = useState(
    sources.map(source => source.name)
  )
  const handleSourceChange = list => {
    if (list.length > 0) {
      setSelectedSources(list)
    }
  }
  const memoSourceNames = useMemo(() => {
    if (sources) {
      return sources.map(source => source.name)
    }
    return []
  }, [sources])

  return (
    <div className="ImageSearch">
      <Search
        value={searchTerm}
        onChange={handleSearchTermChange}
        onSearch={handleSearch}
        allowClear
        placeholder="Basic usage"
      />
      <KeywordSuggestions
        tags={suggestions}
        selected={resultTerm}
        onTagClick={handleForceSearch}
      />
      <SourceFilter
        list={memoSourceNames}
        selected={selectedSources}
        onSourceChange={handleSourceChange}
      />
      {status !== 'init' &&
        (status === 'pending' ? (
          <Loading />
        ) : images && images.length > 0 ? (
          <ListImages images={images} onImageClick={handleNext} />
        ) : (
          <span>No images</span>
        ))}
    </div>
  )
}

export default ImageSearch
