import React from 'react'
import './Page404.scss'

class Page404 extends React.Component {
  render() {
    return (
      <div className='Page404'>
        <img className='img' src={require('asset/img/404.png')} alt=""/>
        <div className='text'>
          <h1>Oops</h1>
          <span>We’re having difficulty connecting to the server. Check your connection or try again later.</span>
        </div>
      </div>
    )
  }
}

export default Page404
