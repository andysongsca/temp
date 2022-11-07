import React from 'react'
import { Button, Carousel } from 'antd'
import logEvent from '@/utils/logEvent'

const testimonials = [
  {
    header: 'Local Blogger',
    img: '4-head1-b',
    name: 'Welcome2TheBronx',
    profile: 'https://www.newsbreak.com/@welcome2thebronx-563623',
    title: 'Welcome2TheBronx provides news and culture updates for the borough.',
    location: 'Bronx, NY',
    className: 'article',
    samples: [
      <a href="https://www.newsbreak.com/@welcome2thebronx-563623/2309030548554/largest-solar-panel-installation-in-the-bronx-is-coming-to-hunts-point"
        target="_blank" rel="noreferrer noopener">Largest Solar Panel Installation in The Bronx is Coming to...</a>,
      <a href="https://www.newsbreak.com/@welcome2thebronx-563623/2293953587164/group-seeks-to-open-salsa-museum-in-the-bronx"
        target="_blank" rel="noreferrer noopener">Group Seeks to Open Salsa Museum in the Bronx</a>,
      <a href="https://www.newsbreak.com/@welcome2thebronx-563623/2290686343259/we-are-the-south-bronx-not-sobro"
        target="_blank" rel="noreferrer noopener">We are the South Bronx, NOT 'SoBro'!</a>,
    ]
  },
  {
    header: 'Video Contributor',
    img: '4-head2-b',
    name: 'Reuben Mourad',
    profile: 'https://www.newsbreak.com/@reuben-mourad-804928',
    title: 'Mourad produces videos about local food, lifestyle and entertainment.',
    location: 'Los Angeles, CA',
    className: 'video',
    samples: [
      <a href="https://www.newsbreak.com/@reuben-mourad-804928/2254503546532/vegan-italian-classics-at-brothers-meatballs-in-hollywood"
        target="_blank" rel="noreferrer noopener">Vegan Italian Classics at Brothers Meatballs in Hollywood</a>,
      <a href="https://www.newsbreak.com/@reuben-mourad-804928/2292192194223/the-new-warner-bros-studio-tour-takes-you-inside-hollywood-like-never-before"
        target="_blank" rel="noreferrer noopener">The New Warner Bros Studio Tour Takes You Inside Hollywoo...</a>,
      <a href="https://www.newsbreak.com/@reuben-mourad-804928/2290252712469/a-waterpark-in-the-heart-of-the-desert-at-the-hyatt-regency-indian-wells"
        target="_blank" rel="noreferrer noopener">A Waterpark In The Heart of the Desert at the Hyatt Regency...</a>,
    ]
  },
  {
    header: 'Journalist',
    img: '4-head3-b',
    name: 'Shannon Cuthrell',
    profile: 'https://www.newsbreak.com/@shannon-cuthrell-1584000',
    title: 'Cuthrell covers business, tech and economic development news.',
    location: 'Charlotte, NC',
    className: 'article',
    samples: [
      <a href="https://www.newsbreak.com/@shannon-cuthrell-1584000/2294363128417/inside-the-6b-acquisition-of-charlotte-hq-d-extended-stay-america"
        target="_blank" rel="noreferrer noopener">Inside the $6B Acquisition of Charlotte-HQ’d Extended Stay...</a>,
      <a href="https://www.newsbreak.com/@shannon-cuthrell-1584000/2290950993533/upward-enrollment-trends-continue-at-charlotte-s-largest-private-schools"
        target="_blank" rel="noreferrer noopener">Upward Enrollment Trends Continue at Charlotte’s Largest...</a>,
      <a href="https://www.newsbreak.com/@shannon-cuthrell-1584000/2285306973258/main-street-revitalization-is-booming-in-towns-bordering-charlotte"
        target="_blank" rel="noreferrer noopener">Main Street Revitalization Is Booming in Towns Bordering...</a>,
    ]
  },
]

const TestimonialCard = (props) => {
  const { data: { header, img, name, profile, title, location, className, samples }, styles, index } = props
  return <div key={index} className={styles.testimonial}>
    <div className={styles.header}>
      {header}
    </div>
    <div className={styles.card}>
      <div className={styles['card-content']}>
        <a href={profile} target="_blank" rel="noreferrer noopener" className={styles.author}>
          <div className={styles.headshot} style={{ backgroundImage: `url(${require(`asset/creators/${img}.svg`)}` }} />
          <div className={styles.info}>
            <div className={styles.location}>{location}</div>
            <div className={styles.name}>{name}</div>
            <div className={styles.title}>{title}</div>
          </div>
        </a>
        <ul className={`${styles.samples} ${styles[className]}`}>
          {samples.map((item, id) => <li key={id}>{item}</li>)}
        </ul>
      </div>
    </div>
  </div>
}

export default ({ styles, onApply }) => {
  return <div id="why" className={`${styles.section} ${styles.why}`}>
    <div className={styles.background}>&ldquo;</div>
    <h2>Creating on NewsBreak</h2>
    <p className={styles.desc}>Check out how we recently helped <a href="https://www.newsbreak.com/original">some of our writers</a> succeed
      from the ground up. You can take advantage of this opportunity and join our platform too.</p>
    <div className={styles.content}>
      {testimonials.map((data, index) => <TestimonialCard data={data} key={index} styles={styles} />)}
    </div>
    <Carousel afterChange={(current) => logEvent('creators_landing_why_slider_go_' + current)}>
      {testimonials.map((data, index) => <TestimonialCard data={data} key={index} styles={styles} />)}
    </Carousel>
    <Button className={styles.roundBtn} type="primary" onClick={onApply} id="get-started-today">Start today</Button>
  </div>
}
