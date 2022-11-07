import { store } from '../redux'
import { createAction, handleActions } from 'redux-actions'
import api from 'utils/api'
import { notification } from 'components/Notification'
import { POST_STATUS } from 'constant/content'

const initialState = {
  w: {},
  releasing: new Set(),
}

export const fetchCount = createAction('FETCH_COUNT', ({status, queryString, mode }) => (
  api(`/post/media/${status}/count`, { queryString, mode })
), ({status, queryString}) => ({ status, queryString: encodeURIComponent(queryString) }))

export const fetchPosts = createAction('FETCH_POSTS', ({ status, mode, queryString, size }) => {
  const { content } = store.getState()
  return api(`/post/media/${status}`, {
    offset: content.w[status].offset || 0,
    size: size || 10,
    queryString,
    mode,
  })
}, ({ status, queryString }) => ({ status, queryString: encodeURIComponent(queryString) }))

export const resetPosts = createAction('RESET_POSTS')

export const getMediaEarnings = createAction('GET_MEDIA_EARNINGS', (media_id, date) => {
  return api.post('/media/get_media_earning', { media_id, date })
})

export const getStrikeStatuses = createAction('GET_STRIKE_STRATUSES', (media_id) => {
  return api.get('/media/get_strike_statuses', { media_id })
})

export default handleActions(
  {
    'FETCH_COUNT_PENDING': (state, { meta: { status } }) => {
      const { w } = state
      w[status] = {
        fetched: false,
        offset: 0,
        posts: [],
        count: 0,
      }
      return { ...state }
    },
    'FETCH_COUNT_FULFILLED': (state, { meta: { status }, payload: { data } }) => {
      const { w } = state
      const ps = w[status]
      ps.fetched = true
      if (data.code === 0) {
        ps.count = data.data
        if (data.data === 0) {
          ps.fetched = true
        }
      } else {
        notification.error(data.message)
      }
      return { ...state }
    },
    'FETCH_COUNT_REJECTED': (state, { meta: { status } }) => {
      const { w: { [status]: ps } } = state
      ps.fetched = true
      return { ...state }
    },
    'FETCH_POSTS_FULFILLED': (state, { meta: { status }, payload: { data } }) => {
      const { w: { [status]: ps }, releasing } = state
      ps.fetched = true
      if (data.code === 0) {
        ps.posts = [...ps.posts, ...data.data]
        ps.offset += data.data.length
        if (['post', 'all'].includes(status)) {
          data.data
            .filter(({ status: s }) => s === POST_STATUS.RELEASING)
            .forEach(({ post_id }) => { releasing.add(post_id) })
        }
      } else {
        notification.error(data.message)
      }
      return { ...state, releasing }
    },
    'FETCH_POSTS_REJECTED': (state, { meta: { status }, payload: { data } }) => {
      const { w: { [status]: ps } } = state
      ps.fetched = true
      ps[status] = false
      return { ...state }
    },
    'REFRESH_RELEASING_FULFILLED': (state) => {
      return state
    },
    'REFRESH_RELEASING_REJECTED': (state) => {
      return state
    },
    'RESET_POSTS': (state) => {
      return {
        ...state,
        releasing: new Set(),
        w: {},
      }
    },
  },
  initialState,
)
