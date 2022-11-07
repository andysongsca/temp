import { createAction, handleActions } from 'redux-actions'
import api from 'utils/api'
import { monetizationApplicationMap } from 'utils/utilities'

const initialState = {
  self: null,
  isFetchSelfPending: undefined
}

const whitelistNewsletterMediaId = [
  1590011, 1588556, 1587934, 1587933, 1527267, 1527268, 1527265, 1527264, 996695, 1276937, 996686, 996687, 996691, 1588908, 1588906, 1588904, 1589349, 1589348, 1591323, 1592375
]
const whitelistHtmlTextboxMediaId = [562147, 1432262, 1590449, 1420620, 561427, 1589702, 1589681, 1589684, 1589637, 556035, 556036, 1589640, 563777, 658923, 1591237, 562986, 1594541]

export const fetchSelf = createAction('FETCH_SELF', (refresh = true) => (
  api('/self', { refresh })
))

export const register = createAction('REGISTER', (email, password, user_type, referral_code, recaptchaToken, source) => (
  api.post('/pubreg', { email, password, user_type, referral_code, recaptchaToken, source })
))

export const login = createAction('LOGIN', (email, password) => (
  api.post('/login', { email, password })
))

export const logout = createAction('LOGOUT', () => (
  api.post('/logout')
))

export const createMediaAccount = createAction('CREATE_MEDIA_ACCOUNT', (account) => (
  api.post('/create-account', account)
))

export const sendTwilioVerification = createAction('SEND_TWILIO_VERIFICATION', (phone, channel) => (
  api.post('/send_twilio_verification', { phone, channel })
))

export const checkVerification = createAction('CHECK_VERIFICATION', (phone, verification_code) => (
  api.post('/check_verification', { phone, verification_code })
))

export const updateUserProfile = createAction('UPDATE_USER_PROFILE', (account) => (
  api.post('/update-profile', account)
))

export const updatePolicy = createAction('UPDATE_POLICY', (policy_type, version) => (
  api.post('/update-policy', { policy_type, version })
))

export const fetchMonetizationApplication = createAction('FETCH_MONETIZATION_APPLICATION', () => (
  api('/get-monetization-application')
))

export const applyMonetization = createAction('APPLY_MONETIZATION', () => (
  api.post('/apply-monetization')
))

export const fetchJournalistHours = createAction('FETCH_JOURNALIST_HOURS', () => (
  api('/get-journalist-hours')
))

export const updateJournalistHours = createAction('UPDATE_JOURNALIST_HOURS', () => (
  api('/update-journalist-hours')
))

export const insertJournalistHours = createAction('INSERT_JOURNALIST_HOURS', (hours, date) => (
  api.post('/insert-journalist-hours', {hours, date})
))

export default handleActions(
  {
    'FETCH_SELF_PENDING': (state) => {
      return {
        ...state,
        isFetchSelfPending: true
      }
    },
    'FETCH_SELF_FULFILLED': (state, { payload: { data } }) => {
      if (data && data.code === 404) {
        window.location.href = '/Page404'
        return { isFetchSelfPending: false }
      }
      const self = data ?
        {
          ...data,
          enable_video: data.media_role === 10 || (data.is_creator && data.creator_info !== undefined && data.creator_info.video_features === 'true'),
          enable_comments: data.is_creator || data.state === 5,
          enable_internal_test: data.is_creator && data.creator_info !== undefined && data.creator_info.internal_test === 'true',
          enable_video_thumbnail: data.media_role === 10 || (data.is_creator && data.creator_info !== undefined && data.creator_info.video_features === 'true'),
          enable_internal_circle: (data.is_creator && data.creator_info !== undefined && data.creator_info.internal_circle === 'true'),
          enable_internal_ugc: data.is_creator && data.creator_info !== undefined && data.creator_info.internal_ugc === 'true',
          enable_internal_ugc_video: data.is_creator && data.creator_info !== undefined && data.creator_info.internal_ugc_video === 'true',
          enable_internal_newsletter: (data.is_creator && data.creator_info !== undefined && data.creator_info.internal_newsletter === 'true') || data.media_role === 10 || whitelistNewsletterMediaId.indexOf(data.media_id) > -1,
          enable_html_textbox: whitelistHtmlTextboxMediaId.indexOf(data.media_id) > -1,
          monetization_application: data.is_creator && data.creator_info !== undefined && data.creator_info.monetization_application !== undefined 
            ? monetizationApplicationMap[data.creator_info.monetization_application] : (data.media_role === 10 ? monetizationApplicationMap.Not_Applicable : -1),
        } : null
      return {
        ...state,
        self,
        isFetchSelfPending: false
      }
    },
    'FETCH_SELF_REJECTED': (state) => {
      return {
        ...state,
        isFetchSelfPending: false
      }
    },

    'LOGIN_FULFILLED': (state, { payload: { data } }) => {
      const self = data ?
        {
          ...data,
          enable_video: data.media_role === 10 || (data.is_creator && data.creator_info !== undefined && data.creator_info.video_features === 'true'),
          enable_comments: data.is_creator || data.state === 5,
          enable_video_thumbnail: data.media_role === 10 || (data.is_creator && data.creator_info !== undefined && data.creator_info.video_features === 'true'),
        } : null
      return {
        ...state,
        self
      }
    },
    'LOGOUT_FULFILLED': (state) => {
      return {
        ...state,
        self: null
      }
    },
    'FETCH_MONETIZATION_APPLICATION_PENDING': (state) => {
      return {
        ...state,
        monetizationApplication: {
          fetched: false,
        }
      }
    },
    'FETCH_MONETIZATION_APPLICATION_FULFILLED': (state, { payload: { data } }) => {
      if (data.code !== 0) {
        return state
      }
      return {
        ...state,
        monetizationApplication: {
          fetched: true,
          data: data.data,
        }
      }
    }

  },

  initialState
)
