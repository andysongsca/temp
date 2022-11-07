import React from 'react'
import { Checkbox } from 'antd'
import './Policy.scss'

export default (props) => {
  return (
    <div className="policy monetization">
      <p>To be eligible to earn compensation from the NewsBreak Creator Program (“NBCP”),
      you must agree to these monetization terms (“Monetization Terms”) to be able to 
      receive such compensation.</p>

      <p>These Monetization Terms are incorporated into NewsBreak Creator Program Terms of 
      Service (“NBCP Terms”) by reference and may be amended by us from time to time.</p>

      <p><strong>YOU SHALL TREAT THESE MONETIZATION TERMS AND ANY ORAL OR 
      WRITTEN COMMUNICATION DIRECTLY BETWEEN YOU AND US AS 
      CONFIDENTIAL AND SHALL NOT DISCLOSE ANY AND ALL INFORMATION 
      WITHOUT OUR PRIOR WRITTEN CONSENT.</strong></p>

      <p><strong>Definitions</strong>: Except for terms defined in the Monetization Terms, all defined terms of 
      the Monetization Policy shall have the same meaning as set forth in the Monetization
      Terms.</p>
      <ul>
        <li>A “Calendar Month” is defined as the period of time from the first of the month 
        until the last day of the month. Your first month shall be defined as the time 
        period from the first day of the month you join until the last day of that month. </li>
        <li>A “Page View” (or “PV”) is a view of a page that is measured and determined by 
        NewsBreak at its sole discretion. Notwithstanding anything in the NBCP Terms to 
        the contrary, a PV does not include portions of pages viewed in the news feed 
        section of NewsBreak. </li>
        <li>A “Follower” is a NewsBreak user who follows you on NewsBreak.</li>
        <li>“Qualifying Articles/Videos” are defined as articles and videos that meet the 
        <a href="/creator-content-requirements" rel="noopener noreferrer" target="_blank"> NewsBreak Creator Content Requirements</a> and comply with our <a href="/creator-content-policy" rel="noopener noreferrer" target="_blank">NewsBreak
        Creator Content Policy</a>.</li>
      </ul>

      <p>1. <u>SCORE DETERMINATION</u>. Qualifying Articles and Qualifying Videos will be 
      assigned a content value score, which indicates the value of your content to 
      NewsBreak’s users (“Content Value Score”). The higher the user value and 
      monetization value a Qualifying Article or Video has, the higher we place your Content 
      Value Score.</p>
      <p>Content Value Scores range between 1 and 10, with 10 being the highest score.</p>

      <p>2. <u>COMPENSATION</u>.  We offer compensation in the form of an ad revenue share for 
      each Page View you received for that Calendar Month (the “Ad Revenue Share”). 
      Articles with a higher Content Value Score receive a higher rate per thousand Page
      Views. NewsBreak will pay you a minimum of $4.00 per thousand Page Views. This 
      section applies to Qualifying Articles only.  </p>

      <p>3. <u>TAXES</u>. You will be responsible for all applicable taxes due on amounts payable to 
      you under these Terms.  In the event any governing body imposes any taxes on any 
      fees arising hereunder and requires NewsBreak to withhold such tax, NewsBreak shall 
      deduct such tax withholding from the applicable fees and shall have no further 
      obligation to pay any such portion that is withheld.</p>
      
      <p>4. <u>PAYMENT TERMS</u>. Within fifteen (15) days after the end of each Calendar Month, 
      NewsBreak shall remit payment to you for each of the payments outlined in the 
      Monetization Terms for the previous Calendar Month, such payment to be remitted in 
      the manner and form agreed between NewsBreak and you. Any deferred, rejected, or 
      otherwise unsuccessful payment to you will be submitted again the following payment 
      cycle. Payments that are unclaimed for more than six (6) months will be returned to 
      NewsBreak.</p>

      <p>5. <u>THIRD PARTY PAYMENT ACCOUNTS</u>. You must have and maintain an account with 
      a third-party payment provider to receive payment from NewsBreak. For clarity, Tipalti 
      (the third-party payment provider as of the Effective Date), or other third party payment 
      provider to be selected on a future date, shall be solely responsible for providing all 
      services in respect of payment and the duration of such account’s existence shall be 
      independent of the Term of these Terms.</p>

      <p>6. EXPLOITATION.  While we appreciate each Creator’s contribution, we ultimately 
      reserve the right to determine if the content submitted to NewsBreak meets our 
      expectations at our sole discretion. You shall not engage in any fraudulent activity, 
      including, but not limited to, simulating fake referrals, acts of plagiarism, or automated 
      actions generation and non-human traffic, including bots, spyware, phishing, etc.  In 
      situations where we suspect dishonest means have been implemented by you, we 
      reserve the right to withhold any payments outlined in the Monetization Terms and 
      demand a refund of any previous payments to you, without prejudice to any other 
      actions.</p>

      {
        props.showCheckbox && <p className="last-item actionable" dir="ltr">
          <Checkbox onChange={props.onCheck} checked={props.checked} disabled={!!props.checkboxDisabled} />
          <span>By checking this box I confirm that I have read and agree to the terms and conditions above.</span>
        </p>
      }
    </div>
  )
}

