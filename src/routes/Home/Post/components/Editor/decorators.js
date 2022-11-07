import { CompositeDecorator } from 'draft-js'
import {
  ImageDecorator,
  SocialCardDecorator,
  FollowingCardDecorator,
  LinkDecorator,
  NewsletterCardDecorator
} from './components'

export default new CompositeDecorator([
  ImageDecorator,
  SocialCardDecorator,
  LinkDecorator,
  FollowingCardDecorator,
  NewsletterCardDecorator,
])
