import { store } from '../redux'
import { createAction, handleActions } from 'redux-actions'
import api from 'utils/api'
import { notification } from 'components/Notification'

const initialState = {
  w: {},
  currentNewsletter: {},
  welcomeEmail: {},
}

export const publishNewsletter = createAction('PUBLISH_NEWSLETTER', draft => (
  api.post(`/newsletter/publish`, draft)
))

export const updateNewsletter = createAction('UPDATE_NEWSLETTER', (id, draft) => (
  api.put(`/newsletter/publish/${id}`, draft)
))

export const saveNewsletterDraft = createAction('SAVE_NEWSLETTER_DRAFT', draft => (
  api.post(`/newsletter/draft`, draft)
))

export const updateNewsletterDraft = createAction('UPDATE_NEWSLETTER_DRAFT', (id, draft) => (
  api.put(`/newsletter/draft/${id}`, draft)
))

export const saveNewsletterWelcome = createAction('SAVE_NEWSLETTER_WELCOME', draft => (
  api.post(`/newsletter/welcome`, draft)
))

export const updateNewsletterWelcome = createAction('UPDATE_NEWSLETTER_WELCOME', (id, draft) => (
  api.put(`/newsletter/welcome/${id}`, draft)
))

export const unscheduleNewsletter = createAction('UNSCHEDULE_NEWSLETTER', (id) => (
  api.put(`/newsletter/unschedule/${id}`)
))

export const fetchNewsletter = createAction('FETCH_NEWSLETTER', id => (
  api(`/newsletter/${id}`)
))

export const fetchWelcomeEmail = createAction('FETCH_WELCOME_EMAIL', () => (
  api(`/newsletter/welcome/email`)
))

export const fetchNewsletters = createAction("FETCH_NEWSLETTERS", (status, size) => {
  const { newsletter } = store.getState()
  return api(`/newsletter/media/${status}`, {
    offset: newsletter.w[status].offset || 0,
    size: size || 10
  })
}, (status) => ({ status }))

export const getNewsletterCount = createAction("GET_NEWSLETTER_COUNT", (status) => (
  api(`/newsletter/media/${status}/count`)
), (status) => ({ status }))

export const fetchNewsletterStats = createAction("FETCH_NEWSLETTER_STATS", () => (
  api(`/newsletter/feedback/stats`)
))

export default handleActions({
  'FETCH_NEWSLETTER_PENDING': (state) => {
    const { currentNewsletter } = state
    currentNewsletter.data = null
    currentNewsletter.fetched = false
    return { ...state }
  },
  'FETCH_NEWSLETTER_FULFILLED': (state, { payload: { data } }) => {
    const { currentNewsletter } = state
    if (data.code === 0) {
      currentNewsletter.fetched = true
      currentNewsletter.data = data.data
    }
    else {
      notification.error(data.message)
    }
    return { ...state }
  },
  'FETCH_WELCOME_EMMAIL_PENDING': (state) => {
    const { welcomeEmail } = state
    welcomeEmail.data = null
    welcomeEmail.fetched = false
    return { ...state }
  },
  'FETCH_WELCOME_EMAIL_FULFILLED': (state, { payload: { data } }) => {
    const { welcomeEmail } = state
    if (data.code === 0) {
      welcomeEmail.fetched = true
      welcomeEmail.data = data.data
    }
    else {
      notification.error(data.message)
    }
    return { ...state }
  },
  'GET_NEWSLETTER_COUNT_PENDING': (state, { meta: { status } }) => {
    const { w } = state
    w[status] = {
      fetched: false,
      count: 0,
      newsletters: [],
      offset: 0,
    }
    return { ...state }
  },
  'GET_NEWSLETTER_COUNT_FULFILLED': (state, { meta: { status }, payload: { data } }) => {
    const { w } = state
    if (data.code === 0) {
      w[status] = {
        fetched: true,
        count: data.data,
        newsletters: [],
        offset: 0,
      }
    } else {
      notification.error(data.message)
    }
    return { ...state }
  },
  'FETCH_NEWSLETTERS_FULFILLED': (state, { meta: { status }, payload: { data } }) => {
    const { w } = state
    if (data.code === 0) {
      w[status] = {
        ...w[status],
        fetched: true,
        newsletters: [...w[status].newsletters, ...data.data],
        offset: w[status].offset + data.data.length,
      }
    } else {
      notification.error(data.message)
    }
    return { ...state }
  },
}, initialState)