import createHttp from 'core/http'
import {notification} from 'components/Notification'

const {REACT_APP_API_BASE_URL} = process.env

export default createHttp({
  baseUrl: REACT_APP_API_BASE_URL,
  withCredentials: true,
  onError: error => {
    const {message} = error
    notification.error(message)
  },
})
