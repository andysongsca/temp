/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react'
import { Modal } from 'antd'
import { DownloadLink } from 'components/utils'
import { ReactComponent as IconClose } from 'asset/svg/ic-close.svg'

export default (props) => {
  const { title, visible, filename, footer, children, hideHint, versionUpdate } = props
  const [showHint, setShowHint] = useState(!hideHint)

  return <Modal
    className="policy-modal"
    centered
    width={820}
    title={title}
    visible={visible}
    closable={false}
    footer={footer}
  >
    {filename && <DownloadLink filename={filename} />}
    {children}
    {showHint && <div className="hint">
      <span className="down-pointer">&#128071;</span>
      <span>{versionUpdate ? "We have recently updated our terms. " : ""} Please read through and scroll to the bottom to proceed.</span>
      <IconClose onClick={() => setShowHint(false)} />
    </div>}
  </Modal>
}
