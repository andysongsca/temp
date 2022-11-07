import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { AuthRoute } from 'components/AuthRoute'
import { StripePayment } from './Home/Setting'
import Page404 from 'components/Page404'
import StaticRoutes from './Static'
import {
  Login,
  CreatorLogin,
  ActivateEmail,
  NewAccount,
  CreatePublisher,
  ForgetPassword,
  ResetPassword,
  Blocked
} from './Login'
import Home from './Home'
import Webview from './Webview'
import Unsubscribe from './Unsubscribe'

export default ({ isCreator }) => {
  return (
    <Switch>
      {StaticRoutes}
      <Route exact path='/login' key='login' component={isCreator ? CreatorLogin : Login} />,
      <Route exact path='/pubreg' key='register' component={isCreator ? CreatorLogin : Login} />,
      <Route exact path='/creator-login' key='creator-login' component={CreatorLogin} />,
      <Route exact path='/creator-register' key='creator-register' component={CreatorLogin} />,
      <Route exact path='/publisher-login' key='publisher-login' component={CreatorLogin} />,
      <Route exact path='/active-email' key='activate-email' component={ActivateEmail} />,
      <Route exact path='/activate-email' key='activate-email' component={ActivateEmail} />,
      <Route exact path='/forget-password' key='forget-password' component={ForgetPassword} />,
      <Route exact path='/reset-password' key='reset-password' component={ResetPassword} />,
      <Route exact path='/blocked' key='blocked' component={Blocked} />,
      <Route path='/home' component={Home} />
      <Route exact path='/webview' component={Webview} />
      <Route exact path='/user/unsubscribe' component={Unsubscribe} />
      <Redirect exact from='/' to={isCreator ? '/creators' : '/home'} />,
      <AuthRoute exact always path='/new-account' key='new-account' component={NewAccount} />,
      <AuthRoute exact always path='/create-publisher' key='create-publisher' component={CreatePublisher} />,
      <AuthRoute exact path='/home/stripe_payment' component={StripePayment} />
      <Route component={Page404} />
    </Switch>
  )
}
