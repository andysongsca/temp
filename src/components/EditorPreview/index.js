import classNames from 'classnames'
import React, { useCallback, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { getDateOffsetDesc } from '@/utils/utilities'

import './index.scss'

function EditorPreview(props) {
  const { className, self, post } = props
  const { media_id, account, icon, var_info } = self
  const { content, title } = post

  const iframeRef = useRef()

  const handleIframeRef = useCallback((iframe) => {
    if (iframe) {
      iframeRef.current = iframe

      const iframeStyleDOM = document.createElement('style')

      iframeStyleDOM.innerHTML = `
        body {
          margin: 0;
          padding: 0 30px 20px;
          color: #242424;
          font-size: 14px;
          font-family: ui-serif,Georgia,Cambria,Times New Roman,Times,serif;
          font-variant: tabular-nums;
          line-height: 28px;
          letter-spacing: 0.3px;
          word-break: break-word;
          background-color: #fff;
          font-feature-settings: 'tnum';
        }

        h1 {
            font-weight: 700;
            font-size: 24px;
        }

        h1 {
            font-weight: 700;
            font-size: 22px;
        }

        img {
            width: 100%;
            height: auto;
            margin: 0 auto;
        }

        p {
            font-size: 16px;
        }

        .title-wrap {
            display: flex;
            align-items: center;
        }

        .doc-title {
            margin-bottom: 20px;
        }

        .original-url {
            text-decoration: none;
            color: #fff;
            width: 100px;
            padding: 5px 10px;
            background-color: #ed5555;
            border-radius: 4px;
            text-align: center;
            flex-shrink: 0;
            white-space: nowrap;
            margin-left: 0;
        }

        .original-url:hover {
            background-color: #ff4b4b;
        }

        .media-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            margin-top: 15px;
        }

        .media-wrap {
            display: flex;
            align-items: center;
        }

        .media-wrap .icon {
            width: 35px;
            height: 35px;
            border-radius: 50%;
        }

        .info-wrap {
            margin-left: 10px;
            line-height: 1;
        }

        .info-wrap .name {
            font-size: 12px;
            font-weight: bold;
            display: flex;
            align-items: center;
        }

        .info-wrap .badge {
            width: 14px;
            height: 14px;
            margin-left: 3px;
        }

        .info-wrap .desc {
            font-size: 12px;
            margin-top: 5px;
        }

        .follow-btn-wrap {
            color: #017ef9;
        }
      `

      iframe.contentWindow.document.head.appendChild(iframeStyleDOM)
    }
  }, [])

  useEffect(() => {
    // 先清空 iframe 里之前的内容
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.document.body.innerHTML = ''
    }

    const profileUrl = "https://www.newsbreak.com/@c/" + media_id
    const desc = JSON.parse(var_info).des || ''

    const mediaDOMStr = `
      <div class='media-wrap'>
          <a href='${profileUrl}' target='_blank'>
              <img class='icon' src='${icon}' />
          </a>

          <div class='info-wrap'>
              <div class='name'>
                  ${account}

                  <img
                      class='badge'
                      alt='NewsBreak Contributor badge'
                      src='https://i.prt.news/NewsBreakContributorBadge.png'
                  />
              </div>

              <div class='desc'>
                  ${desc}
              </div>
          </div>
      </div>
    `

    const followBtnDOMStr = `
        <div class='follow-btn-wrap'>
            Follow
        </div>
    `;

    const dateDOMStr = `
      <div class='date'>${getDateOffsetDesc(moment().local().toDate())}</div>
    `

    const titleDOMStr =  `
      <div class='title-wrap'>
          <h1 class='doc-title'>${title}</h1>
      </div>
    `

    const contentDOMStr = content.trim()

    const bodyDOMStr = `
        ${titleDOMStr}

        <div class='date-info'>
          ${dateDOMStr}
        </div>

        <div class='media-info'>
            ${mediaDOMStr}

            ${followBtnDOMStr}
        </div>

        ${contentDOMStr}
      `

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.scrollTo(0, 0)
      iframeRef.current.contentWindow.document.body.innerHTML = bodyDOMStr
      iframeRef.current.contentWindow.document.querySelectorAll('a').forEach(linkElement => {
        if (linkElement.href && linkElement.target !== '_blank') {
          linkElement.target = '_blank'
        }
      })
    }
  }, [])

  return (
    <div className={classNames('doc-preview-root', className)}>
      <div className='doc-preview'>
        <iframe
          ref={handleIframeRef}
          frameBorder='0'
          style={{ width: '100%', height: '100%' }}
          sandbox='allow-scripts allow-forms allow-same-origin allow-popups'
        />
      </div>
    </div>
  )
}

export default connect(
  ({ login: { self }, post: { post } }) => ({ self, post }),
  {},
)(EditorPreview)
