import React, { useEffect, useRef } from 'react'
import { Button } from 'antd'
import BodyClassName from 'react-body-classname'
import logEvent from 'utils/logEvent'
import Header from './Header'
import SectionTestimonial from './Creators/SectionTestimonial'
import SectionFAQ from './Creators/SectionFAQ'
import SectionProgram from './Creators/SectionProgram'
import styles from './Creators.module.scss'
/* global nbpix */

export default function Creators() {
  const query = new URLSearchParams(window.location.search)
  const referral_code = query.get('referral_code')
  const videoPlayedTs = useRef(0)

  useEffect(() => {
    logEvent('page_visit_start', { page: 'creators_landing', referrer: document.referrer, test_var: 'b' })
    return () => {
      logEvent('page_visit_end', { page: 'creators_landing', test_var: 'b' })
    }
  }, [])

  const onApply = (e) => {
    let { target } = e
    while (target && !target.id) {
      target = target.parentElement
    }
    logEvent('creators_landing_click_register', { target: target ? target.id : null })
    if (nbpix) {
      nbpix('event', 'apply_now_clicked')
    }
    window.location = '/creator-register?source=open' + (referral_code ? `&referral_code=${referral_code}` : '')
  }

  const onLogin = (e) => {
    let { target } = e
    while (target && !target.id) {
      target = target.parentElement
    }
    logEvent('creators_landing_click_login', { target: target ? target.id : null })
    window.location = '/creator-login'
  }

  return <BodyClassName className={`mp-light-body ${styles.Creators}`}>
    <>
      <Header className="narrow" content="creators">
        <Button className={`${styles.roundBtn} ${styles['create-with-us-btn']}`} type="primary" onClick={onApply} id="create-with-us">Apply now</Button>
        <Button className={`${styles.roundBtn} ${styles['creators-login-btn']}`} type="ghost" onClick={onLogin} id="login-header">Log in</Button>
      </Header>

      <div className="page-content">
        <div className={`${styles.section} ${styles.main}`}>
          <div className={styles.splash}>
            <div>
              <h1>Publish & Earn on NewsBreak</h1>
              <p>In addition to the thousands of traditional media outlets NewsBreak distributes, NewsBreak is also a home for high quality independent journalists, bloggers, writers and video contributors to publish local content directly to our users. Through the NewsBreak Contributor Network, you can find and grow your audience while earning revenue for your contribution to our program. We supply the readers, you supply the content.</p>
              <div className={styles['btn-container']}>
                <Button className={styles.roundBtn} type="primary" onClick={onApply} id="apply-to-join">Apply to join</Button>
                <Button className={`${styles.roundBtn} ${styles['mobile-login-btn']}`} type="ghost" onClick={onLogin} id="login-main">Log in</Button>
              </div>
            </div>
            <video
              controls
              poster="https://static.particlenews.com/mp/creatorlandingpage_20211215.jpg"
              onPlay={() => videoPlayedTs.current = new Date().getTime()}
              onPause={() => {
                if (videoPlayedTs.current > 0) {
                  const watchedTime = new Date().getTime() - videoPlayedTs.current
                  videoPlayedTs.current = 0
                  logEvent('creators_landing_video_watched', { watched_time: Math.round(watchedTime / 1000) })
                }
              }}
            >
              <source
                src="https://static.particlenews.com/mp/creatorlandingpage_20211215_lo.mp4"
                type="video/mp4"
              />
            </video>
          </div>
          <div className={styles['down-arrow']} onClick={() => window.scroll({ top: 800, behavior: 'smooth' })} />
          <div id="about" className={styles.success}>
            <h2 className={styles.badge}>Why Local?</h2>
            <p className={styles.desc}>Despite over half of counties in the US no longer having daily or weekly newspapers and over 30,000 newsroom jobs eliminated in the past decade, Local News continues to build and foster community now more than ever.  We want your help to keep Local News alive. Whether you are an independent journalist, a food blogger, an aspiring writer, or just passionate about Local News, information, and events, we want to work with you.</p>
          </div>
          <div className={styles.content}>
            <div className={styles.card}>
              <h1>45M</h1>
              <p>Monthly Active Users</p>
            </div>
            <div className={styles.card}>
              <h1>1 & 2</h1>
              <p>#1 in News on Google Play<br />#2 in News in the App Store</p>
              <p className={styles.light}>RANKINGS IN 2020</p>
            </div>
            <div className={styles.card}>
              <h1>1.5B</h1>
              <p>Page Views Per Month</p>
            </div>
          </div>
        </div>

        <SectionProgram styles={styles} />
        <SectionTestimonial styles={styles} onApply={onApply} />
        <SectionFAQ styles={styles} />

        <div className={`${styles.section} ${styles.footer}`}>
          <div className={styles.company}>
            <img alt="NewsBreak" src="https://static.particlenews.com/mp/NB-logo.svg" />
            <p>&#x24B8; 2021 NewsBreak. All Rights Reserved.</p>
          </div>
          <div className={styles.list}>
            <h5>Company</h5>
            <a href="https://www.newsbreak.com/about">About</a>
            <a href="https://www.newsbreak.com/mission">Mission</a>
            <a href="https://support.newsbreak.com/knowledge">Contact</a>
            <a href="https://www.newsbreak.com/careers">Careers</a>
          </div>
          <div className={styles.list}>
            <h5>Contributor Network</h5>
            <a href="/creator-content-policy">Content Policy</a>
            <a href="/creator-content-requirements">Content Requirements</a>
            <a href="/contributor-editorial-standards">Editorial Standards</a>
            <a href="/contributor-code-of-conduct">Contributor Code of Conduct</a>
          </div>
          <div className={styles.list}>
            <h5>NewsBreak Sites</h5>
            <a href="https://www.newsbreak.com/map">Map</a>
            <a href="https://creators.newsbreak.com">Contributors</a>
            <a href="https://mp.newsbreak.com">Publishers</a>
            <a href="https://business.newsbreak.com">Advertisers</a>
          </div>
          <div className={styles.list}>
            <h5>Legal</h5>
            <a href="https://www.newsbreak.com/terms">Terms of Use</a>
            <a href="https://www.newsbreak.com/privacy">Privacy Policy</a>
            <a href="https://www.newsbreak.com/ccpa">Don't Sell My Info</a>
            <a href="https://creators.newsbreak.com/terms">Contributor Terms of Use</a>
          </div>
        </div>
      </div>
    </>
  </BodyClassName >
}
