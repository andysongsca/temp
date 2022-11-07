import React, { useState, useEffect } from 'react'
import BodyClassName from 'react-body-classname'
import DateFormat from 'dateformat'
import logEvent from 'utils/logEvent'
import './Webview.scss'
import MediaFooter from './MediaFooter'

export default function Webview() {
  const [post, setPost] = useState(null)

  useEffect(() => {
    window.addEventListener('message', event => {
      const { user, title, content } = event.data
      if (content) {
        setPost({ user, title, content })
      }
    })
    logEvent('page_visit_start', { page: 'webview' })
    return () => {
      logEvent('page_visit_end', { page: 'webview' })
    }
  }, [])

  if (!post) {
    return null
  }

  const { user, title, content } = post

  return (
    <BodyClassName className='Webview-Body'>
      <div className='Webview'>
        <h1 className='title'>{title}</h1>
        <div className='author'>
          <div className='avatar' style={{ backgroundImage: `url(${user.icon})` }} />
          <span className='date'>{DateFormat(Date.now(), '')}</span>
        </div>
        <div
          className='content'
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <MediaFooter account={user} />
      </div>
    </BodyClassName>
  )
}
