import React, { useRef } from 'react'
import { Collapse } from 'antd'
import logEvent from 'utils/logEvent'
import { ReactComponent as IconChevron } from 'asset/svg/chevron-down.svg'

const faqs = [
  {
    title: 'Who is a good fit for NewsBreak’s Contributor Network?',
    text: <p>All kinds of contributors at all different levels are welcome! We want the voices on our platform to be as diverse as the local communities we serve.</p>
  },
  {
    title: 'What type of content is NewsBreak looking for?',
    text: <><p>At our core, NewsBreak is a local platform. Although we have contributors covering many different topics, we are especially interested in those who bring unique local insights, experiences or stories to the community.</p>
      <p>All Contributor content must follow the <a href="/creator-content-policy" target="_blank" rel="noreferrer noopener">NewsBreak Content Policy</a>, <a href="/creator-content-requirements" rel="noopener noreferrer" target="_blank">Contributor Content Requirements</a> and the <a href="/contributor-editorial-standards" rel="noopener noreferrer" target="_blank">Editorial Standards & Guidelines</a> to be distributed widely on NewsBreak.</p></>
  },
  {
    title: 'How can I begin publishing on NewsBreak?',
    text: <p>First, <a href="https://creators.newsbreak.com/creator-register?source=open" target="_blank" rel="noreferrer noopener">sign up</a> for the Contributor Network. From there, you can easily build your profile and start writing. Video contributors must <a href="https://creators.newsbreak.com/register-video-creator?source=open" target="_blank" rel="noreferrer noopener">apply to join</a> and undergo a review process. If accepted, you can publish both written and video stories via the same account.</p>
  },
  {
    title: 'Are there different types of Contributors on NewsBreak?',
    text: <><p>We have 3 types of Contributors on NewsBreak: Community Voice, Journalist and Subject Matter Specialist.</p>
      <p>For more on each category, check out our Help Center <a href="https://support.newsbreak.com/knowledge/different-types-of-contributors" target="_blank" rel="noreferrer noopener">here</a>.</p></>
  },
  {
    title: 'Can I apply to be a different type of Contributor?',
    text: <p>Yes. Our Editorial Team evaluates these requests on a monthly basis.</p>
  },
  {
    title: 'How can I make money producing content for NewsBreak?',
    text: <p>To qualify for monetization, you will need to meet some minimum conditions, which include number of followers and pieces of approved content, as well as an editorial review. You can read more about monetization options <a href="https://support.newsbreak.com/knowledge/monetization-options-and-application" target="_blank" rel="noreferrer noopener">here</a>.</p>
  },
  {
    title: 'Who is NewsBreak’s audience?',
    text: <p>We are the nation's leading intelligent, local news app and have over 45 million monthly users. Read more <a href="https://www.newsbreak.com/about" target="_blank" rel="noreferrer noopener">here</a>.</p>
  },
  {
    title: 'How can I grow my audience with NewsBreak? ',
    text: <p>There is no secret, overnight formula, but there are a few strategies to gaining an audience and growing a community on NewsBreak. Consistency is key. This is true in the topics you cover as well as your frequency of posting. Engaging with the audience through comments is also a helpful way to gain traction. Read more <a href="https://www.newsbreak.com/news/2213543395287/finding-your-audience-and-community-on-news-break" target="_blank" rel="noreferrer noopener">here</a>.</p>
  },
  {
    title: 'How can I see how stories perform? ',
    text: <p>Analytics including impressions, page views, audience location and more are available in our Contributor Portal. Learn more about our analytics <a href="https://www.newsbreak.com/news/2298496630860/adding-local-insights-and-analytics-to-empower-newsbreak-creators" target="_blank" rel="noreferrer noopener">here</a>.</p>
  },
  {
    title: 'How else does NewsBreak empower local contributors?',
    text: <p>We regularly host events for our contributors to upskill and develop their freelance careers, send regular newsletters with important tips, tricks and information, and also have a private community to connect.</p>
  },
]

export default ({ styles }) => {
  const activeKeys = useRef([])

  // log which topic the user expands to view
  const onSelectTopic = (keys) => {
    if (keys.length > activeKeys.current.length) {
      logEvent('creator_landing_faq_clicked', { title: keys[keys.length - 1] })
    }
    activeKeys.current = keys
  }

  return <div id="faq" className={`${styles.section} ${styles.faqs}`}>
    <h2 className={styles.badge}>FAQ</h2>
    <p className={styles.desc}>
      Feel free to craft content that deeply resonates with you and that you believe will resonate with large audiences across the country.
      Read more in our <a href="https://support.newsbreak.com/knowledge" target="_blank" rel="noreferrer noopener">help center</a>.
    </p>
    <Collapse
      className={styles.content}
      onChange={onSelectTopic}
      expandIcon={({ isActive }) => <IconChevron style={{ transform: `rotate(${isActive ? 180 : 0}deg)` }} />}
    >
      {faqs.map((faq) => <Collapse.Panel className={styles.faq} header={faq.title} key={faq.title.substr(0, 30)}>
        {faq.text}
      </Collapse.Panel>)}
    </Collapse>
  </div >
}
