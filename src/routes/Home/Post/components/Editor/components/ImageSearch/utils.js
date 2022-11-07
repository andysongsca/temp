import api from '@/utils/api'

export const apiGetFullImage = async imageId => {
  const { data } = await api
    .get(`/editor/search/image/${imageId}`)
    .catch(() => ({}))

  return data
}

export const apiLogImageSearch = async (eventId, data) => {
  await api.post(`/editor/search/log/${eventId}`, data || {})
}
