import React from 'react'
import { ReactComponent as IconDownload } from 'asset/svg/icon-download.svg'
import './DownloadLink.scss'

export default (props) => {
  return <a
    className="download-link"
    target="_blank"
    rel="noopener noreferrer"
    href={`/api/download/${props.filename}`}
  >
    <IconDownload /> Download PDF
  </a>
}
