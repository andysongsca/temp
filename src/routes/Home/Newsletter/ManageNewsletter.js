import React, { useEffect, useState } from 'react'
import { Tabs, Row, Col } from 'antd'
import logEvent from 'utils/logEvent'
import { NewsletterList, NewsletterStats } from './component'
import { Preview } from 'components/utils'

import './ManageNewsletter.scss'

const TabPane = Tabs.TabPane
const tabs = [
  { key: 'published', title: 'Scheduled' },
  { key: 'draft', title: 'Draft' },
  { key: 'deleted', title: 'Deleted' },
]

const ManageNewsletter = () => {
  const [tab, setTab] = useState("published")
  const [showPreview, setShowPreview] = useState(false)
  const [previewItem, setPreviewItem] = useState()

  useEffect(() => {
    logEvent('page_visit_start', { page: 'manage-newsletter' })
    return () => {
      logEvent('page_visit_end', { page: 'manage-newsletter' })
    }
  }, [])

  const handleTabChange = (key) => {
    setTab(key)
  }

  const handleShowPreview = (preview) => {
    setPreviewItem(preview)
    setShowPreview(true)
  }

  const handleClosePreview = () => {
    setShowPreview(false)
  }

  return (
    <div className="manage-newsletter">
      <NewsletterStats />

      <Row justify="center" align="center">
        <Col>
          <div className="management-newsletter-wrapper">
            <h2>Manage Newsletters</h2>
          </div>
        </Col>
      </Row>

      <Tabs
        activeKey={tab}
        onChange={handleTabChange}
        tabBarStyle={{ paddingLeft: '24px', backgroundColor: '#fff' }}>
        {tabs.map(({ key, title }) => (
          <TabPane tab={title} key={key}>
            <NewsletterList onPreview={handleShowPreview} status={key} />
          </TabPane>
        ))}
      </Tabs>

      {showPreview &&
        <Preview
          title={previewItem.title}
          content={previewItem.content}
          onClose={handleClosePreview}
        />
      }
    </div>
  )
}

export default ManageNewsletter