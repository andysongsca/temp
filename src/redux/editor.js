import { createAction, handleActions } from 'redux-actions'
import api from 'utils/api'

const ACTION_TOGGLE_SHOW_FONT = 'EDITOR_TOGGLE_SHOW_FONT'
const ACTION_HIDE_FONT = 'EDITOR_HIDE_FONT'
const ACTION_SET_FONT = 'EDITOR_SET_FONT'
const ACTION_FETCH_SEARCH_IMAGES = 'FETCH_SEARCH_IMAGES'
const ACTION_FETCH_SEARCH_SUGGESTIONS = 'FETCH_SEARCH_SUGGESTIONS'
const ACTION_FETCH_SEARCH_SOURCES = 'FETCH_SEARCH_SOURCES'

const SEARCH_STATE_INIT = 'init'
const SEARCH_STATE_PENDING = 'pending'
const SEARCH_STATE_DONE = 'done'

export const DEFAULT_FOLLOW_TEXT = 'Follow me to see more articles like this.'
export const DEFAULT_CREATOR_PROMOTION_TEXT = 'This is original content from NewsBreak’s Contributor Network.'
export const DEFAULT_CREATOR_PROMOTION_TEXT2 = ' to publish and share your own content.'
const initialState = {
  activeToggle: -1,
  removeKey: undefined,
  showWidget: false,
  editRoot: undefined,
  showFont: false,
  currentFont: 'default',
  search: {
    status: SEARCH_STATE_INIT
  }
}

export const actions = {
  setActionToggle: createAction(
    'ACTIVE_TOGGLE',
    (activeIndex, removeKey, data) => ({ activeIndex, removeKey, data })
  ),
  hideWidget: createAction('HIDE_WIDGET', () => ({})),
  toggleWidget: createAction('TOGGLE_WIDGET', () => ({})),
  bindEditRoot: createAction('BIND_EDITOR', editRoot => ({ editRoot })),
  toggleShowFont: createAction(ACTION_TOGGLE_SHOW_FONT, showFont => ({
    showFont
  })),
  hideFont: createAction(ACTION_HIDE_FONT, () => ({})),
  setCurrentFont: createAction(ACTION_SET_FONT, currentFont => ({
    currentFont
  })),
  fetchSearchImages: createAction(
    ACTION_FETCH_SEARCH_IMAGES,
    (keyword, page, size, sources) => {
      const config = {
        keyword,
        page,
        size,
        sources: sources.join(',')
      }
      return api(`/editor/search`, config)
    }
  ),
  fetchSearchSuggestions: createAction(ACTION_FETCH_SEARCH_SUGGESTIONS, () => {
    return api(`/editor/search/suggestions`)
  }),
  fetchSearchSources: createAction(ACTION_FETCH_SEARCH_SOURCES, () => {
    return api(`/editor/search/sources`)
  })
}

export default handleActions(
  {
    BIND_EDITOR: (state, { payload: { editRoot } }) => {
      return {
        ...state,
        editRoot: editRoot
      }
    },
    ACTIVE_TOGGLE: (
      state,
      { payload: { activeIndex, removeKey = undefined, data = undefined } }
    ) => {
      const newToggleState =
        state.activeToggle !== activeIndex ? activeIndex : -1

      return {
        ...state,
        activeToggle: newToggleState,
        removeKey: removeKey, // should the new entity replace the former one
        data
      }
    },
    HIDE_WIDGET: state => {
      return {
        ...state,
        showWidget: false
      }
    },
    TOGGLE_WIDGET: state => {
      return {
        ...state,
        showWidget: !state.showWidget
      }
    },
    [ACTION_TOGGLE_SHOW_FONT]: state => {
      return {
        ...state,
        showFont: !state.showFont
      }
    },
    [ACTION_HIDE_FONT]: state => {
      return {
        ...state,
        showFont: false
      }
    },
    [ACTION_SET_FONT]: (state, { payload: { currentFont } }) => {
      return { ...state, currentFont }
    },
    [`${ACTION_FETCH_SEARCH_IMAGES}_PENDING`]: state => {
      return {
        ...state,
        search: { ...state.search, status: SEARCH_STATE_PENDING, images: [] }
      }
    },
    [`${ACTION_FETCH_SEARCH_IMAGES}_FULFILLED`]: (
      state,
      { payload: { data } }
    ) => {
      return {
        ...state,
        search: { ...state.search, status: SEARCH_STATE_DONE, images: data }
      }
    },
    [`${ACTION_FETCH_SEARCH_SUGGESTIONS}_PENDING`]: state => {
      return {
        ...state,
        search: { ...state.search, suggestions: [] }
      }
    },
    [`${ACTION_FETCH_SEARCH_SUGGESTIONS}_FULFILLED`]: (
      state,
      { payload: { data } }
    ) => {
      return {
        ...state,
        search: { ...state.search, suggestions: data }
      }
    },
    [`${ACTION_FETCH_SEARCH_SOURCES}_PENDING`]: state => {
      return {
        ...state,
        search: { ...state.search, sources: [] }
      }
    },
    [`${ACTION_FETCH_SEARCH_SOURCES}_FULFILLED`]: (
      state,
      { payload: { data } }
    ) => {
      return {
        ...state,
        search: { ...state.search, sources: data }
      }
    }
  },
  initialState
)
