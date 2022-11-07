import React, { useState } from 'react'
import { Menu, Dropdown, Checkbox } from 'antd'

import { ReactComponent as IconFilter } from 'asset/svg/icon-filter.svg'

const CheckboxGroup = Checkbox.Group

const SourceFilter = props => {
  const { list, selected, onSourceChange } = props
  const [visible, setVisible] = useState(false)

  const onChange = list => {
    onSourceChange(list)
  }
  const handleVisibleChange = flag => {
    setVisible(flag)
  }

  return (
    <div className="SourceFilter">
      <span className="SourceFilter-text">
        Results from{' '}
        {list.length === selected.length ? `all sources` : selected.join(', ')}
      </span>
      <Dropdown
        overlay={
          <Menu className="SourceFilterMenu">
            <CheckboxGroup
              className="SourceFilter-group"
              options={list}
              value={selected}
              onChange={onChange}
            />
          </Menu>
        }
        placement="bottomRight"
        onVisibleChange={handleVisibleChange}
        visible={visible}
      >
        <IconFilter />
      </Dropdown>
    </div>
  )
}

export default SourceFilter
