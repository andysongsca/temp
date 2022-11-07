import React, { useEffect, useState } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import { Button } from 'antd'
import { Switch, Link } from 'react-router-dom'
import BodyClassName from 'react-body-classname'
import { Redirect } from 'react-router'
import { useCookies } from 'react-cookie'

import withAuth from 'hocs/withAuth'
import { logout, updatePolicy } from 'redux/login'
import Nav from 'components/Nav'
import { AuthRoute } from 'components/AuthRoute'
import { ReferralModal, CVScoreModal, ModalContext, ArticleAppealForm, AppealSubmittedModal } from 'components/Creator'
import { Loading } from 'components/utils'
import { MonetizationTerms, CreatorTos, PolicyModal, MonetizationTermsOpenRegistration, MonetizationTermsV2 } from 'components/Policy'
import { ReactComponent as IconHomeActive } from 'asset/svg/home-active.svg'
import { ReactComponent as IconHome } from 'asset/svg/home-noactive.svg'
import { ReactComponent as IconContent } from 'asset/svg/content.svg'
import { ReactComponent as IconAnalytics } from 'asset/svg/analytics-noactive.svg'
import { ReactComponent as IconAnalyticsActive } from 'asset/svg/analytics-active.svg'
import { ReactComponent as IconReaderReferral } from 'asset/svg/reader-referral.svg'
import { ReactComponent as IconReaderReferralActive } from 'asset/svg/reader-referral-active.svg'
import { ReactComponent as IconCreatorReferral } from 'asset/svg/creator-referral.svg'
import { ReactComponent as IconCreatorReferralActive } from 'asset/svg/creator-referral-active.svg'
import { ReactComponent as IconLocalInsights } from 'asset/svg/local-insights.svg'
import { ReactComponent as IconLocalInsightsActive } from 'asset/svg/local-insights-active.svg'
import { ReactComponent as IconMonetization } from 'asset/svg/monetization-noactive.svg'
import { ReactComponent as IconMonetizationActive } from 'asset/svg/monetization-active.svg'
import { ReactComponent as IconProfileSetting } from 'asset/svg/profile-settings.svg'
import { ReactComponent as IconProfileSettingActive } from 'asset/svg/profile-settings-active.svg'
import { ReactComponent as IconManageCircle } from 'asset/svg/manage-circle.svg'
import { ReactComponent as IconManageCircleActive } from 'asset/svg/manage-circle-active.svg'
import { ReactComponent as IconNewsletter } from 'asset/svg/newsletter.svg'
import Content, { statusRegex } from './Content'
import logEvent from 'utils/logEvent'
import { monetizationApplicationMap } from 'utils/utilities'
import { CreatorHome, PublisherHome } from './Home'
import { Post, VideoPost, Moments, VideoMoments } from './Post'
import Comments from './Comments'
import { Analytics, ReaderReferralStats, CreatorReferralStats } from './Analytics'
import { Strikes } from './Content'
import { Setting, SettingEdit } from './Setting'
import AccountSetting from './AccountSetting'
import Monetization from './Earnings/Monetization'
import MonetizationApplication from './Earnings/MonetizationApplication'
import JournalistHoursLogging from './Earnings/JournalistHoursLogging'
import Earnings from './Earnings'
import { ContentInsight } from './Insight'
import { Circle } from './Circle'
import { CreateNewsletter, ManageNewsletter, SettingNewsletter } from './Newsletter'
import './index.scss'

const NavItem = (props) => {
  const { to, active, children } = props
  const { pathname } = window.location
  const isActive = active ? pathname.match(active) : pathname === to
  return (
    <li className={cx('Home-NavItem', isActive && 'active')}>
      <Link to={to}>
        {children}
      </Link>
    </li>
  )
}

const NavItemGroup = (props) => {
  const { icon, name, label, active, children } = props
  const [cookies, setCookie] = useCookies([name]);
  const [expanded, setExpanded] = useState(cookies[name] === 'expanded')
  const { pathname } = window.location
  const isActive = active ? pathname.match(active) : false

  return <li className={cx('Home-NavItem-Header', expanded && 'expanded')}>
    <ul className='Home-Nav'>
      <li
        className={cx('Home-NavItem', isActive && 'active')}
        onClick={() => {
          setExpanded(!expanded)
          setCookie(name, expanded ? 'closed' : 'expanded', { path: '/' })
        }}
      >
        <div className="icon">
          {icon}
        </div>
        <span>{label}</span>
        <div className={cx('toggle-arrow', expanded && 'up')} />
      </li>
      {children}
    </ul>
  </li>
}

const HomeNav = (props) => {
  const { self } = props
  const terminated = self && self.violations && self.violations.count > 2
  if (terminated) {
    return (
      <ul className='Home-Nav'>
        <NavItem to='/home/content/strike'>
          <span className="no-icon">Strike Management</span>
        </NavItem>
      </ul>
    )
  }
  return (
    <ul className='Home-Nav'>
      <NavItem to='/home' active={/^\/(home)?$/}>
        <div className='icon'>
          <IconHome className="svg-noactive" />
          <IconHomeActive className="svg-active" />
        </div>
        <span>Home</span>
      </NavItem>
      {self.enable_internal_circle && <NavItem to='/home/circle'>
        <div className='icon'>
          <IconManageCircle className="svg-noactive" />
          <IconManageCircleActive className="svg-active" />
        </div>
        <span>Manage Circle</span>
      </NavItem>}
      <NavItem to='/home/content/post' active={new RegExp(`^/home/content/(${statusRegex})$`)}>
        <div className='icon'><IconContent width={10} height={10} /></div><span>Manage Content</span>
      </NavItem>
      <NavItem to='/home/post' active={/^\/home\/post/}>
        <span className="no-icon">New Article</span>
      </NavItem>
      {self.enable_video && <NavItem to='/home/vpost' active={/^\/home\/vpost/}>
        <span className="no-icon">New Video</span>
      </NavItem>}
      <NavItem to='/home/content/strike'>
        <span className="no-icon">Strike Management</span>
      </NavItem>
      {/* disable OG for now <>
          <NavItem to='/home/post' active={/^\/home\/nowhere/}>
            <div className='icon'><IconPost width={10} height={10} /></div><span>New Article</span>
          </NavItem>
          <NavItem to='/home/post' active={/^\/home\/post/}>
            <span className="no-icon">Original</span>
          </NavItem>
          <NavItem to='/home/share' active={/^\/home\/share/}>
            <span className="no-icon">Share Article</span>
          </NavItem>
        </>} */}
      {self.enable_internal_ugc && <NavItem to='/home/moments'>
        <div className='icon'>
          <IconLocalInsights className="svg-noactive" />
          <IconLocalInsightsActive className="svg-active" />
        </div>
        <span>Moments</span>
      </NavItem>}
      {self.enable_internal_ugc_video && <NavItem to='/home/vmoments'>
        <div className='icon'>
          <IconLocalInsights className="svg-noactive" />
          <IconLocalInsightsActive className="svg-active" />
        </div>
        <span>Video Moments</span>
      </NavItem>}
      {self.enable_internal_newsletter && <NavItemGroup
        icon={<IconNewsletter />}
        name="nav_newsletter"
        label="Newsletter"
        active={/^\/home\/newsletter\//}
      >
        <NavItem to='/home/newsletter/create'>
          <span className="secondary">Create Newsletter</span>
        </NavItem>
        <NavItem to='/home/newsletter/manage'>
          <span className="secondary">Manage Newsletter</span>
        </NavItem>
        <NavItem to='/home/newsletter/setting'>
          <span className="secondary">Settings</span>
        </NavItem>
      </NavItemGroup>}
      {self.is_creator && <NavItem to='/home/content-insight'>
        <div className='icon'>
          <IconLocalInsights className="svg-noactive" />
          <IconLocalInsightsActive className="svg-active" />
        </div>
        <span>Content Insights</span>
      </NavItem>}
      <NavItem to='/home/analytics'>
        <div className='icon'>
          <IconAnalytics width={10} height={10} className="svg-noactive" />
          <IconAnalyticsActive width={10} height={10} className="svg-active" />
        </div>
        <span>Analytics</span>
      </NavItem>
      {self.is_creator && <>
        {self.should_show_referrals && <>
          <NavItem to='/home/analytics/reader-referral'>
            <div className='icon'>
              <IconReaderReferral className="svg-noactive" />
              <IconReaderReferralActive className="svg-active" />
            </div>
            <span>User Referral</span>
          </NavItem>
          <NavItem to='/home/analytics/creator-referral'>
            <div className='icon'>
              <IconCreatorReferral className="svg-noactive" />
              <IconCreatorReferralActive className="svg-active" />
            </div>
            <span>Contributor Referral</span>
          </NavItem> </>}
        {self.should_show_earning && <NavItem to='/home/earnings' active={/^\/home\/(earnings|monetization|journalist_hours)/}>
          <div className='icon'>
            <IconMonetization className="svg-noactive" />
            <IconMonetizationActive className="svg-active" />
          </div>
          {(self.monetization_application === monetizationApplicationMap.Approved || self.monetization_application === monetizationApplicationMap.Not_Applicable) && <span>Earnings</span>}
          {(self.monetization_application === monetizationApplicationMap.Applied || self.monetization_application === monetizationApplicationMap.Not_Applied || self.monetization_application === monetizationApplicationMap.Rejected_Snoozed) && <span>Monetization</span>}
        </NavItem>}
      </>}
      <NavItem to='/home/setting'>
        <div className='icon'>
          <IconProfileSetting className="svg-noactive" />
          <IconProfileSettingActive className="svg-active" />
        </div>
        <span>Profile Settings</span>
      </NavItem>
    </ul>
  )
}

const HomeContainer = (props) => {
  const { self, logout, updatePolicy } = props
  const isCreator = self && self.is_creator;
  const [showCVScoreModal, setShowCVScoreModal] = useState(false)
  const [showAppealModal, setShowAppealModal] = useState(false)
  const [showAppealSubmitted, setShowAppealSubmitted] = useState(false)
  const [referralMode, setReferralMode] = useState(-1)
  const [agreeMoney, setAgreeMoney] = useState(false)
  const [agreeTos, setAgreeTos] = useState(isCreator && self.policy && self.policy.tos_version < self.policy.latest_tos_v)
  const [showTosModal, setShowTosModal] = useState(false)
  const [agreePaymentLatest, setAgreePaymentLatest] = useState(false)
  const [showMonetizationModal, setShowMonetizationModal] = useState(false)
  const [cookies, setCookie] = useCookies(['show_payment', 'cvs_notification']);
  const [appealTask, setAppealTask] = useState({
    taskId: "",
    title: "",
  });
  const HomeMain = isCreator ? CreatorHome : PublisherHome;
  const shouldShowEarning = isCreator && self.should_show_earning && self.monetization_application !== monetizationApplicationMap.Rejected_Indefinitely
  const source = self && self.creator_info && self.creator_info.source
  const isSourceOpen = source === "open registration"
  const paymentNewTerm = self && self.policy && self.policy.latest_payment_v === 3
  const qualifiedMonetization = self && (self.payment_tier === 'Tier 1' || self.payment_tier === 'Tier 2')

  useEffect(() => {
    setShowCVScoreModal(isCreator && self.should_show_earning && self.policy && self.policy.latest_payment_v === 3 &&
      qualifiedMonetization && self.policy.payment_version < self.policy.latest_payment_v && !agreePaymentLatest
      && cookies.cvs_notification !== "shown")
  }, [self, agreePaymentLatest])

  const updateTosPolicy = () => {
    const policy_v = self && self.policy && self.policy.latest_tos_v ? self.policy.latest_tos_v : 1
    updatePolicy('tos', policy_v).then(() => {
      self.policy.tos_version = policy_v
    })
    setShowTosModal(false)
  }

  const onLogout = () => {
    logout().then(() => {
      window.location.href = '/login'
    })
  }

  const onReadMore = () => {
    setShowCVScoreModal(false)
    setShowMonetizationModal(true)
  }

  const updateMoneyPolicy = () => {
    if (agreeMoney) {
      logEvent('monetization_policy_agreed', { src: 'policy_modal' })
      const payment_v = self && self.policy && self.policy.latest_payment_v ? self.policy.latest_payment_v : 1
      updatePolicy('payment', payment_v).then(() => {
        self.policy.payment_version = payment_v
        setAgreePaymentLatest(true)
      })
    }
    setShowMonetizationModal(false)
  }

  const setPaymentCookie = () => {
    let date = new Date();
    // set cookie to expire in 5 days
    date.setTime(date.getTime() + (5 * 24 * 60 * 60 * 1000));
    setCookie('show_payment', "shown", { path: '/', expires: date })
  }

  const setNewTermCookie = () => {
    let date = new Date();
    // set cookie to expire in 3 days
    date.setTime(date.getTime() + (3 * 24 * 60 * 60 * 1000));
    setCookie('cvs_notification', "shown", { path: '/', expires: date })
  }

  const earningsComponent = self && self.is_journalist ? JournalistHoursLogging : self && (self.monetization_application === monetizationApplicationMap.Approved ||
    self.monetization_application === monetizationApplicationMap.Not_Applicable) ? Earnings : MonetizationApplication

  return (
    <ModalContext.Provider
      value={{
        openReaderReferralModal: () => setReferralMode(0),
        openCreatorReferralModal: () => setReferralMode(1),
        openMonetizationModal: () => {
          const { policy } = self
          if (self && self.should_show_earning && policy && policy.tos_version >= 1 && policy.payment_version < policy.latest_payment_v &&
            (self.payment_tier === "Tier 1" || self.payment_tier === "Tier 2")) {
            setShowMonetizationModal(true)
            return true
          }
          return false
        },
        openCVScoreModal: () => {
          setShowCVScoreModal(true)
          setCookie('cvs_notification', "shown", { path: '/' })
          logEvent('cvscore_modal_open')
        },
        openAppealModal: () => {
          setShowAppealModal(true)
        },
        openAppealSubmittedModal: () => {
          setShowAppealSubmitted(true)
        },
        updateAppealTask: ({ title, taskId }) => {
          setAppealTask({ title, taskId })
        }
      }}>
      <BodyClassName className='mp-light-body'>
        <div className='Home-Container'>
          <Nav />

          {self && <div className='Card Home-Sider'>
            <HomeNav self={self} />
          </div>}

          <div className='Home-Content'>
            {!self && <Loading />}
            <Switch>
              <AuthRoute exact path='/home' component={HomeMain} />
              <AuthRoute exact path='/home/post' component={Post} />
              <AuthRoute exact path='/home/post/:id' component={Post} />
              {/* <AuthRoute exact path='/home/share' component={Share} />
              <AuthRoute exact path='/home/share/:id' component={Share} /> */}
              <AuthRoute exact path='/home/vpost' component={self && self.enable_video ? VideoPost : HomeMain} />
              <AuthRoute exact path='/home/vpost/:id' component={self && self.enable_video ? VideoPost : HomeMain} />
              <AuthRoute exact path={`/home/content/:status(${statusRegex})`} component={Content} />
              <AuthRoute exact path='/home/content/strike' component={Strikes} />
              <AuthRoute exact path='/home/comments/:id/:title' component={Comments} />
              <AuthRoute exact path='/home/content-insight' component={isCreator ? ContentInsight : HomeMain} />
              <AuthRoute exact path='/home/circle' component={self && self.enable_internal_circle ? Circle : HomeMain} />
              <AuthRoute exact path='/home/analytics' component={Analytics} />
              <AuthRoute exact path='/home/moments' component={self && self.enable_internal_ugc ? Moments : HomeMain} />
              <AuthRoute exact path='/home/vmoments' component={self && self.enable_internal_ugc_video ? VideoMoments : HomeMain} />
              <AuthRoute exact path='/home/newsletter/create' component={self && self.enable_internal_newsletter ? CreateNewsletter : HomeMain} />
              <AuthRoute exact path='/home/newsletter/create/:id' component={self && self.enable_internal_newsletter ? CreateNewsletter : HomeMain} />
              <AuthRoute exact path='/home/newsletter/manage' component={self && self.enable_internal_newsletter ? ManageNewsletter : HomeMain} />
              <AuthRoute exact path='/home/newsletter/setting' component={self && self.enable_internal_newsletter ? SettingNewsletter : HomeMain} />
              <AuthRoute exact path='/home/analytics/reader-referral' component={isCreator ? ReaderReferralStats : HomeMain} />
              <AuthRoute exact path='/home/analytics/creator-referral' component={isCreator ? CreatorReferralStats : HomeMain} />
              <AuthRoute exact path='/home/analytics/:id' component={Analytics} />
              <AuthRoute exact path='/home/earnings' component={shouldShowEarning ? earningsComponent : HomeMain} />
              <AuthRoute exact path='/home/monetization' component={shouldShowEarning ? Monetization : HomeMain} />
              <AuthRoute exact path='/home/setting' component={Setting} />
              <AuthRoute exact path='/home/setting-edit' component={SettingEdit} />
              <AuthRoute exact path='/home/account_setting' component={AccountSetting} />
              <Redirect to="/home" />
            </Switch>
          </div>

          {self && <ReferralModal
            tab={referralMode}
            self={self}
            referralCode={(self.user_id + 12345).toString(16)}
            mediaId={self.media_id}
            onClose={() => {
              setReferralMode(-1)
              logEvent('referral_modal_close')
            }}
          />}


          {self && <CVScoreModal
            visible={showCVScoreModal}
            onReadMore={onReadMore}
            onClose={() => {
              setNewTermCookie()
              setShowCVScoreModal(false)
              logEvent('cvscore_modal_close')
            }}
          />}

          {self && <ArticleAppealForm
            title={appealTask.title}
            taskId={appealTask.taskId}
            visible={showAppealModal}
            onClose={() => {
              setShowAppealModal(false)
              logEvent('appeal_modal_close')
            }}
          />}

          {self && <AppealSubmittedModal
            visible={showAppealSubmitted}
            onClose={() => {
              setShowAppealSubmitted(false)
              window.location.href = '/home/content/strike'
              logEvent('appeal_submitted_modal_close')
            }}
          />}

          {showTosModal &&
            <PolicyModal
              title="NewsBreak Contributor Network Terms of Service"
              filename="creator-tos.pdf"
              visible={showTosModal}
              versionUpdate={true}
              footer={<>
                <Button key="cancel" className="cancel-btn" onClick={onLogout}>Log out</Button>
                <Button key="submit" type="primary" disabled={!agreeTos} onClick={updateTosPolicy}>Agree to our policy</Button>
              </>}
            >
              <CreatorTos showCheckbox={true} checked={agreeTos} onCheck={(e) => setAgreeTos(e.target.checked)} />
            </PolicyModal>
          }

          {isCreator &&
            <PolicyModal
              title="NewsBreak Contributor Monetization"
              filename={paymentNewTerm ? "monetization-terms-0721.pdf" : isSourceOpen ? "monetization-terms-or.pdf" : "monetization-terms.pdf"}
              visible={showMonetizationModal}
              footer={<>
                <Button key="cancel" className="cancel-btn" onClick={() => {
                  setShowMonetizationModal(false); setPaymentCookie();
                }}>Cancel</Button>
                <Button key="submit" type="primary" disabled={!agreeMoney} onClick={updateMoneyPolicy}>Agree to our terms</Button>
              </>}
            >
              {paymentNewTerm ?
                <MonetizationTermsV2 showCheckbox={true} checked={agreeMoney} onCheck={(e) => setAgreeMoney(e.target.checked)} /> :
                isSourceOpen ?
                  <MonetizationTermsOpenRegistration showCheckbox={true} checked={agreeMoney} onCheck={(e) => setAgreeMoney(e.target.checked)} />
                  :
                  <MonetizationTerms showCheckbox={true} checked={agreeMoney} onCheck={(e) => setAgreeMoney(e.target.checked)} />
              }
            </PolicyModal>
          }
        </div>
      </BodyClassName >
    </ModalContext.Provider >
  )
}

export default compose(
  withAuth,
  connect(
    null,
    { logout, updatePolicy }
  )
)(HomeContainer)
