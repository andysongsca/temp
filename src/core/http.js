import qs from 'querystring'
import urljoin from 'url-join'
import axios from 'axios'

const defaultOptions = {
  timeout: 30000
}

const logConsole = (s) => {
  const currentdate = new Date();
  const datetime = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();

  console.log(datetime + ":HTTP LOG:" + s)
}

const logMethod = (s) => {
  logConsole("METHOD:" + s)
}


const logUrl = (s) => {
  logConsole("URL:" + s)
}

const logData = (s) => {
  if (s) {
    if (s.password) {
      s = { ...s, password: "xxxxxx" }
    }
    s = JSON.stringify(s)
    s = s.replace(/(\r\n|\n|\r)/gm, "")
    logConsole("DATA:" + s)
  } else {
    logConsole("DATA: NONE")
  }
}

const createHttp = options => {
  const { onError: defaultOnError, baseUrl, alwaysResolve, notifyError, ...rest } = options
  const axiosHttp = axios.create({
    ...defaultOptions,
    ...rest
  })

  const http = (url, data, opts = {}) => {
    const { method = 'get', onError = defaultOnError, ...finalOpts } = opts
    const requestFunc = axiosHttp[method]

    logMethod({ method }['method'])
    logUrl(url)
    logData(data)

    if (typeof requestFunc !== 'function') {
      throw new Error(`invalid http method: ${method}`)
    }

    let finalUrl = !/^http/.test(url) && url ? urljoin(baseUrl, url) : url
    let finalData = data
    let request

    return new Promise((resolve, reject) => {
      if (['get', 'delete'].indexOf(method) > -1) {
        if (typeof data === 'object' && data !== null) {
          finalUrl = `${finalUrl}?${qs.stringify(data)}`
        }
        request = requestFunc(finalUrl, finalOpts)
      } else {
        const { headers = {} } = finalOpts
        if (headers['Content-Type'] === 'multipart/form-data' && !(finalData instanceof FormData)) {
          const formData = new FormData()
          for (let key in finalData) {
            formData.append(key, finalData[key])
          }
          finalData = formData
        }
        request = requestFunc(finalUrl, finalData, finalOpts)
      }

      request.then(rs => {
        resolve(rs)
      })

      request.catch(e => {
        if (typeof onError === 'function' && notifyError !== false) {
          onError(e)
        }
        if (alwaysResolve) {
          resolve({
            ...e.response,
            error: e.toString()
          })
        } else {
          reject(e)
        }
      })
    })
  }

  const createHttpFunc = method => {
    return (url, data, options = {}) => {
      return http(
        url,
        data,
        {
          ...options,
          method
        }
      )
    }
  }

  http.get = createHttpFunc('get')
  http.post = createHttpFunc('post')
  http.put = createHttpFunc('put')
  http.patch = createHttpFunc('patch')
  http.delete = createHttpFunc('delete')

  return http
}

export default createHttp