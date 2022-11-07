import { createAction, handleActions } from 'redux-actions'
import api from 'utils/api'
import { notification } from 'components/Notification'

const initialState = {
  localInfo: {},
  creatorInfo: {},
}

export const fetchLocalInfo = createAction('FETCH_LOCAL_INFO', (params) => (
  api('/serving/channel', params)
))

export const fetchCreatorInfo = createAction('FETCH_CREATOR_INFO', (params) => (
  api('/stats/user/top_local_creator', params)
))


export default handleActions({
  'FETCH_LOCAL_INFO_PENDING': (state) => {
    return {
      ...state,
      localInfo: {
        fetched: false,
        infos: {},
      }
    }
  },
  'FETCH_LOCAL_INFO_FULFILLED': (state, { payload: { data } }) => {
    if (data.code !== 0) {
      notification.error(data.message)
      return state
    }
    return {
      ...state,
      localInfo: {
        fetched: true,
        infos: data.documents,
      }
    }
  },
  'FETCH_CREATOR_INFO_PENDING': (state) => {
    return {
      ...state,
      creatorInfo: {
        fetched: false,
        infos: {},
      }
    }
  },
  'FETCH_CREATOR_INFO_FULFILLED': (state, { payload: { data } }) => {
    if (data.code !== 0 || data.contact.count === 0) {
      notification.error("load contributor data error")
      return state
    }
    let result = [];
    data.contact.forEach(t => {
      let entry = {
        id: t.id,
        media_name: t.media_name,
        location: t.location,
        icon: t.icon,
        articles: JSON.parse(t.articles),
        profile: t.profile
      }
      result.push(entry)
    })
    return {
      ...state,
      creatorInfo: {
        fetched: true,
        infos: result,
      }
    }
  },
}, initialState)