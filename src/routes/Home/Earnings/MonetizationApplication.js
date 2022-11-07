import React, { useEffect } from 'react'
import { compose } from 'redux'
import { connect, useDispatch } from 'react-redux'

import withAuth from 'hocs/withAuth'
import { fetchMonetizationApplication } from 'redux/login'
import { MonetizationNotApplied, MonetizationApplied, MonetizationRejected } from './component'
import { monetizationApplicationMap } from 'utils/utilities'

import './MonetizationApplication.scss'

const MonetizationApplication = (props) => {
  const { self, monetizationApplication } = props
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchMonetizationApplication())
  }, [])

  return (
    <div>
      {monetizationApplication && monetizationApplication.fetched 
        && self.monetization_application === monetizationApplicationMap.Not_Applied && !monetizationApplication.data.eligible_for_apply &&
        <MonetizationNotApplied applicationDetail={monetizationApplication.data} />}
      {monetizationApplication && monetizationApplication.fetched 
        && ((self.monetization_application === monetizationApplicationMap.Not_Applied && monetizationApplication.data.eligible_for_apply) ||
        self.monetization_application === monetizationApplicationMap.Applied) &&
        <MonetizationApplied />}
      {monetizationApplication && monetizationApplication.fetched 
        && self.monetization_application === monetizationApplicationMap.Rejected_Snoozed &&
        <MonetizationRejected applicationDetail={monetizationApplication.data} />}
    </div>
  )
}

export default compose(
  withAuth,
  connect(
    ({ login }) => login,
    { fetchMonetizationApplication }
))(MonetizationApplication)