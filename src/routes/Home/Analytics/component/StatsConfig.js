import React from 'react'

import { ReactComponent as IconImp } from 'asset/svg/impressions.svg'
import { ReactComponent as IconPV } from 'asset/svg/pg.svg'
import { ReactComponent as IconShare } from 'asset/svg/share.svg'
import { ReactComponent as IconUV } from 'asset/svg/uv.svg'
import { ReactComponent as IconLike } from 'asset/svg/like.svg'
import { ReactComponent as IconComment } from 'asset/svg/comment.svg'
import { MEDIA_TYPE_NEWSLETTER } from '@/constant/content'

export const totals = [{
  icon: <IconImp />,
  title: "Impressions",
  key: "impression",
}, {
  icon: <IconPV />,
  title: "Views",
  key: "page_view",
}, {
  icon: <IconShare />,
  title: "Shares",
  key: "share",
}, {
  icon: <IconUV />,
  title: "Unique Visitors",
  key: "unique_visitor",
}, {
  icon: <IconLike />,
  title: "Likes",
  key: "thumb_up",
}, {
  icon: <IconComment />,
  title: "Comments",
  key: "comment",
}]

export const createTotals = (mediaType) => {
  return [{
    icon: <IconImp />,
    title: mediaType === MEDIA_TYPE_NEWSLETTER ? "Sent" : "Impressions",
    key: "impression",
  }, {
    icon: <IconPV />,
    title: mediaType === MEDIA_TYPE_NEWSLETTER ? "Opened" : "Views",
    key: "page_view",
  }, {
    icon: <IconShare />,
    title: "Shares",
    key: "share",
  }, {
    icon: <IconUV />,
    title: "Unique Visitors",
    key: "unique_visitor",
  }, {
    icon: <IconLike />,
    title: "Likes",
    key: "thumb_up",
  }, {
    icon: <IconComment />,
    title: "Comments",
    key: "comment",
  }]
}