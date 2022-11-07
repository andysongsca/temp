import React, { useState, useRef, useEffect } from 'react'
import { Tag, Input, Tooltip } from 'antd'
import styles from './TagList.module.scss'

export default (props) => {
  const {
    tags,
    className = '',
    editable = false,
    maxCount = Infinity,
    validate,
    onSearch,
    onChange,
  } = props
  const [tagList, setTagList] = useState(tags || [])
  const [inputValue, setInputValue] = useState('')
  const [hasError, setHasError] = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    inputRef.current && inputRef.current.focus()
  }, [])

  const handleRemove = (removedTag) => {
    const newList = tagList.filter(tag => tag.name !== removedTag)
    setTagList(newList)
    onChange(newList)
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0)
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    onSearch && onSearch(val)
  }

  const handleInputConfirm = () => {
    const val = inputValue.trim()
    if (val && !tagList.find(tag => tag.name === val)) {
      if (validate && !validate(val)) {
        setHasError(true)
        return
      } else {
        const newList = [...tagList, { id: val, name: val }]
        setTagList(newList)
        onChange(newList)
      }
    }
    setHasError(false)
    setInputValue('')
  }

  return <div className={`${styles.tagList} ${className}`}>
    {tagList.map(({ id, name }) => {
      const isLongTag = name.length > 30
      const tagElem = (
        <Tag
          key={id}
          closable={editable}
          onClose={() => handleRemove(name)}
        >
          <span>{isLongTag ? `${name.slice(0, 30)}...` : name}</span>
        </Tag>
      )
      return isLongTag ?
        <Tooltip title={name} key={name}>{tagElem}</Tooltip> : tagElem
    })}
    {editable && tagList.length < maxCount && (
      <>
        <Input
          ref={inputRef}
          type="text"
          size="small"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
          prefix=" "
        />
        {hasError && <span className={styles.error}>
          Only alphanumeric and space characters are allowed.
        </span>}
      </>
    )}
  </div>
}
