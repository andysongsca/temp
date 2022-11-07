import React from 'react'
import { Link } from 'react-router-dom'
import { ModalContext } from 'components/Creator'
import './HomePost.scss'

export default function HomePost(props) {
  const { isCreator, enableVideo } = props
  const context = React.useContext(ModalContext)

  return <div className="home-post">
    <h2>Choose one to start</h2>
    <div className="new-post-links">
      <Link to="/home/post" className="post">
        <img alt="write an article" src={require("asset/svg/ic-original.svg")} />
        <div>Write an article</div>
      </Link>
      {enableVideo && <Link to="/home/vpost" className="vpost">
        <img alt="publish a video" src={require("asset/svg/ic-vpost.svg")} />
        <div>Publish a video</div>
        <p>Upload only a square or landscape video with the height of more than 240p</p>
      </Link>}
      {/* {!isCreator && <Link to="/home/share" className="share">
        <img alt="share an article" src={require("asset/img/ic_share_article.png")} />
        <div>Share an article</div>
      </Link>} */}
      {isCreator && <Link to={window.location.pathname} className="referral" onClick={context.openReaderReferralModal}>
        <img alt="refer us & earn" src={require("asset/svg/ic-refer-link.svg")} />
        <div>Refer us & earn</div>
      </Link>}
    </div>
  </div>
}
