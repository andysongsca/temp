import React, { useEffect, useState } from 'react'
import { animateScroll as scroll } from 'react-scroll'

import api from '@/utils/api'
import logEvent from '@/utils/logEvent'
import { notification } from '@/components/Notification'
import Header from '../../Static/Header'
import { LoginBox, ConfirmEmail, ChangeEmail } from './components'

import './Login.scss'

const defaultSlides = [
  {
    class: "s-middle",
    quote:
      "NewsBreak is an outlet for me to do what I love, which is write. And it’s an outlet for me to write the way I love to write. Not ‘who, what, where, when, how’, but likes, feelings, thoughts, experiences.",
    avatar: require("asset/img/avatar_1.png"),
    name: "Stacey Doud",
    loc: "Grapevine, TX",
    from: "Wrote about a conversation she had with a homeless guy in her town.",
    link:
      "https://www.newsbreakapp.com/news/0MDVrrVP/a-view-from-homeless-eyes-in-grapevine?docid=0MDVrrVP&id=0MDVrrVP&pd=02JkHJ2f&s=i0",
    title: "A View from Homeless Eyes in Grapevine, TX",
  },
  {
    class: "s-left",
    quote:
      "If I were to start a publisher by myself, the most difficult part would be to connect the people who are interested in the content I’m publishing. NewsBreak found those people for me.",
    avatar: require("asset/img/avatar_2.png"),
    name: "Glinda Bustamante",
    loc: "Spring, TX",
    from: "Wrote about the unpleasant experiences with her apartment complex.",
    link:
      "http://www.newsbreakapp.com/news/0MDQ0jts/we-have-been-robbed-twice-in-spring-texas?docid=0MDQ0jts&id=0MDQ0jts",
    title: "We have been robbed TWICE in Spring, TX",
  },
  {
    class: "s-right",
    quote:
      "NewsBreak lets me see the performance of my posts, as well as the feedbacks from the audience. I’m trying to get more impressions and clicks. Constructive criticism helps improve my writing.",
    avatar: require("asset/img/avatar_3.png"),
    name: "Michelle Shreeve",
    loc: "Queen Creek, AZ",
    from: "Wrote about an observation on some annoying, rude moviegoers.",
    link:
      "https://www.newsbreakapp.com/news/0MDIs99k/phoenix-ahwatukee-amc-24-has-forgotten-about-customer-service?docid=0MDIs99k&id=0MDIs99k",
    title: "Phoenix Ahwatukee AMC 24 Has Forgotten About Customer Service",
  },
]

const Login = () => {
  const isRegister = '/pubreg' === window.location.pathname
  const [status, setStatus] = useState('default')
  const [slides, setSlides] = useState(defaultSlides)
  const [email, setEmail] = useState('email')
  let currentSlide = 0
  let slideInterval = null

  const handleSlideChange = cur => {
    window.clearTimeout(slideInterval)
    let leftSlide = cur - 1
    leftSlide = leftSlide < 0 ? slides.length - 1 : leftSlide
    let rightSlide = cur + 1
    rightSlide = rightSlide < slides.length ? rightSlide : 0

    slides[leftSlide].class = "s-left"
    slides[cur].class = "s-middle"
    slides[rightSlide].class = "s-right"

    currentSlide = cur
    setSlides([...slides])
    slideInterval = window.setTimeout(slideChangeTimer, 5000)
  }

  const slideChangeTimer = () => {
    handleSlideChange((currentSlide + 1) % slides.length)
  }

  const handleResendEmail = (em) => {
    logEvent('publishers_confirm_email_resend', { email: em })
    api.post('/resend-email', { email: em, type: 0 }).then(() => {
      notification.success('Account activation email has been sent to your registered email.')
    })
    handleConfirmEmail(em)
  }

  const handleConfirmEmail = (em) => {
    setEmail(em)
    if (status !== 'confirmEmail') {
      setStatus('confirmEmail')
    }
  }

  const scrollToTop = () => {
    scroll.scrollToTop()
  }

  useEffect(() => {
    logEvent('page_visit_start', { page: isRegister ? 'publisher-register' : 'publisher-login' })
    slideInterval = window.setTimeout(slideChangeTimer, 5000)
    return () => {
      window.clearTimeout(slideInterval)
      logEvent('page_visit_end', { page: isRegister ? 'publisher-register' : 'publisher-login' })
    }
  }, [])

  if (status === 'confirmEmail') {
    logEvent('publishers_confirm_email_loaded', { email })
    return <ConfirmEmail
      email={email}
      onResendEmail={handleResendEmail}
      onChangeEmail={() => setStatus('changeEmail')}
    />
  }

  if (status === 'changeEmail') {
    return <ChangeEmail
      isRegister={isRegister}
      mode={status}
      onResendEmail={handleResendEmail}
      onConfirmEmail={handleConfirmEmail}
    />
  }

  return <>
    <Header className="small" />
    <div className="Login">
      <div className="section-top">
        <div className="wrapper">
          <div className="top">
            <img
              className="next_icon"
              src={require("asset/img/arrow_down.png")}
              alt="Show more"
              onClick={() => scroll.scrollTo(680)}
            />
            <div className="intro">
              <p className="text_1">News Publishers &amp; Independent Contributors:</p>
              <p className="text_2">NewsBreak helps you reach more readers!</p>
              <p className="text_3">
                NewsBreak is the nation’s leading local news app and we’re here to help you discover new local
                audiences that can dramatically extend the reach
                of your high-quality news &amp; information.
              </p>
              <p className="text_3">
                Log in and get YOUR local news &amp; special interest stories in front of millions of readers across the country.
              </p>
            </div>
            <LoginBox
              isRegister={isRegister}
              mode={status}
              onResendEmail={handleResendEmail}
              onConfirmEmail={handleConfirmEmail}
            >
              <div className="privacy-policy-text">
                To make NewsBreak work, we log user data and share it with service providers. Click “Continue” above to accept NewsBreak’s
                <a href="https://www.newsbreak.com/terms" target="_blank" rel="noopener noreferrer"> Terms of Service
                </a> & <a href="https://www.newsbreak.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
              </div>
            </LoginBox>
          </div>
        </div>
      </div>

      <div className="section-middle">
        <div className="hint">
          <img src={require("asset/img/how_arc.png")} alt="here's how it works"></img>
          <p>HERE’S HOW IT WORKS </p>
        </div>
        <div className="wrapper">
          <div className="middle">
            <div className="middle__item">
              <div className="middle__item-wrapper">
                <div className="middle__text-wrapper">
                  <div className="middle__item-text">
                    <div className="middle__number">
                      <img
                        className="middle__number-img"
                        src={require("asset/img/no_1.png")}
                        alt="icon"
                      ></img>
                      <img
                        className="middle__number-bg"
                        src={require("asset/img/no_local.png")}
                        alt="icon"
                      ></img>
                    </div>
                    <div className="middle__text-block">
                      <h2>Write About Your Town</h2>
                      <div className="red-bar"></div>
                      <h3>Local Matters</h3>
                      <p>Share your experience about your town that matters to you. To shed light on different perspectives of local issues,
                        you should make your insights, ideas, and experience visible to others.<br />
                        Local content matters, created by you.
                      </p>
                      <button onClick={scrollToTop}>
                        {isRegister ? <span>Sign Up? Go</span> : <span>Sign In? Go</span>}
                        <img src={require("asset/img/middle_arrow.png")} alt="icon"></img>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="middle__item-img">
                  <img src={require("asset/img/middle_first.png")} alt="icon"></img>
                </div>

                <div className="middle__sep"></div>
              </div>
            </div>
            <div className="middle__item">
              <div className="middle__item-wrapper middle__item-wrapper--mirrored">
                <div className="middle__item-img middle__item-img--w40">
                  <img src={require("asset/img/middle_second.png")} alt="icon"></img>
                </div>

                <div className="middle__text-wrapper middle__text-wrapper--w60">
                  <div className="middle__item-text middle__item-text--size-1">
                    <div className="middle__number">
                      <img
                        className="middle__number-img"
                        src={require("asset/img/no_2.png")}
                        alt="icon"
                      ></img>
                      <img
                        className="middle__number-bg"
                        src={require("asset/img/no_voice.png")}
                        alt="icon"
                      ></img>
                    </div>
                    <div className="middle__text-block">
                      <h2>10,000 People In Your Town Will Read</h2>
                      <div className="red-bar"></div>
                      <h3>Your Voice Matters</h3>
                      <p>NewsBreak open doors to the most down-to-earth and original content, and our editorial team will make
                        sure people read your writing. People want to read your ideas that could shape the local issues that impact us the most.
                      </p>
                      <button onClick={scrollToTop}>
                        {isRegister ? <span>Sign Up? Go</span> : <span>Sign In? Go</span>}
                        <img src={require("asset/img/middle_arrow.png")} alt="icon"></img>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="middle__sep"></div>
              </div>
            </div>
            <div className="middle__item">
              <div className="middle__item-wrapper">
                <div className="middle__text-wrapper">
                  <div className="middle__item-text">
                    <div className="middle__number">
                      <img
                        className="middle__number-img"
                        src={require("asset/img/no_3.png")}
                        alt="icon"
                      ></img>
                      <img
                        className="middle__number-bg"
                        src={require("asset/img/no_number.png")}
                        alt="icon"
                      ></img>
                    </div>

                    <div className="middle__text-block">
                      <h2>Your Story Is Impactful</h2>
                      <div className="red-bar"></div>
                      <h3>Numbers Matter</h3>
                      <p>There’s no getting around the fact that creating content takes effort. Your content can reach to many people,
                        and NewsBreak provides tools that tell you how far your content has reached.
                      </p>
                      <button onClick={scrollToTop}>
                        {isRegister ? <span>Sign Up? Go</span> : <span>Sign In? Go</span>}
                        <img src={require("asset/img/middle_arrow.png")} alt="icon"></img>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="middle__item-img">
                  <img src={require("asset/img/middle_third.png")} alt="icon"></img>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-last">
        <div className="last">
          <div className="hint">
            <img src={require("asset/img/how_arc.png")} alt="icon"></img>
            <p>Why do people love writing on NewsBreak?</p>
          </div>
          <div className="slides">
            {slides.map((item, index) => (
              <div key={index} className={"slide " + item.class}>
                <div className="quote">
                  <p>
                    <b>“ </b>
                    <span>{item.quote}</span>
                    <b> ”</b>
                  </p>
                </div>
                <div className="user">
                  <div className="avatar">
                    <img src={item.avatar} alt="icon"></img>
                  </div>
                  <div className="name">{item.name}</div>
                  <p className="loc">{item.loc}</p>
                  <p className="from">{item.from}</p>
                  <div className="down-arrow"></div>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    <img src={require("asset/img/link.png")} alt="icon"></img>
                    <p>{item.title}</p>
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="pagination">
            {slides.map((item, index) => (
              <div key={index} className={"dot " + item.class} onClick={() => handleSlideChange(index)}>
                <div className="solid"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-footer">
        <section className="footer-links">
          <a className="footer-logo" href="https://www.newsbreak.com/" target='_blank' rel="noopener noreferrer">
            <img alt="NewsBreak" src="https://static.particlenews.com/mp/NB-logo-w.svg" />
          </a>
          <section className="social">
            <a className="social-icon" href="https://www.facebook.com/newsbreaknow" rel="nofollow noopener noreferrer" target="_blank" title="NewsBreak on Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.0002 24.0003C18.6277 24.0003 24.0003 18.6277 24.0003 12.0002C24.0003 5.37266 18.6277 0 12.0002 0C5.37266 0 0 5.37266 0 12.0002C0 18.6277 5.37266 24.0003 12.0002 24.0003Z" fill="#444444" />
                <path d="M12.8894 12.526C12.7207 12.5311 12.7082 12.6936 12.7082 12.7794C12.7082 14.3261 12.7082 15.8722 12.7082 17.4179C12.7082 17.6888 12.7031 18.0416 12.4427 18.0416C11.6031 18.0416 11.9999 18.0548 10.8473 18.0548C10.5745 18.0548 10.5409 18.0611 10.5409 17.7882V12.7462C10.5409 12.4933 10.5363 12.4886 10.2891 12.4882C9.87128 12.4882 9.6873 12.4882 9.26944 12.4882C8.97632 12.4882 9.0001 12.4609 8.99035 12.2153C8.97632 11.8548 8.97632 10.8433 8.97632 10.5478C8.97632 10.4332 9.0153 10.3962 9.12756 10.3977C9.53021 10.4028 9.93287 10.3938 10.3359 10.4028C10.479 10.4059 10.5261 10.3673 10.5246 10.2188C10.5179 9.64698 10.507 9.07437 10.53 8.50371C10.5827 7.18426 11.3073 6.32087 12.5928 6.00591C13.1276 5.87533 13.6702 5.90534 14.2116 5.92094C14.4389 5.92756 14.6404 5.95329 14.8918 5.97083C14.9967 5.97824 15.0169 6.01994 15.0146 6.11155C15.0002 6.68298 14.9869 7.25442 14.9787 7.82664C14.9787 7.94007 14.9265 7.95839 14.8279 7.95839C14.35 7.95839 13.8713 7.91941 13.3938 7.96813C12.9974 8.00711 12.8049 8.19421 12.7702 8.5918C12.7195 9.15623 12.7604 9.72221 12.7468 10.2886C12.7437 10.4242 12.8345 10.4001 12.9124 10.4001C13.5429 10.4001 14.173 10.4001 14.8029 10.4001C15.0282 10.4001 15.0399 10.4001 15.0173 10.63C14.9592 11.219 14.8563 11.7873 14.7593 12.3198C14.7254 12.5077 14.6634 12.5201 14.5075 12.5209C13.8296 12.5252 13.5369 12.5244 12.8894 12.526Z" fill="#F1F1F1" />
              </svg>
            </a>
            <a className="social-icon" href="https://www.linkedin.com/company/particle-media-inc-/" rel="nofollow noopener noreferrer" target="_blank" title="NewsBreak on Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.0002 24.0003C18.6277 24.0003 24.0003 18.6277 24.0003 12.0002C24.0003 5.37266 18.6277 0 12.0002 0C5.37266 0 0 5.37266 0 12.0002C0 18.6277 5.37266 24.0003 12.0002 24.0003Z" fill="#444444" />
                <path d="M12.6749 10.8854C13.7936 9.5991 15.4034 9.36913 16.6301 9.84662C17.1267 10.0563 17.7013 10.6048 17.9585 11.2815C18.1924 11.8923 18.2805 12.5288 18.2848 13.1778C18.2949 14.7417 18.2949 16.3059 18.3238 17.8694C18.3308 18.2268 18.2119 18.3118 17.8802 18.2981C17.1751 18.2981 16.6905 18.2981 16.0185 18.2981C15.732 18.2981 15.6354 18.2291 15.6389 17.9263C15.6556 16.5982 15.6447 15.2702 15.6467 13.9418C15.652 13.6439 15.6266 13.3462 15.5711 13.0535C15.4436 12.4333 15.0982 12.0887 14.5576 12.0186C13.6611 11.9016 13.2401 12.1932 12.9781 12.7888C12.8671 13.041 12.8222 13.3096 12.809 13.5851C12.7353 15.0118 12.7622 16.4392 12.7805 17.8662C12.7848 18.212 12.6838 18.3126 12.342 18.2981C11.5468 18.2981 11.1371 18.295 10.4429 18.295C10.2024 18.3001 10.1186 18.2225 10.1194 17.9769C10.1261 15.3825 10.1261 12.7881 10.1194 10.1939C10.1194 9.93627 10.1973 9.8513 10.4597 9.8513H12.3588C12.6051 9.8513 12.6757 9.94485 12.6757 10.1752C12.678 10.3834 12.6749 10.5911 12.6749 10.8854Z" fill="#F1F1F1" />
                <path d="M5.88348 14.0762C5.88348 12.8098 5.89245 11.5426 5.87686 10.2773C5.87296 9.96116 5.94468 9.84851 6.28809 9.84851C6.94762 9.84851 7.45747 9.84851 8.11232 9.84851C8.47795 9.84851 8.5411 9.97325 8.5411 10.296C8.52901 12.121 8.53447 13.946 8.53564 15.771C8.53564 16.4914 8.53564 17.2133 8.54967 17.9313C8.55513 18.1999 8.47444 18.3055 8.18911 18.2973H6.2152C5.94858 18.3039 5.87725 18.2053 5.8792 17.9508C5.88894 16.6586 5.88348 15.3672 5.88348 14.0762Z" fill="#F1F1F1" />
                <path d="M8.74004 7.24399C8.73692 8.11635 8.08363 8.76418 7.20776 8.76418C6.36542 8.76418 5.66301 8.05983 5.6747 7.22528C5.67984 6.81778 5.84559 6.42877 6.13594 6.1428C6.42629 5.85683 6.81777 5.697 7.2253 5.69806C8.08986 5.70391 8.74316 6.37007 8.74004 7.24399Z" fill="#F1F1F1" />
              </svg>
            </a>
            <a className="social-icon" href="https://twitter.com/newsbreakApp" rel="nofollow noopener noreferrer" target="_blank" title="NewsBreak on LinkedIn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.0002 24.0003C18.6277 24.0003 24.0003 18.6277 24.0003 12.0002C24.0003 5.37266 18.6277 0 12.0002 0C5.37266 0 0 5.37266 0 12.0002C0 18.6277 5.37266 24.0003 12.0002 24.0003Z" fill="#444444" />
                <path d="M5.47738 16.2072C5.79205 16.2302 6.10797 16.2302 6.42263 16.2072C6.77061 16.1799 7.11504 16.1183 7.45091 16.0233C8.00116 15.8703 8.52428 15.6326 9.00151 15.3189C9.12905 15.2381 9.24965 15.1468 9.36207 15.046C8.76958 15.0172 8.24726 14.8453 7.79237 14.5042C7.33746 14.168 7.00015 13.6969 6.82841 13.1579C7.21637 13.2305 7.61553 13.2172 7.99779 13.1189C7.99506 13.0713 6.73096 12.6983 6.22812 11.7811C5.98645 11.3715 5.87731 10.9236 5.86406 10.45C5.86172 10.3802 5.90304 10.4172 5.9237 10.4285C6.18874 10.5682 6.4753 10.6626 6.7715 10.7076C6.867 10.7232 6.96639 10.724 7.07437 10.7322C5.85236 9.72614 5.59315 8.5205 6.23592 7.08606C6.40548 7.27121 6.55633 7.44272 6.71498 7.60722C7.68275 8.5995 8.89764 9.31574 10.2344 9.68209C10.7388 9.81987 11.2558 9.9062 11.7776 9.93974C11.8782 9.94598 11.8875 9.90856 11.8735 9.82592C11.6985 8.79414 12.0053 7.92217 12.7884 7.23847C13.338 6.75903 13.9967 6.55633 14.7307 6.60584C15.3899 6.64174 16.0116 6.92353 16.4731 7.39556C16.4933 7.41708 16.5194 7.43222 16.5482 7.43915C16.5769 7.44607 16.607 7.44447 16.6348 7.43454C17.1555 7.32164 17.6567 7.13264 18.1223 6.87362C18.155 6.85491 18.1909 6.84088 18.2564 6.81009C18.0553 7.41471 17.6538 7.9325 17.1182 8.27766C17.6249 8.23868 18.1028 8.09446 18.5951 7.89644C18.5312 8.04301 18.4423 8.14007 18.3632 8.2379C18.0772 8.60282 17.7428 8.927 17.3692 9.20147C17.3372 9.22217 17.3115 9.25134 17.2951 9.28575C17.2786 9.32015 17.272 9.35845 17.2761 9.39637C17.2984 10.1431 17.2104 10.889 17.0149 11.61C16.7405 12.6469 16.2636 13.6193 15.6116 14.4711C15.1223 15.1133 14.5317 15.6715 13.863 16.1238C13.3488 16.4719 12.7916 16.7517 12.2052 16.956C11.6619 17.1442 11.1 17.2737 10.5291 17.3423C9.98689 17.4074 9.4396 17.4191 8.89509 17.3774C8.20476 17.326 7.52493 17.1789 6.87518 16.9401C6.37822 16.7594 5.90088 16.5287 5.45049 16.2517C5.43374 16.24 5.41797 16.2269 5.40332 16.2127C5.41424 16.2057 5.42673 16.2015 5.43966 16.2006C5.45259 16.1996 5.46556 16.2019 5.47738 16.2072Z" fill="#F1F1F1" />
                <path d="M5.48391 16.1985L5.41071 16.2033C5.40081 16.2033 5.38657 16.2033 5.38301 16.1981C5.37945 16.193 5.38657 16.1807 5.39725 16.1815C5.42722 16.1775 5.45767 16.1835 5.48391 16.1985Z" fill="#444444" />
              </svg>
            </a>
          </section>
        </section>
        <section className="legal">
          <a href="https://www.newsbreak.com/terms" target="_blank" rel="noopener noreferrer">NewsBreak Terms of Use</a>
          <a href="https://www.newsbreak.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="/terms" target="_blank" rel="noopener noreferrer">Publisher Platform Terms of Service</a>
          <a href="/publisher-content-policy" target="_blank" rel="noopener noreferrer">Publisher Content Policy</a>
          <p className="copyright">&#x24B8; 2021 NewsBreak. All Rights Reserved.</p>
        </section>
      </div>
    </div>
  </>
}

export default Login
