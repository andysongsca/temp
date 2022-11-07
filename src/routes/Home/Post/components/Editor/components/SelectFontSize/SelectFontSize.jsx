import React from 'react'

import {
  LIST_TEXT_IDS,
  MAP_ID_TO_STYLE,
  TEXT_STYLE_ID_DEFAULT
} from './constants'
import { RichUtils } from 'draft-js'
import { ReactComponent as IconCaretDown } from 'asset/svg/icon-caret-down.svg'

import './SelectFontSize.scss'
import {
  LOG_EDITOR_FONT_OPEN,
  LOG_EDITOR_FONT_CHANGE
} from '@/constant/content/logEvents'
import logEvent from '@/utils/logEvent'

export const SelectFontSize = props => {
  const {
    currentFont,
    editorState,
    setEditorState,
    styles,
    showDropdown: isShowingFontSizeMenu,
    onDropdownChange,
    onHideDropdown,
    onFontChange
  } = props

  const setFontSize = (e, value) => {
    //  Keep cursor focus inside Editor
    e.preventDefault()

    let fontKey = value
    if (currentFont === value) {
      fontKey = TEXT_STYLE_ID_DEFAULT
    }

    const selected = MAP_ID_TO_STYLE[fontKey]
    let newEditorState = RichUtils.toggleBlockType(
      editorState,
      selected.config.block
    )
    const stateRemovedSize = styles.fontSize.remove(newEditorState)
    const stateRemovedWeight = styles.fontWeight.remove(stateRemovedSize)
    newEditorState = stateRemovedWeight

    let temp = newEditorState
    if (selected.config.style) {
      if (selected.config.style.size) {
        temp = styles.fontSize.add(temp, selected.config.style.size)
      }
      if (selected.config.style.weight) {
        temp = styles.fontWeight.add(temp, selected.config.style.weight)
      }

      newEditorState = temp
    }

    setEditorState(newEditorState)
    onFontChange(fontKey)
    onHideDropdown()
    logEvent(LOG_EDITOR_FONT_CHANGE, { newFont: fontKey })
  }

  const fontSizeOptions = LIST_TEXT_IDS.map(value => (
    <div
      key={`${value}`}
      className="select-option"
      // declare event for setting font size
      onMouseDown={e => setFontSize(e, value)}
      style={MAP_ID_TO_STYLE[value].optionStyle}
    >
      {MAP_ID_TO_STYLE[value].name}
    </div>
  ))

  return (
    <div className="SelectFontSize">
      <div
        className="select-button"
        // show dropdown menu when button is pressed,
        // keeping cursor focused inside Editor
        onMouseDown={e => {
          e.preventDefault()
          onDropdownChange()
          logEvent(LOG_EDITOR_FONT_OPEN)
        }}
      >
        <span>{MAP_ID_TO_STYLE[currentFont].name}</span>
        <IconCaretDown />
      </div>
      {/* open or close menu if the button is pressed. */}
      {isShowingFontSizeMenu ? (
        <div className="select-menu">{fontSizeOptions}</div>
      ) : null}
    </div>
  )
}
