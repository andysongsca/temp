import React from 'react'
import { Tooltip } from 'components/utils'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import EarningsHeader from './EarningsHeader'

export default (props) => {
  const { title, period, total, data } = props

  return <div className="section">
    <EarningsHeader title={title} period={period} data={total} />
    <div className="earning-item">
      <div className="earning-body">
        <div className="row">
          <div className="desc">Description</div>
          <div className="desc">Rate</div>
          <div className="desc">Referrals</div>
          <div className="desc">Amount</div>
        </div>

        {data.map((item, index) => {
          const { title, rate, count, amount, tooltip } = item
          return <div className="row" key={index}>
            <div>
              {title}
              {tooltip && <Tooltip title={tooltip}>
                <IconInfo />
              </Tooltip>}
            </div>
            <div>${rate.toFixed(2)}</div>
            <div>{count}</div>
            <div>${amount.toFixed(2)}</div>
          </div>
        })}
      </div>

      <div className="earning-footer">
        <div className="row">
          <div>Total</div>
          <div>${total.toFixed(2)}</div>
        </div>
      </div>
    </div>
  </div>
}
