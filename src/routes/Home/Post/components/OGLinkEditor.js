import React, { Fragment } from 'react'
import { Input } from 'antd'
import cx from 'classnames'

import api from 'utils/api'
import { Loading, Tooltip } from 'components/utils'

import './OGLinkEditor.scss'

export const defaultOG = {
  title: '',
  url: '',
  type: '',
  site_name: '',
  img: '',
  description: '',
  text_message: '',
  status: 'none',
}

export default class OGLinkEditor extends React.Component {

  state = {
    isParsing: false,
    showError: false,
  }

  previewLink = async (url) => {
    this.setState({ isParsing: true, showError: false });
    const { data } = await api.get(`/parse/og?url=${encodeURIComponent(url)}&media_id=${this.props.mediaId}`)
    this.setState({ isParsing: false });

    let og, text_message = this.props.content.text_message
    if (data.data) { // a valid url
      og = { ...data.data, status: 'parsed', text_message }
      // fix title if too long
      if (!og.title) {
        og.title = og.url || url
        if (og.title.length > 80) {
          og.title = og.title.substr(0, 77) + '...'
        }
      }
    } else { // probably an invalid url
      og = { ...defaultOG, title: url, url, text_message }
      this.setState({ showError: true })
    }
    this.props.onChange(og)
  }

  onValidateLink = e => {
    e.preventDefault()
    if (this.props.content.status === 'none') {
      const val = e.target.value;
      if (val.length > 5) {
        this.previewLink(val)
      }
    }
  }

  onChange = e => {
    const val = e.target.value
    const { onChange, content } = this.props
    const og = val ? content : { ...defaultOG, text_message: content.text_message }
    onChange({ ...og, title: val })
  }

  render() {
    const { placeholder, content } = this.props
    const { title, url, site_name, description, img, status } = content || defaultOG
    const { showError } = this.state

    return (
      <div className={cx(
        'og-link-editor',
        status !== 'none' && 'validated',
        showError && 'error'
      )}>
        <Tooltip
          title={status === 'none' ? 'Click out or press Enter to preview the link' : url}
          placement="topLeft"
        >
          <Input.TextArea
            autoSize={{ minRows: 1 }}
            placeholder={placeholder}
            value={title}
            onPressEnter={this.onValidateLink}
            onBlur={this.onValidateLink}
            onChange={this.onChange}
          />
        </Tooltip>

        <div className={cx('preview-container', !img && 'no-image')}>
          {this.state.isParsing ? <Loading /> : <Fragment>
            <img className='preview-img' alt='preview for the article' src={img} />
            <div className='preview-desc'>{description}</div>
            <div className='preview-site'>{site_name}</div>
          </Fragment>}
        </div>

        {showError &&
          <div className='error-msg'>Please enter the valid link to an article you want to share.</div>
        }
      </div>
    )
  }
}
