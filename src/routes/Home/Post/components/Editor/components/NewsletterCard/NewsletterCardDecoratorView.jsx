import React from 'react'
import NewsletterCardComponent from './NewsletterCardComponent'

const NewsletterCardPreview = decoratorProps => {
  const data = decoratorProps.contentState
    .getEntity(decoratorProps.entityKey)
    .getData()

  return <NewsletterCardComponent {...data} />
}

export default NewsletterCardPreview
