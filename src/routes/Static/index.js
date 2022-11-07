import React from 'react'
import { Redirect, Route } from 'react-router-dom'
import { CreatorContentPolicy, CreatorContentRequirements, MonetizationPolicy, ContributorEditorialStandards, ContributorCommunityGuidelines } from '../../components/Policy'
import Terms from './Terms'
import CreatorRegistration from './CreatorRegistration'
import VideoCreatorRegistration from './VideoCreatorRegistration'
import Creators from './Creators'

export default [
  <Route exact path='/terms' key='terms' component={Terms} />,
  <Route exact path='/publisher-content-policy' key='publisher-policy' component={CreatorContentPolicy} />,
  <Route exact path='/creator-content-policy' key='creator-policy' component={CreatorContentPolicy} />,
  <Route exact path='/creator-content-requirements' key='creator-requirements' component={CreatorContentRequirements} />,
  <Route exact path='/monetization-policy' key='monetization-policy' component={MonetizationPolicy} />,
  <Route exact path='/contributor-editorial-standards' key='contributor-editorial-standards' component={ContributorEditorialStandards} />,
  <Route exact path='/contributor-code-of-conduct' key='contributor-code-of-conduct' component={ContributorCommunityGuidelines} />,
  <Route exact path='/register-article-creator' key='hubspot-article' component={CreatorRegistration} />,
  <Route exact path='/register-video-creator' key='hubspot-video' component={VideoCreatorRegistration} />,
  <Route exact path='/creators' key='creators' component={Creators} />,
  <Route exact path='/register' key='register' render={({ location }) => <Redirect
    to={{ pathname: '/creators', search: (location.search ? location.search + '&' : '?') + 'source=open' }}
  />} />,
  <Redirect exact from='/content-guidelines' key='guidelines' to='/creator-content-policy' />, // legacy link
]
