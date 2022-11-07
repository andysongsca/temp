import React, { useEffect } from 'react'
import { connect, useDispatch } from 'react-redux'
import InfiniteScroll from 'react-infinite-scroller'

import { fetchPublishedMessages, getMessagesCount } from 'redux/circle'
import MessageItem from './MessageItem'
import Loading from 'components/utils/Loading'

const PublishedMessage = ({
  publishedMessage
}) => {
  const dispatch = useDispatch();

  useEffect (() => {
    if (publishedMessage && publishedMessage.fetched !== undefined) {
      return;
    }
    dispatch(getMessagesCount())
  }, [])

  const { fetched, offset, count } = publishedMessage

  return ( 
    <div className="circle-container circle-content">
      <div className="published-message-header">
        <h2>All Messages</h2>
      </div>
      { fetched ? (count !== 0 ?
        <div className="circle-info">
          <InfiniteScroll
                loadMore={() => dispatch(fetchPublishedMessages())}
                hasMore={offset < count}
                threshold={100}
                initialLoad={true}
                useWindow={true}
                loader={<Loading />}
              >
          {publishedMessage.data.map(p => <MessageItem {...p} key={p.message_id} />)}
          </InfiniteScroll>
        </div> : <div /> )
      :
      <Loading /> }
    </div>
  )
}
export default connect(
  ({ circle: { publishedMessage } }) => ({ publishedMessage }),
  { fetchPublishedMessages, getMessagesCount },
)(PublishedMessage)