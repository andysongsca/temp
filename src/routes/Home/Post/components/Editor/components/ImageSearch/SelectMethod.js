import React from 'react'
import SelectMethodItem from './SelectMethodItem'
import { SearchOutlined, UploadOutlined } from '@ant-design/icons'

const SelectMethod = props => {
  const { onUploadClick, onSearchClick } = props

  return (
    <div className="SelectMethod">
      <SelectMethodItem title="Upload Image" onClick={onUploadClick}>
        <UploadOutlined className="SelectMethod-icon" />
      </SelectMethodItem>
      <SelectMethodItem title="Find Image" onClick={onSearchClick}>
        <SearchOutlined className="SelectMethod-icon" />
      </SelectMethodItem>
    </div>
  )
}

export default SelectMethod
