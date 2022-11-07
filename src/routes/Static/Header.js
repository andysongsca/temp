import React, { useState } from 'react'
import logEvent from 'utils/logEvent'
import './Header.scss'

const Nav = ({ isCreator }) => {
  return (
    <ul className="common-header__nav">
      <li className="common-header__nav-item">
        <a className={`common-header__nav-text ${isCreator && 'active'}`} href="https://creators.newsbreak.com">
          Contributors
        </a>
      </li>
      <li className="common-header__nav-item">
        <a className={`common-header__nav-text ${!isCreator && 'active'}`} href="https://mp.newsbreak.com">
          Publishers
        </a>
      </li>
      <li className="common-header__nav-item">
        <a className="common-header__nav-text" href="https://www.newsbreak.com/mission">
          Mission
        </a>
      </li>
      <li className="common-header__nav-item">
        <a className="common-header__nav-text" href="https://www.newsbreak.com/careers">
          Careers
        </a>
      </li>
      <li className="common-header__nav-item">
        <a className="common-header__nav-text" href="https://www.newsbreak.com/contact">
          Contact
        </a>
      </li>
    </ul>
  )
}

const CreatorsNav = (props) => {
  const { onClick } = props
  const onClickLink = (e) => {
    if (e.target.tagName === 'A') {
      logEvent('creator_header_nav_click', { target: e.target.hash })
    }
    onClick && onClick()
  }

  return (
    <ul className="common-header__nav" onClick={onClickLink}>
      <li className="common-header__nav-item">
        <a className="common-header__nav-text" href="#about">About</a>
      </li>
      <li className="common-header__nav-item">
        <a className="common-header__nav-text" href="#earn">What</a>
      </li>
      <li className="common-header__nav-item">
        <a className="common-header__nav-text" href="#how">How</a>
      </li>
      <li className="common-header__nav-item">
        <a className="common-header__nav-text" href="#why">Why</a>
      </li>
      <li className="common-header__nav-item">
        <a className="common-header__nav-text" href="#faq">FAQ</a>
      </li>
      <li className="common-header__nav-item">
        <a className="common-header__nav-text" href="https://creators-blog.newsbreak.com">Blog</a>
      </li>
    </ul>
  )
}

export default function Header(props) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const { isCreator, content } = props

  const handleHamburgerToggle = () => {
    setSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className={`common-header ${props.className || ''}`}>
      <div className="common-header__wrapper">
        <div className="common-header__burger">
          <div className="btn-burger" onClick={handleHamburgerToggle}>
            <div className="btn-burger__line"></div>
            <div className="btn-burger__line"></div>
            <div className="btn-burger__line"></div>
          </div>
        </div>
        <div className="common-header__logo-wrapper">
          <a href="https://www.newsbreak.com"><img className="common-header__logo" src="https://static.particlenews.com/mp/NB-logo.svg" alt="logo" /></a>
        </div>
        <nav className="common-header__nav-wrapper">
          {content === 'creators' ? <CreatorsNav /> : <Nav isCreator={isCreator} />}
        </nav>
        {props.children}
      </div>
      <>
        <nav
          className={`nb-nav__sidebar ${isSidebarOpen && 'nb-nav__sidebar--open '}nb-nav ${isSidebarOpen && 'nb-nav--open'}`}
        >
          {content === 'creators' ? <CreatorsNav onClick={() => setSidebarOpen(false)} /> : <Nav isCreator={isCreator} />}
        </nav>
        <div
          className={`nb-backdrop${isSidebarOpen ? " nb-backdrop--open" : ""}`}
          onClick={handleHamburgerToggle}
        />
      </>
    </div>
  )
}
