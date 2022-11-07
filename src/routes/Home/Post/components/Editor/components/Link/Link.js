import React from 'react'
import { createDecorator } from '../../utils/decorator'
import { Tooltip } from 'components/utils'

export const TYPE_LINK = 'LINK'

const style = {
  color: "#4A90E2",
}

export const Link = (props) => {
  const { url, children } = props
  // if link is within newsbreak.com domain, we open the link in the new window
  if (url.includes("newsbreak.com")) {
    return (
      <a
        href={url}
        rel="noopener noreferrer"
        style={style}
        target="_blank"
      >
        {children}
      </a>
    )
  }
  return (
    <a
      href={url}
      rel="noopener noreferrer"
      style={style}
    >
      {children}
    </a>
  )
}

const LinkComponent = (props) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData()
  const { children } = props
  return (
    <Tooltip
      placement="bottom"
      title={(
        <span
          style={{
            color: "#c8c8c8",
          }}
          rel="noopener noreferrer"
          target="_blank"
          href={url} >
          {url}
        </span>
      )}>
      <a
        href={url}
        rel="noopener noreferrer"
        style={style}
      >
        {children}
      </a>
    </Tooltip>
  )
}

export const LinkDecorator = createDecorator(TYPE_LINK, LinkComponent)
