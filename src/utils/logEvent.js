/* global amplitude */

let page = null

const callAmplitude = (evt, data) => {
  // add common attributes
  const payload = data || {}
  // only do real logging for producction site.
  if (window.location.hostname.indexOf('newsbreak.com') < 0) {
    console.log(evt, payload)
  } else {
    amplitude.getInstance().logEventWithTimestamp(evt, payload, (new Date()).getTime())
  }
}

export const initLog = (user) => {
  if (typeof amplitude !== 'undefined') {
    amplitude.getInstance().setUserId(user.userid)
    amplitude.getInstance().setUserProperties({
      'is_creator': user.is_creator,
      'active_media': user.active_media || 0
    })
  }
}

export const logSetActiveMedia = (media_id) => {
  if (typeof amplitude !== 'undefined') {
    const identify = new amplitude.Identify().set('active_media', media_id)
    amplitude.getInstance().identify(identify)
    callAmplitude('set_active_media', { media_id, page })
  }
}

export default (evt, data) => {
  if (typeof amplitude === 'undefined') {
    return
  }
  // for page visit end, use the current page name
  if (evt === 'page_visit_end') {
    if (data) {
      callAmplitude(evt, data)
    } else if (page) {
      callAmplitude(evt, { page })
    }
    page = null
  } else if (evt === 'page_visit_start') {
    // for page visit start, set the page name, and record url params
    page = data.page
    const query = new URLSearchParams(window.location.search);
    const params = {}
    query.forEach((v, k) => params[k] = v)
    callAmplitude(evt, { ...data, ...params })
  } else {
    callAmplitude(evt, { page, ...data })
  }
}
