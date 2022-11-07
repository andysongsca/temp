import React, { useState, useEffect, useRef } from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Comment, Avatar, Form, Input, Button, Popconfirm, Switch, Radio } from 'antd'
import cx from 'classnames'

import { time2durationSimple } from 'utils/utilities'
import api from 'utils/api'
import withAuth from 'hocs/withAuth'
import withQuery from 'hocs/withQuery'
import logEvent from 'utils/logEvent'
import { Loading, Tooltip } from 'components/utils'
import { likeComment, deleteComment, addComment, addReply, getCommentSession, updateLastReadComment } from 'redux/post'
import { ReactComponent as IconArrow } from 'asset/svg/arrow-down.svg'
import { ReactComponent as IconReply } from 'asset/svg/reply.svg'
import { ReactComponent as IconDelete } from 'asset/svg/delete.svg'
import { ReactComponent as IconAuthor } from 'asset/svg/author-label.svg'
import { ReactComponent as IconBack } from 'asset/svg/navigation-back.svg'
import { ReactComponent as NoComments } from 'asset/svg/no-comments.svg'
import { ReactComponent as IconInfo } from 'asset/svg/icon-info.svg'
import LoadMoreButton from "./LoadMoreButton";
import './Comments.scss'

const { TextArea } = Input

const Editor = ({ onChange, onSubmit, value, placeholder }) => {
  const disabled = !value.trim();
  return (
    <div className="editor">
      <Form.Item>
        <TextArea className="add-comment-input" onChange={onChange} value={value} placeholder={placeholder} />
        <Button disabled={disabled} className={disabled ? 'comment-button-disabled' : 'comment-button'} htmlType="submit" onClick={onSubmit} type="primary">
          Comment
        </Button>
      </Form.Item>
    </div>
  )
  }
const CommentItem = (props) => {
  const { data: { comment, comment_id, createAt, deleted, profile, replies, reply_id, user_id, nickname, reply_n, author_liked },
    likeComment, deleteComment, onFinishReply, onFinishLike, onFinishDelete,
    queryReplies, updateReplies, comment_index, reply_index, replyToAuthor, self } = props
  const is_author_comment = self && user_id === self.user_id
  const is_author_reply = self && self.nickname === nickname
  const [isLiked, setIsLiked] = useState(author_liked)
  const [expanded, setExpanded] = useState(false)
  const [hasComment, setHasComment] = useState(false)
  const [commentValue, setCommentValue] = useState("")
  const [popVisible, setPopVisible] = useState(false)
  const createAtStr = time2durationSimple(createAt)
  const create_at_str_display = createAtStr === 'now' ? 'now' : createAtStr.includes('-') ? createAtStr : (createAtStr + ' ago')

  if (deleted) {
    return null
  }

  const onLike = () => {
    setIsLiked(!isLiked)
    comment_id !== undefined ? onFinishLike(comment_id) : onFinishLike(reply_id)
  }

  const handleDeleteOk = () => {
    const isDeleteComment = comment_id !== undefined ? true : false
    if (isDeleteComment) {
      onFinishDelete(comment_id, true, comment_index, 0)
    } else {
      onFinishDelete(reply_id, false, comment_index, reply_index)
    }
    setPopVisible(false)
  }

  const handleSubmit = () => {
    onFinishReply(reply_id || comment_id, commentValue, comment_index)
    setHasComment(false);
    setCommentValue('')
  }

  const findReplyToAuthor = (reply_to_id, rpls) => {
    const authorToReply = rpls.find(r => r.reply_id === reply_to_id)
    return authorToReply ? authorToReply.nickname : null
  }

  const actions = [
    <Tooltip key="comment-basic-like" title="Like" autoWidth={true}>
      <span onClick={onLike}>
        <img alt="like"
          src={require('asset/svg/like.svg')} className={isLiked ? 'liked' : ''}
        />
      </span>
    </Tooltip>,
    <Tooltip key="comment-basic-reply" title="Reply" autoWidth={true}>
      <span onClick={() => setHasComment(!hasComment)}>
        <IconReply />
      </span>
    </Tooltip>,
    <Tooltip key="comment-basic-delete" title="Delete" autoWidth={true}>
      <span onClick={() => setPopVisible(true)}>
        <IconDelete />
      </span>
    </Tooltip>,
  ]

  const noReplies = !replies || replies.length === 0

  return <Comment
    actions={actions}
    author={(is_author_comment || is_author_reply) ? <span className="author">{self.account}</span> : <span>{nickname}</span>}
    avatar={<Avatar src={is_author_comment ? self.icon : (profile ||
      require('asset/img/default_avator.png'))} alt={nickname} />}
    content={replyToAuthor ? "@" + replyToAuthor + " " + comment : comment}
    datetime={<span>{create_at_str_display}{(is_author_comment || is_author_reply) ?
      <IconAuthor className="author-label" /> : null}</span>}
  >
    <Popconfirm
      title="Want to delete this comment?"
      visible={popVisible}
      placement="right"
      arrowPointAtCenter
      okText="Delete"
      cancelText="Cancel"
      onConfirm={handleDeleteOk}
      onCancel={() => setPopVisible(false)}
    />
    {hasComment ?
      <Comment
        author={<span className="author">{self.account} (You)</span>}
        avatar={
          <Avatar
            src={self.icon ||
              require('asset/img/default_avator.png')}
            alt={self.account}
          />
        }
        content={
          <Editor
            onSubmit={handleSubmit}
            onChange={e => setCommentValue(e.target.value)}
            value={commentValue}
            placeholder=""
          />
        }
      /> : null
    }
    {noReplies && null}
    {!noReplies && (expanded ?
      <>
        {replies.map((reply, index) => <CommentItem
          key={reply.reply_id}
          data={reply}
          replyToAuthor={findReplyToAuthor(reply.reply_to, replies)}
          likeComment={likeComment}
          deleteComment={deleteComment}
          onFinishReply={onFinishReply}
          onFinishLike={onFinishLike}
          onFinishDelete={onFinishDelete}
          self={self}
          user={user_id}
          comment_index={comment_index}
          reply_index={index}
        />)}
        <div
          className="replies-toggle collapse"
          onClick={() => {
            setExpanded(false)
            queryReplies(comment_id, comment_index, reply_n)
          }}
        >
          <IconArrow /> Collapse all replies
        </div>
      </> :
      <>
        <CommentItem
          data={replies[0]}
          likeComment={likeComment}
          deleteComment={deleteComment}
          updateReplies={updateReplies}
          onFinishReply={onFinishReply}
          onFinishLike={onFinishLike}
          onFinishDelete={onFinishDelete}
          comment_index={comment_index}
          reply_index={0}
          self={self}
        />
        {replies.length > 1 && <div
          className="replies-toggle"
          onClick={() => {
            setExpanded(true)
            queryReplies(comment_id, comment_index, reply_n)
          }}
        >
          <IconArrow /> Expand all replies
        </div>}
      </>
    )}
  </Comment>
}

const Comments = (props) => {
  const { comments, self, goto, match: { params: { id, title } } } = props
  const article_title = decodeURIComponent(title).replace(/~~pct~~/g, '%')
  const sessionId = self && self.website_sessionId
  const [currentCommentsFetched, setCurrentCommentsFetched] = useState(null)
  const [commentConfig, setCommentConfig] = useState('on')
  const [count, setCount] = useState(comments ? comments.length : 0)
  const [newComment, setNewComment] = useState('')
  const [noMoreComments, setNoMoreComments] = useState(false)
  const latestCommentRef = useRef(null)
  const commentDisabled = commentConfig === 'off'

  useEffect(() => {
    logEvent('page_visit_start', { page: 'comments' })

    api.get('/media/get_comment_configuration', { doc_id: id }).then((res) => {
      if (res && res.data) {
        setCommentConfig(res.data)
      }
    }).catch(() => {
      logEvent('error during fetching comment configuration', { doc_id: id })
    })

    api.get(`/post/comments/get-comments`, {
      id: id,
      sessionId: sessionId,
      count: 10,
      lastCommentId: ''
    }).then((res) => {
      if (res.data.comments && res.data.comments.length < 9) {
        setNoMoreComments(true);
      }
      setCurrentCommentsFetched(res.data.comments)
      setCount(res.data.comments.length)
      latestCommentRef.current = res.data.comments
    }).catch(() => {
      logEvent('error during fetching comments', { page: 'comments' })
      setCurrentCommentsFetched([])
    })

    return () => {
      if (latestCommentRef.current && latestCommentRef.current.length > 0) {
        // add last read comment to db
        const latest_comment_id = latestCommentRef.current[0].comment_id;
        props.updateLastReadComment({ doc_id: id, comment_id: latest_comment_id })
      }
      logEvent('page_visit_end', { page: 'comments' })
    }
  }, [])

  const queryReplies = (comment_id, comment_index, ct) => {
    const params = {
      commentId: comment_id,
      count: ct,
      lastReplyId: '',
      sessionId: sessionId
    }
    api.get(`/post/comments/get-replies`, params).then(
      res => {
        if (res.data && res.data.comment) {
          let commentUpdate = currentCommentsFetched[comment_index]
          const currentReplies = commentUpdate.replies
          const newReplies = res.data.comment.replies.filter((o) => !currentReplies.map((r) => r.reply_id).includes(o.reply_id))
          const newCommentReplies = currentReplies.concat(newReplies)
          commentUpdate.replies = newCommentReplies
          updateReplies(commentUpdate, comment_index, newCommentReplies.length)
        }
      }
    ).catch(() => {
      logEvent('error during fetching replies', { page: "comments" })
    })
  }

  const updateReplies = (reply, index, ct) => {
    let newComments = currentCommentsFetched
    newComments[index] = reply
    setCurrentCommentsFetched(newComments)
    setCount(count + ct)
  }

  const onFinish = () => {

    props.addComment({
      doc_id: id,
      comment: encodeURI(newComment),
      sessionid: sessionId
    }).then(res => {
      if (res.value && res.value.data.code === 0) {
        const { comment, comment_id, createAt, nickname, profile } = res.value.data.comment
        const commentToAdd = {
          comment, comment_id, createAt, nickname, profile,
          like: 0,
          dislike: 0,
        }
        setCurrentCommentsFetched([commentToAdd].concat(currentCommentsFetched))
        latestCommentRef.current = [commentToAdd].concat(currentCommentsFetched)
      }
      setCount(count + 1)
    })
    setNewComment("")
  }

  const onFinishReply = (reply_to_id, comment, index) => {
    props.addReply(
      {
        doc_id: id,
        reply: encodeURI(comment),
        reply_to_id: reply_to_id,
        sessionid: sessionId
      }).then(res => {
        if (res.value && res.value.data.code === 0) {
          const { comment, createAt, nickname, profile } = res.value.data.comment
          let reply = currentCommentsFetched[index]
          let replyToAdd = {
            comment, createAt, nickname, profile,
            like: 0,
            dislike: 0,
            reply_id: res.value.data.comment.reply_id,
            reply_to: res.value.data.comment.reply
          }
          if (reply) {
            if (reply.replies) {
              reply.replies = [replyToAdd].concat(reply.replies)
            } else {
              reply.replies = [replyToAdd]
            }
            updateReplies(reply, index, 1)
          }
        }
      })
  }

  const onFinishLike = (comment_id) => {
    props.likeComment({ id: comment_id, sessionid: sessionId, doc_id: id })
  }

  const onFinishDelete = (comment_id, is_comment, comment_index, reply_index) => {
    props.deleteComment({ id: comment_id, sessionid: sessionId, docid: id, isComment: is_comment }).then(res => {
      if (res.value && res.value.data.code === 0) {
        if (is_comment) {
          currentCommentsFetched.splice(comment_index, 1);
          setCurrentCommentsFetched(currentCommentsFetched)
        }
        else {
          let comment = currentCommentsFetched[comment_index]
          if ("replies" in comment) {
            let commentReplies = comment['replies']
            commentReplies.splice(reply_index, 1)
            comment.replies = commentReplies
            currentCommentsFetched[comment_index] = comment
            setCurrentCommentsFetched(currentCommentsFetched)
          }
        }
        setCount(count - 1)
      }
    })
  }

  const onLoadMoreComments = async () => {
    const last_comment_id = currentCommentsFetched.length > 0 ? currentCommentsFetched[currentCommentsFetched.length - 1].comment_id : ""
    let params = {
      id: id,
      sessionId: sessionId,
      count: 10,
      lastCommentId: last_comment_id
    }
    const { data } = await api.get(`/post/comments/get-comments`, params)
    // need to remove the first comment return
    if (data.comments && data.comments.length > 0) {
      if (data.comments.length < 9) {
        setNoMoreComments(true);
      }
      let newComments = data.comments
      newComments.splice(0, 1)
      setCurrentCommentsFetched(currentCommentsFetched.concat(newComments))
    }
  }

  const updateCommentConfig = (conf) => {
    setCommentConfig(conf)
    const params = { doc_id: id, comment_configuration: conf }
    api.post('/media/update_comment_configuration', { params }).catch(() => {
      logEvent('error during updating comment configuration', params)
    })
  }

  return (
    <div className="home-comments">
      <div className="section comments-header">
        <IconBack className="navigation-back" onClick={() => goto(`/home/content/post`)} />
        <span className="title">{article_title}</span>
      </div>

      <div className="section comments-control">
        <div className="comments-switch">
          <span>Allow commenting</span>
          <Tooltip
            title={<span>
              <p>This allows you to restrict commenting to only your followers or turn it off altogether.</p>
              <p>Keep in mind that this feature is only available on more recent mobile updates, so some users might still
                be able to comment if they haven't updated the app.</p>
            </span>}
            placement="bottom">
            <IconInfo />
          </Tooltip>
          <Switch
            checked={!commentDisabled}
            onChange={(checked) => updateCommentConfig(checked ? 'on' : 'off')}
          />
        </div>
        <div className={cx('comments-radio', commentDisabled && 'disabled')}>
          <span>Allow comments from</span>
          <Radio.Group
            onChange={(e) => updateCommentConfig(e.target.value)}
            value={commentConfig}
            disabled={commentDisabled}
          >
            <Radio value="on">Everyone</Radio>
            <Radio value="followers only">Followers only</Radio>
          </Radio.Group>
        </div>
      </div>

      {commentDisabled && <div className="section comments-list">
        <div>
          <div className="no-comment-icon"><NoComments /></div>
          <div className="no-comment">You have disabled commenting. To allow commenting, toggle the "Allow commenting" button above.</div>
        </div>
      </div>}

      {!commentDisabled && <>
        <div className="add-comment">
          <Comment
            className="main-add-comment"
            avatar={
              <Avatar
                src={self ? self.icon : require('asset/img/default_avator.png')}
              />
            }
            content={
              <Editor
                onSubmit={onFinish}
                onChange={e => setNewComment(e.target.value)}
                value={newComment}
                placeholder="Add comment as author..."
              />
            }
          />
        </div>

        <div className="section comments-list">
          {!currentCommentsFetched && <Loading />}
          {currentCommentsFetched && currentCommentsFetched.length > 0 && currentCommentsFetched.map((item, index) => {
            return <CommentItem
              comment_index={index}
              data={item}
              key={item.comment_id}
              likeComment={likeComment}
              deleteComment={deleteComment}
              onFinishReply={onFinishReply}
              onFinishLike={onFinishLike}
              onFinishDelete={onFinishDelete}
              queryReplies={queryReplies}
              self={self}
            />

          })}
          {currentCommentsFetched && currentCommentsFetched.length === 0 &&
            <div>
              <div className="no-comment-icon"><NoComments /></div>
              <div className="no-comment">You don’t have any comments yet. Be the first one to leave a comment and let the rest follow.</div>
            </div>
          }
        </div>
        {!noMoreComments && currentCommentsFetched && currentCommentsFetched.length > 0 && <LoadMoreButton onClick={onLoadMoreComments} />}
      </>}
    </div>
  )
}

export default compose(
  withAuth,
  withQuery,
  connect(
    ({ post }) => post,
    { likeComment, deleteComment, addComment, addReply, getCommentSession, updateLastReadComment },
  )
)(Comments)