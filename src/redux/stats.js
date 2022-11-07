import { createAction, handleActions } from 'redux-actions'
import api from 'utils/api'
import { formatNumber } from 'utils/utilities'
import { notification } from 'components/Notification'
import { totals } from 'routes/Home/Analytics/component/StatsConfig'
import dateFormat from 'dateformat'

const initialState = {
  overall: {},
  daily: {},
  readerReferral: {},
  creatorReferral: {},
  follower: {},
  subscribers: {},
  audienceStats: {},
  docStats: {},
}

export const fetchOverallStats = createAction('FETCH_OVERALL_STATS', () => (
  api('/stats/account/overall')
))

export const fetchFollowerStats = createAction('FETCH_FOLLOWER_STATS', () => (
  api('/stats/account/follower')
))

export const fetchDailyStats = createAction('FETCH_DAILY_STATS', () => (
  api('/stats/account/daily')
))

export const fetchSubscriberStats = createAction('FETCH_SUBSCRIBER_STATS', () => (
  api('/stats/account/subscribers')
))

export const fetchReaderReferralStats = createAction('FETCH_READER_REFERRAL_STATS', (params) => (
  api('/stats/account/reader_referral', params)
))

export const fetchCreatorReferralStats = createAction('FETCH_CREATOR_REFERRAL_STATS', (params) => (
  api('/stats/user/creator_referral', params)
))

export const fetchCreatorReferralStatsV3 = createAction('FETCH_CREATOR_REFERRAL_STATS_V3', (params) => (
  api('/stats/user/creator_referral_v3', params)
))

export const fetchAudienceStats = createAction('FETCH_AUDIENCE_STATS', () => (
  api('/analytics/audience')
))

export const fetchSubscribeStats = createAction('FETCH_SUBSCRIBE_STATS', (params) => (
  api('/user/get_subscribe_status', params)
))

export const fetchDocStats = createAction('FETCH_DOC_STATS', (docId) => (
  api(`/stats/doc/${docId}`)
), (docId) => ({ docId }))

const handlePending = (key, data) => {
  return (state) => {
    const res = { ...state }
    res[key] = { fetched: false, data }
    return res
  }
}

const handleFulfilled = (key) => {
  return (state, { payload: { data } }) => {
    if (data.code !== 0) {
      notification.error(data.message)
      return state
    }
    const res = { ...state }
    res[key] = {
      fetched: true,
      data: data.hasOwnProperty('data') ? data.data : data,
    }
    return res
  }
}

export default handleActions({
  'FETCH_OVERALL_STATS_PENDING': handlePending('overall', {}),
  'FETCH_OVERALL_STATS_FULFILLED': handleFulfilled('overall'),
  'FETCH_FOLLOWER_STATS_PENDING': handlePending('follower', {}),
  'FETCH_FOLLOWER_STATS_FULFILLED': handleFulfilled('follower'),
  'FETCH_DAILY_STATS_PENDING': handlePending('daily', []),
  'FETCH_DAILY_STATS_FULFILLED': (state, { payload: { data } }) => {
    if (data.code !== 0) {
      notification.error(data.message)
      return state
    }
    const total = Object.assign({}, ...totals.map(({ key }) => ({ [key]: 0 })))
    data.data.forEach((e) => {
      // e.date return dates in format "2020/12/10", when converting to Date
      // it will convert to local timezone
      // Append the timezone info to the original date so the stats date stay consistent
      const date = new Date(e.date + "T00:00:00")
      e['c_date'] = dateFormat(date, 'mmmm dS')
      e['t_date'] = dateFormat(date, 'mm/dd/yyyy')
      e['t_impression'] = formatNumber(e.impression)
      e['t_page_view'] = formatNumber(e.page_view)
      e['t_share'] = formatNumber(e.share)
      e['t_unique_visitor'] = formatNumber(e.unique_visitor)
      // e['t_follower'] = formatNumber(e.follower)
      e['t_thumb_up'] = formatNumber(e.thumb_up)
      e['t_comment'] = formatNumber(e.comment)
      Object.keys(total).forEach((i) => {
        total[i] += e[i]
      })
    })
    return {
      ...state,
      daily: {
        fetched: true,
        data: data.data,
        total,
      }
    }
  },
  'FETCH_SUBSCRIBER_STATS_PENDING': handlePending('subscribers'),
  'FETCH_SUBSCRIBER_STATS_FULFILLED': handleFulfilled('subscribers'),
  'FETCH_READER_REFERRAL_STATS_PENDING': handlePending('readerReferral'),
  'FETCH_READER_REFERRAL_STATS_FULFILLED': (state, { payload: { data } }) => {
    if (data.code !== 0) {
      notification.error(data.message)
      return state
    }
    return {
      ...state,
      readerReferral: {
        fetched: true,
        data: data.data,
        start_ts: data.start_ts,
      }
    }
  },
  'FETCH_CREATOR_REFERRAL_STATS_PENDING': handlePending('creatorReferral'),
  'FETCH_CREATOR_REFERRAL_STATS_FULFILLED': handleFulfilled('creatorReferral'),
  'FETCH_CREATOR_REFERRAL_STATS_V3_PENDING': handlePending('creatorReferral'),
  'FETCH_CREATOR_REFERRAL_STATS_V3_FULFILLED': handleFulfilled('creatorReferral'),
  'FETCH_AUDIENCE_STATS_PENDING': handlePending('audienceStats'),
  'FETCH_AUDIENCE_STATS_FULFILLED': handleFulfilled('audienceStats'),
  'FETCH_SUBSCRIBE_STATS_PENDING': handlePending('subscribeStats'),
  'FETCH_SUBSCRIBE_STATS_FULFILLED': handleFulfilled('subscribeStats'),

  'FETCH_DOC_STATS': (state, { meta: { docId } }) => {
    state.docStats[docId] = { fetched: false }
    return { ...state }
  },
  'FETCH_DOC_STATS_FULFILLED': (state, { meta: { docId }, payload: { data } }) => {
    if (data.code !== 0) {
      notification.error(data.message)
      return state
    }
    state.docStats[docId] = {
      fetched: true,
      data: data.data
    }
    return { ...state }
  }
}, initialState)
