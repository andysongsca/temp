import React, { useRef } from 'react'
import { Button, Modal } from 'antd'
import withAuth from 'hocs/withAuth'
import EditorPreview from '@/components/EditorPreview'

import './Preview.scss'

const Preview = (props) => {
  const { title, content, self, onClose, newUI } = props
  const iframe = useRef()

  const onIframeLoad = () => {
    iframe.current.contentWindow.postMessage({
      user: self,
      title,
      content,
    }, "*")
  }

  return (
    <Modal
      className="article-preview"
      title=""
      visible={true}
      width={400}
      onCancel={onClose}
      footer={<Button shape="round" className="close-button" type="primary" onClick={onClose}>OK</Button>}
    >
      <div className="preview-container">
        {
          newUI
            ? (
              <div className="new-phone">
                <div className="new-webview">
                  <EditorPreview />
                </div>
              </div>
            )
            : (
                <div className="phone">
                  <div className="webview">
                    <iframe
                      title="preview"
                      ref={iframe}
                      src="/webview"
                      onLoad={onIframeLoad}
                    />
                  </div>
                </div>
            )
        }
      </div>
    </Modal>
  )
}

export default withAuth(Preview)
