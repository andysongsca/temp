import React from 'react'
import { withRouter } from 'react-router'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { resetPosts } from 'redux/content'
import { Tabs, Row, Input, Col } from 'antd'
import { SearchOutlined } from '@ant-design/icons';

import withAuth from 'hocs/withAuth'
import api from 'utils/api'
import logEvent from 'utils/logEvent'
import { Preview } from 'components/utils'
import PostList from './component/PostList'

import './Content.scss'

const TabPane = Tabs.TabPane
const Search = Input.Search

const tabs = [{
  key: 'post',
  title: 'Published Content',
}, {
  key: 'scheduled',
  title: 'Scheduled',
}, {
  key: 'draft',
  title: 'Drafts',
}, {
  key: 'deleted',
  title: 'Deleted Content',
}, {
  key: 'all',
  title: 'All',
}]

export const statusRegex = tabs.map(({ key }) => key).join('|')

class ContentManagement extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      status: this.props.match.params.status,
      showPreview: false,
      queryString: '',
      previewItem: null
    }
    this.tick = {}
    this.props.resetPosts()
  }

  static getDerivedStateFromProps(props, state) {
    return {
      status: props.match.params.status,
    }
  }

  componentDidMount() {
    this.checkArticleStatus()
    this.unlisten = this.props.history.listen((/*location, action*/) => {
      this.closePreview()
    })
    logEvent('page_visit_start', { page: 'content-' + this.state.status })
  }

  componentWillUnmount() {
    if (this.tick.timeout) {
      window.clearTimeout(this.tick.timeout)
    }
    this.unlisten();
    logEvent('page_visit_end', { page: 'content-' + this.state.status })
  }

  componentDidUpdate() {
    this.checkArticleStatus()
  }

  checkArticleStatus = () => {
    const { releasing } = this.props
    if (releasing.length > 0 && this.tick.delay === undefined) {
      this.tick.delay = 5000
      this.tick.timeout = window.setTimeout(this.checkReleasing, this.tick.delay)
    }
  }

  checkReleasing = async () => {
    const { releasing } = this.props
    const { data } = await api.get(`/post/${releasing.join(',')}/releasing-changed`)
    if (data.code === 0 && data.data) {
      this.tick = {}
      this.props.resetPosts()
    } else {
      this.tick.delay *= 2
      if (this.tick.delay < 600000) {
        this.tick.timeout = window.setTimeout(this.checkReleasing, this.tick.delay)
      }
    }
  }

  handleChange(key) {
    logEvent('page_visit_end', { page: 'content-' + this.state.status })
    this.setState({ status: key })
    this.props.history.push(key)
    logEvent('page_visit_start', { page: 'content-' + key })
  }

  showPreview = (previewItem) => {
    this.setState({ showPreview: true, previewItem })
  }

  closePreview = () => {
    this.setState({ showPreview: false, previewItem: null })
  }

  onSearch = () => {
    this.props.resetPosts()
  }

  onSearchChange = (e) => {
    const val = e.target.value
    this.setState({ queryString: val })
  }

  render() {
    const { showPreview, previewItem, queryString, status } = this.state
    const { self, count } = this.props
    if (!self) {
      return null
    }
    return (
      <div className="ContentManagement">
        <Row justify="center" align="center">
          <Col>
            <div className="management-wrapper">
              <h2>Manage Content</h2>
            </div>
          </Col>
        </Row>
        <Tabs
          activeKey={status}
          onChange={(key) => this.handleChange(key)}
          tabBarStyle={{ paddingLeft: '24px', backgroundColor: '#fff' }}
          tabBarExtraContent={(count[status] || 0).toString(10)}>
          {tabs.map(({ key, title }) => {
            if (self.internal_writer || key !== 'scheduled') {
              return <TabPane tab={title} key={key}>
                <Search 
                  className="content-search-textbox" 
                  placeholder="Search for keywords in the title." 
                  onSearch={this.onSearch} 
                  value={queryString} 
                  onChange={this.onSearchChange} 
                  enterButton="Search"
                  prefix={<SearchOutlined />} 
                  allowClear />
                <PostList status={key} onPreview={this.showPreview} queryString={queryString} activeTab={status} />
              </TabPane>
            } else {
              return null
            }
          })}
        </Tabs>
        {showPreview &&
          <Preview
            title={previewItem.title}
            content={previewItem.content}
            onClose={this.closePreview}
          />
        }
      </div>
    )
  }
}

export default compose(
  withAuth,
  connect(
    ({ content: { w, releasing } }) => ({
      count: Object.assign({}, ...Object.entries(w).map(([k, v]) => ({ [k]: v.count }))),
      releasing: [...releasing.keys()],
    }),
    { resetPosts },
  ))(withRouter(ContentManagement))
