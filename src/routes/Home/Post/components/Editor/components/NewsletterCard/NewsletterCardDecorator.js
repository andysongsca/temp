import { createDecorator } from '../../utils/decorator'
import { TYPE_NEWSLETTER_CARD } from '@/constant/content'
import NewsletterCardDecoratorView from './NewsletterCardDecoratorView'

export const NewsletterCardDecorator = createDecorator(TYPE_NEWSLETTER_CARD, NewsletterCardDecoratorView)
