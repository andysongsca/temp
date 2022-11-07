import { createAction, handleActions } from 'redux-actions'
import api from 'utils/api'
import { notification } from 'components/Notification'

const initialState = {
  post: null,
  isFetchPostPending: false,
  isFetchCommentsPending: false,
  comments: null,
}

export const createDraft = createAction('CREATE_DRAFT', draft => (
  api.post('/post/draft', draft)))
  
export const getCommentSession = createAction('GET_COMMENTS_SESSION', id => (
  api(`/post/comments/get-session`)
))
export const likeComment = createAction('LIKE_COMMENT', (content) => (
  api.post(`/post/comments/like`, content)
))

export const deleteComment = createAction('DELETE_COMMENT', (content) => (
  api.post(`/post/comments/delete`, content)
))

export const addComment = createAction('ADD_COMMENT', (content) => (
  api.post(`/add-comment`, content)
))

export const addReply = createAction('ADD_REPLY', (content) => (
  api.post(`/post/comments/add-reply`,content)
))

export const updateDraft = createAction('UPDATE_DRAFT', (id, draft, posted =
  false) => (
    posted ? api.put(`/post/published-draft/${id}`, draft) :
      api.put(`/post/draft/${id}`, draft)
  ))

export const publishPost = createAction('PUBLISH_POST', draft => (
  api.post(`/post/publish`, draft)
))

export const updatePost = createAction('PUBLISH_POST', (id, draft) => (
  api.put(`/post/publish/${id}`, draft)
))

export const fetchPost = createAction('FETCH_CONTENT', id => (
  api(`/post/${id}`)
))

export const updateLastReadComment = createAction('UPDATE_LAST_READ_COMMENT', content => (
  api.post(`/media/set_doc_last_read_comment`, content)
))

export const getPostRejectedReason = createAction('GET_REJECTED_REASON', doc_id => (
  api(`/media/get_doc_rejected_reason/${doc_id}`)
))

export const getMediaViolations = createAction('GET_MEDIA_VIOLATIONS', () => (
  api(`/media/get_media_violations`)
))

export const getMediaSuspensionOrTermination = createAction('GET_MEDIA_SUSPENSION_TERMINATION', () => (
  api(`/media/get_media_suspension`)
))

export default handleActions(
  {
    'FETCH_CONTENT_PENDING': () => {
      return {
        isFetchPostPending: true,
      }
    },
    'FETCH_CONTENT_FULFILLED': (state, { payload: { data } }) => {
      let post
      if (typeof data.data === 'object') {
        post = data.data
      } else {
        post = null
        notification.error(data.message)
      }
      return {
        post,
        isFetchPostPending: false,
      }
    },
    'FETCH_COMMENTS_PENDING': () => {
      return {
        isFetchCommentsPending: true,
      }
    },
    'FETCH_COMMENTS_FULFILLED': (state, { payload: { data } }) => {
      let comments = []
      if (Array.isArray(data.comments)) {
        comments = data.comments
      }
      return {
        comments,
        isFetchCommentsPending: false,
      }
    }
  },
  initialState
)
