import React from 'react'
import Header from '../../../Static/Header'
import LoginBox from './LoginBox'

const ChangeEmail = (props) => {
  return <>
    <Header className="small" isCreator={props.isCreator || false} />
    <div className="Login simple">
      <div className="section-top">
        <div className="wrapper">
          <LoginBox {...props} title="Enter your email address" />
        </div>
      </div>
    </div>
  </>
}

export default ChangeEmail
