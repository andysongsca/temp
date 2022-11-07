import React from 'react'
import { PublisherTos } from 'components/Policy'
import { CreatorTos } from 'components/Policy'
import './Terms.scss'

export default function Terms() {
  const isCreator = window.location.hostname !== 'mp.newsbreak.com'
  return (
    <div className='terms'>
      <div className='Nav-Logo'>
        <img className="Logo" src="https://static.particlenews.com/mp/NB-logo.svg" alt="NewsBreak" />
      </div>
      <h1 dir="ltr">
        {isCreator ? 'NewsBreak Contributor Network Terms of Service' :
          'NewsBreak Publisher Platform Terms of Service'}
      </h1>
      {isCreator ? <CreatorTos /> : <PublisherTos />}
    </div>
  )
}
