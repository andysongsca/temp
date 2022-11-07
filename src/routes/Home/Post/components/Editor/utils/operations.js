import {
  TYPE_FOLLOWING,
  TYPE_LINK,
  TYPE_IMAGE,
  TYPE_NEWSLETTER_CARD
} from '@/constant/content'
import {
  AtomicBlockUtils,
  EditorState,
  Modifier,
  SelectionState,
  RichUtils
} from 'draft-js'

export const applyLink = (editorState, url, linkText) => {
  const contentState = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const text = linkText || url
  let newContent
  if (selection.isCollapsed()) {
    newContent = Modifier.insertText(contentState, selection, text)
  } else {
    newContent = Modifier.replaceText(contentState, selection, text)
  }
  const contentStateWithLinkEntity = newContent.createEntity(
    TYPE_LINK,
    'MUTABLE',
    { url }
  )
  const entityKey = contentStateWithLinkEntity.getLastCreatedEntityKey()
  // create new selection with the inserted text
  const startOffset = selection.getStartOffset()
  const newSelection = new SelectionState({
    anchorKey: selection.getStartKey(),
    anchorOffset: startOffset,
    focusKey: selection.getStartKey(),
    focusOffset: startOffset + text.length
  })
  // and aply link entity to the inserted text
  const newContentWithLink = Modifier.applyEntity(
    contentStateWithLinkEntity,
    newSelection,
    entityKey
  )
  // create new state with link text
  const withLinkText = EditorState.push(
    editorState,
    newContentWithLink,
    'insert-characters'
  )
  // now lets add cursor right after the inserted link
  return EditorState.forceSelection(
    withLinkText,
    newContent.getSelectionAfter()
  )
}

export const resetBlockType = (editorState, styles) => {
  const contentStateNewLine = Modifier.splitBlock(
    editorState.getCurrentContent(),
    editorState.getSelection()
  )
  let newEditorState = EditorState.push(
    editorState,
    contentStateNewLine,
    'split-block'
  )

  const currentBlockType = RichUtils.getCurrentBlockType(editorState)
  if (currentBlockType !== 'paragraph') {
    const editorStateUnstyled = RichUtils.toggleBlockType(
      newEditorState,
      currentBlockType
    )
    const editorStateParagraph = RichUtils.toggleBlockType(
      editorStateUnstyled,
      'paragraph'
    )
    /*     newEditorState = EditorState.setInlineStyleOverride(
          editorStateParagraph,
          ''
        ) */
    const editorStateNoFontSize = styles.fontSize.remove(editorStateParagraph)
    const editorStateNoFontWeight = styles.fontWeight.remove(
      editorStateNoFontSize
    )
    newEditorState = editorStateNoFontWeight
  }

  return newEditorState
}

const applyEntity = (editorState, entity, removeKey) => {
  let newEditorState = editorState
  let newContentState = editorState.getCurrentContent()
  const entityKey = entity.getLastCreatedEntityKey()
  if (removeKey) {
    const removeBlock = newContentState.getBlockForKey(removeKey)
    if (null != removeBlock) {
      const newSelectionState = SelectionState.createEmpty(
        removeBlock.getKey()
      ).merge({ focusOffset: removeBlock.getLength() })
      newContentState = Modifier.applyEntity(
        newContentState,
        newSelectionState,
        entityKey
      )
      newEditorState = EditorState.push(
        newEditorState,
        newContentState,
        'apply-entity'
      )
      // newContentState = Modifier.removeRange(newContentState, newSelectionState, 'backward');
      // newContentState = Modifier.setBlockType(newContentState, newContentState.getSelectionAfter(), "unstyled")
      // newEditorState = EditorState.push(newEditorState, newContentState, 'remove-range')
    }
    return newEditorState
  } else {
    newEditorState = EditorState.set(newEditorState, {
      currentContent: entity
    })
    return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
  }
}

export const applyFollow = (editorState, data, removeKey) => {
  const entity = editorState
    .getCurrentContent()
    .createEntity(TYPE_FOLLOWING, 'IMMUTABLE', { content: { data } })
  return applyEntity(editorState, entity, removeKey)
}

export const applyImage = (editorState, data, removeKey) => {
  const entity = editorState
    .getCurrentContent()
    .createEntity(TYPE_IMAGE, 'IMMUTABLE', data)
  return applyEntity(editorState, entity, removeKey)
}

export const applyNewsletterCard = (editorState, data, removeKey) => {
  const entity = editorState
    .getCurrentContent()
    .createEntity(TYPE_NEWSLETTER_CARD, 'IMMUTABLE', data)
  return applyEntity(editorState, entity, removeKey)
}

export const applyNewLine = (editorState, lines = 1) => {
  let editorStateTemp = editorState
  let i = 1
  while (i < lines && i < 10) {
    const contentStateNewLine = Modifier.splitBlock(
      editorStateTemp.getCurrentContent(),
      editorStateTemp.getSelection()
    )
    editorStateTemp = EditorState.push(
      editorStateTemp,
      contentStateNewLine,
      'split-block'
    )
    i++
  }

  return editorStateTemp
}

export const getCurrentBlockType = editorState => {
  return RichUtils.getCurrentBlockType(editorState)
}
