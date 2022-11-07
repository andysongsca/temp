import {createAction, handleActions} from 'redux-actions'
import api from 'utils/api'
import {notification} from 'components/Notification'

const initialState = {
  media: {},
  fetched: false,
  rss_status: {},
}

export const fetchMediaInfo = createAction("FETCH_MEDIA_INFO", () => (
  api('/setting/media')
))

export const fetchRssStatus = createAction("FETCH_RSS_STATUS", () => (
  api('/setting/get_rss_audit_status')
))

export default handleActions({
  'FETCH_MEDIA_INFO_PENDING': (state) => {
    return {
      ...state,
      fetched: false,
    }
  },
  'FETCH_MEDIA_INFO_FULFILLED': (state, {payload: {data}}) => {
    const res = {
      ...state,
      fetched: true,
    }
    if (data.code !== 0) {
      notification.error(data.message)
      return res
    }
    res.media = data.data
    return res
  },
  'FETCH_MEDIA_INFO_REJECTED': (state, {payload: {data}}) => {
    if (data.message) {
      notification.error(data.message)
    }
    return {
      ...state,
      fetched: true,
    }
  },
  'FETCH_RSS_STATUS_PENDING': (state) => {
    return {
      ...state,
      fetched: false,
    }
  },
  'FETCH_RSS_STATUS_FULFILLED': (state, {payload: {data}}) => {
    const res = {
      ...state,
      fetched: true,
    }
    if (data.code !== 0) {
      notification.error(data.message)
      return res
    }
    res.rss_status = data.data
    return res
  },
  'FETCH_RSS_STATUS_FAILED': (state, {payload: {data}}) => {
    if (data.message) {
      notification.error(data.message)
    }
    return {
      ...state,
      fetched: true,
    }
  },
}, initialState)
