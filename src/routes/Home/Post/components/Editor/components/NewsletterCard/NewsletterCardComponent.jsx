import React from 'react'
import { TYPE_NEWSLETTER_CARD } from '@/constant/content'

const NewsletterCardComponent = props => {
  const {
    orientation = 'horizontal',
    title = '',
    thumbnail = '',
    imageAuthor = '',
    text = '',
    url = '',
    author = '',
    metadata = '',
    cardType = 'article'
  } = props
  return createHTMLOutput({
    title,
    thumbnail,
    text,
    url,
    author,
    imageAuthor,
    metadata,
    orientation,
    cardType
  })
}

const createInlineCard = () => {
  return {
    width: '100%',
    maxWidth: '700px',
    border: '1px solid #BDBDBD',
    borderRadius: '16px',
    overflow: 'hidden'
  }
}

const createInlineThumbnail = () => {
  const style = {
    width: '100%',
    height: 'auto',
    padding: '0'
  }

  return style
}

export const createHTMLOutput = data => {
  const {
    title,
    thumbnail,
    text,
    url,
    author,
    metadata,
    imageAuthor,
    orientation,
    cardType
  } = data

  const isVertical = orientation === 'vertical'

  return (
    <div style={createInlineCard(isVertical)} data-type={TYPE_NEWSLETTER_CARD}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="n-embed-url"
        style={{ textDecoration: 'none' }}
      >
        <table
          className={`NewsletterCard NewsletterCard-${orientation} NewsletterCard-${cardType}`}
          style={{ borderCollapse: 'collapse', borderSpacing: '0px' }}
        >
          <tbody>
            <tr>
              <td style={createInlineThumbnail(isVertical)}>
                {thumbnail && (
                  <img
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                      margin: 0,
                      display: 'block'
                    }}
                    src={thumbnail}
                    alt={title}
                    className="n-embed-thumbnail"
                  />
                )}
              </td>
            </tr>
            {!thumbnail && (
              <tr>
                <td height={16} style={{ padding: 0, height: '16px' }} />
              </tr>
            )}
            <tr>
              <td height={24} style={{ padding: 0, height: '24px' }} />
            </tr>
            <tr>
              <td style={{ padding: '0 24px' }}>
                <table style={{ width: '100%' }}>
                  <tr>
                    <td height={32} style={{ height: '32px' }}>
                      {author && (
                        <>
                          {imageAuthor && (
                            <div
                              style={{
                                height: '32px',
                                width: '32px',
                                borderRadius: '99999px',
                                overflow: 'hidden'
                              }}
                            >
                              <img
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  margin: 0,
                                  marginRight: '5px',
                                  display: 'block'
                                }}
                                src={imageAuthor}
                                alt="author"
                                className="n-embed-imageAuthor"
                              />
                            </div>
                          )}
                          <span
                            className="n-embed-author"
                            style={{
                              color: '#242424',
                              fontSize: '20px'
                            }}
                          >
                            {author}
                          </span>
                        </>
                      )}
                    </td>
                    <td
                      className="n-embed-metadata"
                      style={{
                        fontSize: '20px',
                        color: '#017EF9',
                        textDecoration: 'none',
                        textAlign: 'right'
                      }}
                    >
                      {metadata}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td height={20} style={{ padding: 0, height: '20px' }} />
            </tr>
            <tr>
              <td style={{ padding: '0 24px' }}>
                <p
                  style={{
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: '28px',
                    color: '#242424',
                    lineHeight: '33px',
                    letterSpacing: '0.38px',
                    marginBottom: '0',

                    textOverflow: 'ellipsis',
                    lineClamp: 2,
                    WebkitLineClamp: 2,
                    boxOrient: 'vertical',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    display: '-webkit-box'
                  }}
                  className="n-embed-title"
                >
                  {title}
                </p>
              </td>
            </tr>
            <tr>
              <td height={16} style={{ padding: 0, height: '16px' }} />
            </tr>
            <tr>
              <td style={{ padding: '0 24px' }}>
                <p
                  style={{
                    fontSize: '20px',
                    lineHeight: '28px',
                    color: '#656565',
                    textOverflow: 'ellipsis',
                    lineClamp: 2,
                    WebkitLineClamp: 2,
                    boxOrient: 'vertical',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    marginBottom: 0
                  }}
                  className="n-embed-text"
                >
                  {text}
                </p>
              </td>
            </tr>
            <tr>
              <td height={24} style={{ padding: 0, height: '24px' }} />
            </tr>
            <tr>
              <td height={12} style={{ padding: 0, height: '12px' }} />
            </tr>
            {!thumbnail && (
              <tr>
                <td height={4} style={{ padding: 0, height: '4px' }} />
              </tr>
            )}
          </tbody>
        </table>
      </a>
    </div>
  )
}

export default NewsletterCardComponent
