import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Helmet from 'react-helmet'
import { loadReCaptcha } from 'react-recaptcha-google'

import Layout from 'components/Layout'
import logEvent from 'utils/logEvent'
import { store } from './redux'
import Routes from './routes'
import './App.scss'

class App extends Component {
  componentDidMount() {
    loadReCaptcha()
    window.addEventListener('unload', () => logEvent('page_visit_end'));
  }

  render() {
    const { pathname, hostname, search } = window.location
    const isCreator = hostname === 'creators.newsbreak.com' || search.indexOf('user_type=creator') >= 0
    let title
    if (pathname === '/creators') {
      title = 'Join NewsBreak\'s Contributor Network!'
    } else {
      title = isCreator ? 'NewsBreak Contributor Platform' : 'NewsBreak Publisher Platform'
    }

    return (
      <Provider store={store}>
        <BrowserRouter basename="/">
          <div className="App">
            <Helmet title={title} />
            <Layout>
              <Routes isCreator={isCreator} />
            </Layout>
          </div>
        </BrowserRouter>
      </Provider>
    )
  }
}

export default App
