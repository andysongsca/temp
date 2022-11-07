import React from 'react'
import { Tag } from 'antd'

const { CheckableTag } = Tag

const KeywordSuggestions = props => {
  const { tags, onTagClick, selected } = props

  return (
    <div className="KeywordSuggestions">
      <div className="KeywordSuggestions-wrapper">
        {tags.map(tag => (
          <CheckableTag
            key={tag}
            onClick={() => onTagClick(tag)}
            checked={selected === tag}
          >
            {tag}
          </CheckableTag>
        ))}
      </div>
    </div>
  )
}

export default KeywordSuggestions
