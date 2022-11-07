import React, { useEffect } from 'react'
import logEvent from 'utils/logEvent'
import Nav from '../../components/Nav'

export default function VideoCreatorRegistration() {
  useEffect(() => {
    // track url
    logEvent('page_visit_start', { page: 'register-creator', params: window.location.search })

    // create embedded hubspot form
    const s = document.createElement('script')
    s.type = 'text/javascript'
    s.async = true
    s.onload = () => {
      const s2 = document.createElement('script')
      s2.type = 'text/javascript'
      s2.async = true
      let html = 'hbspt.forms.create({portalId:"6719962",formId:"92d6a0f3-4407-499e-a7c8-3a450218c369",target:"#form_target"});'
      s2.innerHTML = html
      document.body.appendChild(s2)
    }
    s.src = 'https://js.hsforms.net/forms/shell.js'
    s.width = '100%'
    document.body.appendChild(s)

    return () => {
      logEvent('page_visit_end', { page: 'register-creator' })
    }
  }, []);

  return <>
    <Nav />
    <div style={{
      maxWidth: 1280,
      margin: '30px auto',
      boxShadow: '0 4px 8px 0 rgba(53, 105, 128, 0.3), 0 6px 20px 0 rgba(165, 200, 213, 0.41)',
    }}>
      <div id="form_target" style={{ padding: 40 }} />
    </div>
  </>
}
