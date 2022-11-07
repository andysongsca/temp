import React from 'react'
import { Carousel } from 'antd'
import logEvent from '@/utils/logEvent'

const getPaid = [
  { title: 'Be authentic', text: 'Publish content based on your unique voice and subject matter expertise.', img: '2-2' },
  { title: 'Have a perspective ', text: 'Leverage your own instincts and diligence to tell a story that has and makes an impact.', img: '2-1' },
  { title: 'Engage your audience', text: 'Build and grow an audience of engaged followers through inspiring and informational content.', img: '2-3' },
]

const processes = [
  { title: 'Publish meaningful content', text: 'We provide the publishing tools and the platform. You provide the content while maintaining full creative and editorial control over what you submit.', img: '3-publish' },
  { title: 'Further your career', text: 'We offer competitive rates, referral bonuses and opportunities to participate in monthly content campaigns. We also provide valuable insights and analytics to help you succeed.', img: '3-paid' },
  { title: 'Join our community', text: 'Learn, discuss, and interact with other contributors by participating in our invite-only workshops, events, and meetups. Find inspiration and motivation from contributors who share your passion.', img: '3-follow' },
]

function Card(props) {
  const { data: { title, text, img }, styles } = props
  return <div className={styles.card}>
    <img src={require(`asset/creators/${img}.svg`)} alt={title} />
    <h3>{title}</h3>
    <p>{text}</p>
  </div>
}

export default ({ styles }) => {
  return <>
    <div id="earn" className={`${styles.section} ${styles['get-paid']}`}>
      <h2 className={styles.badge}>Become our contributor</h2>
      <p className={styles.desc}>Our Contributor Network brings together professional and aspiring journalists, writers, and
        high quality content contributors to cover everything from breaking local news to community events to hidden neighborhood gems.</p>
      <div className={styles['slide-viewport']}>
        <div className={styles.content}>
          {getPaid.map((data, index) => <Card key={index} data={data} styles={styles} />)}
        </div>
      </div>
      <Carousel afterChange={(current) => logEvent('creators_landing_earn_slider_go_' + current)}>
        {getPaid.map((data, index) => <Card key={index} data={data} styles={styles} />)}
      </Carousel>
    </div>

    <div id="how" className={`${styles.section} ${styles.how}`}>
      <h2 className={styles.badge}>How the program works</h2>
      <div className={styles.content}>
        {processes.map((process, index) => <Card key={index} data={process} styles={styles} />)}
      </div>
      <Carousel afterChange={(current) => logEvent('creators_landing_how_slider_go_' + current)}>
        {processes.map((process, index) => <Card key={index} data={process} styles={styles} />)}
      </Carousel>
    </div>
  </>
}
