import React from 'react'
import { Checkbox } from 'antd'
import './Policy.scss'

export default (props) => {
  return (
    <div className="policy monetization">
      <p>Once accepted into the NewsBreak Creator Program (the “Program”), you must agree to the NewsBreak monetization terms (“Monetization Terms”) to earn money from the content you submit in the Program.</p>

      <p>These Monetization Terms are incorporated into the NewsBreak Creator Program Terms of Service by reference and may be amended by us from time to time.</p>

      <p><strong>YOU SHALL TREAT MONETIZATION TERMS AND ANY ORAL OR WRITTEN
      COMMUNICATION DIRECTLY BETWEEN YOU AND US AS CONFIDENTIAL AND SHALL NOT
        DISCLOSE ANY AND ALL INFORMATION WITHOUT OUR PRIOR WRITTEN CONSENT.</strong></p>
      <p><strong>Definitions</strong>: For the purposes of these Monetization Terms:
            A calendar month is defined as the period of time from the first of the month
            until the last day of the month (“Calendar Month”). Your first month shall be
            defined as the time period from the first day of the month you join until the
            last day of that month. A page view (“Page View” or “PV”) is a view of a page
            that is measured and determined by NewsBreak at its sole discretion. For
            avoidance of doubt, a PV does not include portions of pages viewed in the
            newsfeed section of NewsBreak. A follower is a NewsBreak user who follows you
            on NewsBreak (“Followers”). A qualifying article is an article submitted to Us
            that meets NewsBreak’s requirements under the NewsBreak Creator Content
            Requirements and complies with the Terms (“Qualifying Article”). A qualifying
            video is a video submitted to Us that meets NewsBreak’s requirements under the
            NewsBreak's
            <a href="/creator-content-requirements" rel="noopener noreferrer" target="_blank"> Creator
            Content Requirements</a> and complies with the Terms
            (“Qualifying Video”).</p>

      <p>1. <u>Payment Details</u>. Based on satisfying the requirements of Monetization Terms and the Program, NewsBreak shall pay you fees based on the performance of Qualifying Articles and/or Qualifying Videos* you publish on NewsBreak.
            You will be able to check your revenue and performance with metrics for Qualifying Articles or Qualifying Videos in your Creator Portal. </p>

      <p>2. <u>PAYMENT TERMS</u>. Within fifteen (15) days after the end of each Calendar Month, NewsBreak shall remit payment to you for Qualifying Articles and/or Qualifying Video for the previous Calendar Month, such payment to be remitted in the manner and form agreed between NewsBreak and you. Any deferred, rejected, or otherwise unsuccessful payment to you will be submitted again the following payment cycle. Payments that are unclaimed for more than six (6) months will be returned to NewsBreak.</p>

      <p>3. <u>THIRD PARTY PAYMENT ACCOUNTS</u>. You must have and maintain an
            account with a third-party payment provider to receive payment from NewsBreak.
            For clarity, Tipalti (the third-party payment
            provider as of the Effective Date), or other third party
            payment provider to be selected on a future date, shall be solely responsible
            for providing all services in respect of payment and the duration of such
            account’s existence shall be independent of the Term of these Terms.</p>

      <p>4. <u>TAXES</u>. You will be responsible for all applicable taxes due on
            amounts payable to you under these Terms. In the event any governing body
            imposes any taxes on any fees arising hereunder and requires NewsBreak to
            withhold such tax, NewsBreak shall deduct such tax withholding from the
            applicable fees and shall have no further obligation to pay any such portion
            that is withheld.</p>

      <p>5. <u>EXPLOITATION</u>. While we appreciate each Creator’s contribution, we ultimately reserve the right to determine if the content submitted to Us meets our expectations at our sole discretion. You shall not engage in any fraudulent activity, including, but not limited to, simulating fake referrals, acts of plagiarism, or automated actions generation and non-human traffic, including bots, spyware, phishing, etc. In situations where we suspect dishonest means have been implemented by you, we reserve the right to withhold any payments and demand a refund of any previous payments to you, without prejudice to any other actions.</p>
      <span className='footnote'> * We will let video creators know in writing when video monetization is available.</span>

      {
        props.showCheckbox && <p className="last-item actionable" dir="ltr">
          <Checkbox onChange={props.onCheck} checked={props.checked} disabled={!!props.checkboxDisabled} />
          <span>By checking this box I confirm that I have read and agree to the terms and conditions above.</span>
        </p>
      }
    </div >
  )
}

