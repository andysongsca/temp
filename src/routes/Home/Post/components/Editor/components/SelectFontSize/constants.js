export const PREFIX_CUSTOM = 'CUSTOM_'
export const regexFontSize = new RegExp(
  `^${PREFIX_CUSTOM}FONT_SIZE_(?<size>[\\d]+px)$`
)
export const regexFontWeight = new RegExp(
  `^${PREFIX_CUSTOM}FONT_WEIGHT_(?<weight>[\\d\\w]+)$`
)

export const TEXT_STYLE_ID_DEFAULT = 'default'
export const TEXT_STYLE_ID_HEADER1 = 'header1'
export const TEXT_STYLE_ID_SUBTITLE1 = 'subtitle1'
export const LIST_TEXT_IDS = [
  TEXT_STYLE_ID_DEFAULT,
  TEXT_STYLE_ID_HEADER1,
  TEXT_STYLE_ID_SUBTITLE1
]

export const MAP_ID_TO_STYLE = {
  [TEXT_STYLE_ID_DEFAULT]: {
    name: 'Normal',
    config: {
      block: 'paragraph'
    },
    optionStyle: {
      fontSize: '1em'
    }
  },
  [TEXT_STYLE_ID_SUBTITLE1]: {
    name: 'Subtitle',
    config: {
      block: 'header-three'
    },
    optionStyle: {
      fontSize: '1.33em',
      fontWeight: 'bold'
    }
  },
  [TEXT_STYLE_ID_HEADER1]: {
    name: 'Headline',
    config: {
      block: 'header-two'
    },
    optionStyle: {
      fontSize: '1.8em',
      fontWeight: 'bold'
    }
  },
}

export const blockTypeToFont = blockType => {
  if (blockType === 'header-two') {
    return TEXT_STYLE_ID_HEADER1
  }
  if (blockType === 'header-three') {
    return TEXT_STYLE_ID_SUBTITLE1
  }
  return TEXT_STYLE_ID_DEFAULT
}
