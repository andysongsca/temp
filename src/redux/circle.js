import { store } from '../redux'
import { createAction, handleActions } from 'redux-actions'
import api from 'utils/api'
import { notification } from 'components/Notification'

const initialState = {
  publishedMessage: {},
}

export const postMessage = createAction('POST_MESSAGE', draft => (
  api.post(`/post/message/send-message`, draft)
))

export const fetchPublishedMessages = createAction("FETCH_PUBLISHED_MESSAGES", (size) => {
  const { circle } = store.getState()
  return api(`/post/media/message`, {
    offset: circle.publishedMessage.offset || 0,
    size: size || 10
  })
})

export const getMessagesCount = createAction("GET_MESSAGES_COUNT", () => (
  api(`/post/media/message/count`)
))

export default handleActions({
  'GET_MESSAGES_COUNT_PENDING': (state) => {
    return {
      ...state,
      publishedMessage: {
        fetched: false,
        count: 0,
        data: [],
        offset: 0,
      }
    }
  },
  'GET_MESSAGES_COUNT_FULFILLED': (state, { payload: { data } }) => {
    if (data.code !== 0) {
      notification.error(data.message)
      return state
    }
    return {
      ...state,
      publishedMessage: {
        fetched: true,
        count: data.data,
        data: [],
        offset: 0,
      }
    }
  },
  'FETCH_PUBLISHED_MESSAGES_FULFILLED': (state, { payload: { data } }) => {
    if (data.code !== 0) {
      notification.error(data.message)
      return state
    }
    const { publishedMessage } = state
    const newOffest = data.data.length + publishedMessage.offset
    const count = publishedMessage.count
    const oldData = publishedMessage.data

    return { ...state, 
      publishedMessage: {
        data: [...oldData, ...data.data],
        fetched: true,
        offset: newOffest,
        count: count
      }
    }
  },
}, initialState)