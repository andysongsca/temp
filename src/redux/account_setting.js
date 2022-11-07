import {createAction, handleActions} from 'redux-actions'
import api from 'utils/api'
import {notification} from 'components/Notification'

const initialState = {
  account: {},
  fetched: false,
}

export const fetchAccountInfo = createAction("FETCH_ACCOUNT_INFO", () => (
  api('/setting/account')
))

export default handleActions({
  'FETCH_ACCOUNT_INFO_PENDING': (state) => {
    return {
      ...state,
      fetched: false,
    }
  },
  'FETCH_ACCOUNT_INFO_FULFILLED': (state, {payload: {data}}) => {
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
  'FETCH_ACCOUNT_INFO_REJECTED': (state, {payload: {data}}) => {
    if (data.message) {
      notification.error(data.message)
    }
    return {
      ...state,
      fetched: true,
    }
  },
}, initialState)
