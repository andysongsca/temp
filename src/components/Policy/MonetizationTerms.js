import React from 'react'
import { Checkbox } from 'antd'
import './Policy.scss'

export default (props) => {
  return (
    <div className="policy monetization">
      <p>Once accepted into the NewsBreak Creator Program (the “Program”), you must
      agree to the NewsBreak monetization terms (“Monetization Terms”) to earn money
        from the content you submit in the Program.</p>

      <p>These Monetization Terms are incorporated into the NewsBreak Creator
      Program Terms of Service by reference and may be amended by us from time to time.</p>

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

      <p>1. <u>Content Value Score</u>. Qualifying Articles and Qualifying Videos
            will be assigned a content value score, which indicates the value of your
            content to NewsBreak’s users (“Content Value Score”). The higher the user
            value and monetization value a Qualifying Article or Video has, the higher we
            place your Content Value Score.</p>

      <p>Content Value Scores range between 1 and 10, with 10 being the highest score.</p>

      <p>2. <u>Payment Details</u>. Based on satisfying the requirements of this
            Agreement and the Program, NewsBreak shall pay you cumulatively each of the
            payments outlined in sub-sections 2.1, 2.2, 2.3, and 2.4 separately according
            to the terms of each respective sub-section:</p>

      <p>2.1. <u>Sign-on Base Pay</u>.</p>

      <p>For article writers, after being accepted into the Program, within the first
      three Calendar Months (as defined below), we offer a sign-on base pay for each
      Qualifying Article you post according to the following schedule:</p>

      <table border={1} cellSpacing={0} cellPadding={5} style={{ borderCollapse: 'collapse', border: 'none' }}>
        <colgroup>
          <col style={{ width: 340 }} />
          <col style={{ width: 340 }} />
        </colgroup>
        <tbody>
          <tr>
            <td>Content Value Score</td>
            <td>Payment</td>
          </tr>
          <tr>
            <td>1-4</td>
            <td>$25 per qualifying article</td>
          </tr>
          <tr>
            <td>5-10</td>
            <td>$60 per qualifying article</td>
          </tr>
        </tbody>
      </table>
      <p />
      <p>Your monthly sign-on base pay shall not exceed $1,500 for articles.</p>

      <p>For video creators, after being accepted into the Program, we offer $100 sign-on base pay for each Qualifying Video
      you post within the first three Calendar Months.The monthly sign - on base pay shall not exceed $2, 000 for videos.</p>

      <p>2.2 <u>Ad Revenue Share</u>. We offer Ad Revenue Share for each Page View you
            received for that Calendar Month according to the following schedule:</p>

      <table border={1} cellSpacing={0} cellPadding={5} style={{ borderCollapse: 'collapse', border: 'none' }}>
        <colgroup>
          <col style={{ width: 340 }} />
          <col style={{ width: 340 }} />
        </colgroup>
        <tbody>
          <tr>
            <td>Content Value Score per Qualifying Article</td>
            <td>Payment</td>
          </tr>
          <tr>
            <td>1+</td>
            <td>Minimum $4 per thousand Page Views</td>
          </tr>
          <tr>
            <td>5+</td>
            <td>Minimum $10 per thousand Page Views</td>
          </tr>
        </tbody>
      </table>
      <p />
      <p>This section applies to Qualifying Articles only. Articles with a higher score receive a
            higher rate per thousand Page Views.</p>

      <p>2.3. <u>User Referral Bonus</u>. NewsBreak will pay you $1 per new user
            that downloads the NewsBreak app using your referral link.</p>

      <p>2.4. <u>Creator Referral Bonus</u>. NewsBreak will pay you a creator referral
            bonus for each referred creator according to the following schedule:</p>

      <ol>
        <li>When you refer a new article creator:
          <ul>
            <li>A one-time $50 for each referred creator if the referee is approved to become a
            Creator and publishes at least one Qualifying Article on NewsBreak;</li>
            <li>An additional $200 if the referee publishes over 50 Qualifying Articles on NewsBreak.</li>
          </ul>
        </li>

        <li>When you refer a new video creator:
          <ul>
            <li>A one-time $50 for each referred creator if the referee is approved to become a
            Creator and publishes at least one video on News Beal;</li>
            <li>An additional $200 if the referee publishes over 30 Qualifying videos on NewsBreak.</li>
          </ul>
        </li>
      </ol>

      <p>3. <u>PAYMENT TERMS</u>. Within fifteen (15) days after the end of each
            Calendar Month, NewsBreak shall remit payment to you for each of the payments
            outlined in sub-sections 2.1, 2.2, 2.3, and 2.4 according to the terms of each
            respective sub-section for the previous Calendar Month, such payment to be
            remitted in the manner and form agreed between NewsBreak and you. Any
            deferred, rejected, or otherwise unsuccessful payment to you will be submitted
            again the following payment cycle. Payments that are unclaimed for more than 6
            months will be returned to NewsBreak.</p>

      <p>4. <u>THIRD PARTY PAYMENT ACCOUNTS</u>. You must have and maintain an
            account with a third-party payment provider to receive payment from NewsBreak.
            For clarity, Tipalti (the third-party payment
            provider as of the Effective Date), or other third party
            payment provider to be selected on a future date, shall be solely responsible
            for providing all services in respect of payment and the duration of such
            account’s existence shall be independent of the Term of these Terms.</p>

      <p>5. <u>TAXES</u>. You will be responsible for all applicable taxes due on
            amounts payable to you under these Terms. In the event any governing body
            imposes any taxes on any fees arising hereunder and requires NewsBreak to
            withhold such tax, NewsBreak shall deduct such tax withholding from the
            applicable fees and shall have no further obligation to pay any such portion
            that is withheld.</p>

      <p>6. <u>EXPLOITATION</u>. While we appreciate each Creator’s contribution, we
            ultimately reserve the right to determine if the content submitted to Us meets
            our expectations at our sole discretion. You shall not engage in any fraudulent
            activity, including, but not limited to, simulating fake referrals, acts of
            plagiarism, or automated actions generation and non-human traffic, including
            bots, spyware, phishing, etc. In situations where we suspect dishonest means
            have been implemented by you, we reserve the right to withhold any payments
            outlined in sub-sections 2.1-2.4, demand a refund of any previous payments to
            you, without prejudice to any other actions.</p>

      {
        props.showCheckbox && <p className="last-item actionable" dir="ltr">
          <Checkbox onChange={props.onCheck} checked={props.checked} disabled={!!props.checkboxDisabled} />
          <span>By checking this box I confirm that I have read and agree to the terms and conditions above.</span>
        </p>
      }
    </div >
  )
}

