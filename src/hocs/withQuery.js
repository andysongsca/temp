import React from 'react'
import qs from 'querystring'
import { withRouter } from 'react-router'

export const parseQuery = location => {
  return qs.parse(location.search.replace('?', ''))
}

export default Component => {
  class WrappedComponent extends React.Component {
    constructor(props) {
      super(props)
      props.location.query = parseQuery(props.location)
      this.oldQuery = {}
    }

    componentWillReceiveProps(nextProps) {
      if (!nextProps.location.query) {
        this.oldQuery = this.props.location.query
        nextProps.location.query = parseQuery(nextProps.location)
      }
    }

    setQuery = query => {
      const { location } = this.props
      for (let key in query) {
        if (query[key] === undefined) {
          delete query[key]
        }
      }
      this.goto(`${location.pathname}?${qs.stringify(query)}`)
    }

    addQuery = query => {
      const { location } = this.props
      const finalQuery = {
        ...location.query,
        ...query
      }
      this.setQuery(finalQuery)
    }

    goto = (url, replace = false) => {
      const { history } = this.props
      replace ? history.replace(url) : history.push(url)
    }

    render() {
      return (
        <Component
          setQuery={this.setQuery}
          addQuery={this.addQuery}
          goto={this.goto}
          {...this.props}
        />
      )
    }
  }

  return withRouter(WrappedComponent)
}