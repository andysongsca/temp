import React from 'react'
import {connect} from 'react-redux'
import {fetchSelf} from 'redux/login'
import {setAccountId} from '../utils/user'

export default Component => {
  class WrappedComponent extends React.Component {
    getSelf = force => {
      return new Promise(resolve => {
        const {self, fetchSelf, isFetchSelfPending} = this.props
        if (isFetchSelfPending === undefined || force === true) {
          fetchSelf().then(({value: {data}}) => {
            const user = data
            setAccountId(user.media_id)
            resolve(user)
          }).catch(() => resolve(null))
        } else {
          resolve(self)
        }
      })
    }

    render() {
      const {fetchSelf, ...rest} = this.props

      return (
        <Component
          getSelf={this.getSelf}
          {...rest}
        />
      )
    }
  }

  return connect(
    ({login}) => login,
    {fetchSelf}
  )(WrappedComponent)
}
