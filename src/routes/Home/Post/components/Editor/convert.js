import React from 'react'
import { Entity } from 'draft-js'
import { Base64 } from 'js-base64'
import { convertFromHTML, convertToHTML } from 'draft-convert'
import { TYPE_FOLLOWING, TYPE_IMAGE, TYPE_LINK, TYPE_NEWSLETTER_CARD, TYPE_SOCIAL } from '@/constant/content'
import {
  ImageHTML,
  SocialCardHtml,
  Link,
  FollowingCardPreview,
  FollowingCardTmpl,
  createHTMLOutput,
  PREFIX_CUSTOM,
  regexFontSize,
  regexFontWeight
} from './components'

const replaceHTMLEntities = (str) => {
  return str.replace('&amp;', '&')
}

export const convertToHtml = (contentState, flags) => {
  return convertToHTML({
    styleToHTML: style => {
      if (regexFontSize.test(style)) {
        const { size: fontSize } = style.match(regexFontSize).groups
        return <span style={{ fontSize }} />
      }
      if (regexFontWeight.test(style)) {
        const { weight: fontWeight } = style.match(regexFontWeight).groups
        return <span style={{ fontWeight }} />
      }
    },
    blockToHTML: block => {
      if (block.type === 'blockquote') {
        if (flags && flags.isNewsletter) {
          return (
            <blockquote
              style={{
                marginBottom: '25px',
                fontStyle: 'italic',
                borderLeft: '4px solid #FF5A5A',
                position: 'relative',
                padding: '16px 16px 16px 30px',
                backgroundColor: '#F5F5F5',
                margin: 'auto'
              }}
            />
          )
        }
      }
      if (block.type === 'subtitle-1') {
        return <p className="subtitle-1" />
      }
      if (block.type === 'subtitle-2') {
        return <p className="subtitle-2" />
      }
    },
    entityToHTML: (entity, originalText) => {
      if (entity.type === TYPE_IMAGE) {
        return ImageHTML(entity.data)
      } else if (entity.type === TYPE_SOCIAL) {
        return SocialCardHtml(entity.data)
      } else if (entity.type === TYPE_LINK) {
        return Link(entity.data)
      } else if (entity.type === TYPE_FOLLOWING) {
        const { content = {} } = entity.data
        return FollowingCardPreview(content)
      } else if (entity.type === TYPE_NEWSLETTER_CARD) {
        return createHTMLOutput(entity.data)
      }
    }
  })(contentState)
}

export const convertToPureHtml = (contentState, flags) => {
  return convertToHTML({
    styleToHTML: style => {
      if (regexFontSize.test(style)) {
        const { size: fontSize } = style.match(regexFontSize).groups
        return <span style={{ fontSize }} />
      }
      if (regexFontWeight.test(style)) {
        const { weight: fontWeight } = style.match(regexFontWeight).groups
        return <span style={{ fontWeight }} />
      }
    },
    blockToHTML: block => {
      if (block.type === 'blockquote') {
        if (flags && flags.isNewsletter) {
          return (
            <blockquote
              style={{
                marginBottom: '25px',
                fontStyle: 'italic',
                borderLeft: '4px solid #FF5A5A',
                position: 'relative',
                padding: '16px 16px 16px 30px',
                backgroundColor: '#F5F5F5',
                margin: 'auto'
              }}
            />
          )
        }
      }
      if (block.type === 'subtitle-1') {
        return <p className="subtitle-1" />
      }
      if (block.type === 'subtitle-2') {
        return <p className="subtitle-2" />
      }
    },
    entityToHTML: (entity, originalText) => {
      if (entity.type === TYPE_IMAGE) {
        return ImageHTML(entity.data)
      } else if (entity.type === TYPE_SOCIAL) {
        return SocialCardHtml(entity.data)
      } else if (entity.type === TYPE_LINK) {
        return Link(entity.data)
      } else if (entity.type === TYPE_FOLLOWING) {
        const { content = {} } = entity.data
        return FollowingCardTmpl(content)
      } else if (entity.type === TYPE_NEWSLETTER_CARD) {
        return createHTMLOutput(entity.data)
      }
    }
  })(contentState)
}

export const convertFromHtml = convertFromHTML({
  htmlToStyle: (nodeName, node, currentStyle) => {
    if (nodeName === 'span') {
      if (node.style.fontSize) {
        return currentStyle.add(
          `${PREFIX_CUSTOM}FONT_SIZE_${node.style.fontSize}`
        )
      }
      if (node.style.fontWeight) {
        return currentStyle.add(
          `${PREFIX_CUSTOM}FONT_WEIGHT_${node.style.fontWeight}`
        )
      }
    }

    return currentStyle
  },
  htmlToBlock: (nodeName, node) => {
    if (nodeName === 'p') {
      if (node.className) {
        return node.className
      }
    }
    if (nodeName === 'figure' || nodeName === 'img' || (nodeName === 'div' && node.className.indexOf('img-wrapper') >= 0)) {
      return 'atomic'
    }
  },
  htmlToEntity: (nodeName, node) => {
    let firstEl = node.firstElementChild
    // There are a few possible cases for image due to various ways of adding an image
    if (nodeName === 'img' ||
      (nodeName === 'div' && node.className.indexOf('img-wrapper') >= 0) ||
      (nodeName === 'figure' && firstEl && (firstEl.className.indexOf('img-wrapper') >= 0 || firstEl.nodeName.toLowerCase() === 'img'))) {
      // possible image container, find the image node
      if (nodeName === 'img') {
        firstEl = node
      } else while (firstEl && firstEl.nodeName.toLowerCase() !== 'img') {
        firstEl = firstEl.firstElementChild
      }
      if (firstEl) {
        const { src, alt, dataset: { credit, externalurl, type, url } } = firstEl
        node.innerHTML = '' // clean up possible garbage in it due to copy/paste
        return Entity.create(TYPE_IMAGE, 'IMMUTABLE', { src, caption: alt, credit: credit || '', externalUrl: externalurl, type, metadata: { profile_url: url } })
      }
    } else if (nodeName === 'a') {
      return Entity.create(TYPE_LINK, 'MUTABLE', { url: node.href }, false)
    } else if ((node.dataset || {}).type === TYPE_SOCIAL) {
      const content = node.innerHTML
      node.innerHTML = ''
      return Entity.create(TYPE_SOCIAL, 'IMMUTABLE', { content })
    } else if ((node.dataset || {}).type === TYPE_NEWSLETTER_CARD) {
      const data = {}
      const textFields = ['title', 'text', 'metadata', 'author', 'cta']
      for (let field of textFields) {
        const className = `n-embed-${field}`
        const tags = node.getElementsByClassName(className)
        if (tags.length > 0) {
          data[field] = replaceHTMLEntities(node.getElementsByClassName(className)[0].innerHTML)
        }
      }

      const imgFields = ['thumbnail', 'imageAuthor']
      for (let field of imgFields) {
        const className = `n-embed-${field}`
        const tags = node.getElementsByClassName(className)
        if (tags.length > 0) {
          data[field] = node.getElementsByClassName(className)[0].src
        }
      }

      if (node.getElementsByClassName('n-embed-play').length > 0) {
        data.cardType = 'video'
      } else {
        data.cardType = 'article'
      }

      if (node.getElementsByClassName('n-embed-url').length > 0) {
        data.url = node.getElementsByClassName('n-embed-url')[0].href
      }

      data.orientation = /NewsletterCard-vertical/.test(node.className)
        ? 'vertical'
        : 'horizontal'
      data.type = /NewsletterCard-video/.test(node.className)
        ? 'video'
        : 'article'

      node.innerHTML = ''
      return Entity.create(TYPE_NEWSLETTER_CARD, 'IMMUTABLE', { ...data })
    } else if (nodeName === 'nbtemplate') {
      const template = (node.dataset || {}).id
      const content = (node.dataset || {}).content
      // const templateMatchRegex = /([\s\S]*)>/m;
      // const match = content.match(templateMatchRegex);
      // if (!match || match.length !== 2) {
      //   return;
      // }
      try {
        const data = JSON.parse(decodeURIComponent(Base64.decode(content)))
        // const data = match[2]
        node.innerHTML = ''
        node.innerText = ''
        if (template === 'FollowCard') {
          return Entity.create(TYPE_FOLLOWING, 'IMMUTABLE', {
            content: { ...data, data: data.text }
          })
        }
      } catch (e) {
        // do nothing
      }
    }
  }
})
