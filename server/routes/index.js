import { Router } from 'express'
const router = Router()
import { urlencoded } from 'body-parser'
import getParam from 'express-get-param'

const { getController } = Utility

router.use(urlencoded({ extended: false }))

router.use('/templates',
  ((templateRouter = Router()) => {
    templateRouter.get(
      '/',
      getParam('p', { parser: 'integer' }),
      getController('templates').list
    )
    templateRouter.get(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getController('templates').retrieve
    )
    templateRouter.put(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getParam('name', { parser: 'string' }),
      getParam('description', { parser: 'string' }),
      getParam('subject', { parser: 'string' }),
      getParam('html', { parser: 'string' }),
      getParam('fields', { parser: 'string' }),
      getController('templates').update
    )
    templateRouter.post(
      '/',
      getParam('name', { parser: 'string' }),
      getParam('description', { parser: 'string' }),
      getParam('subject', { parser: 'string' }),
      getParam('html', { parser: 'string' }),
      getParam('fields', { parser: 'string' }),
      getController('templates').create
    )
    templateRouter.delete(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getController('templates').destroy
    )
    return templateRouter
  })()
)

router.use('/emails',
  ((emailRouter = Router()) => {
    emailRouter.get(
      '/',
      getParam('p', { parser: 'integer' }),
      getController('emails').list
    )
    emailRouter.get(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getController('emails').retrieve
    )
    emailRouter.get(
      '/:id/messages',
      getParam('id', { parser: 'integer' }),
      getParam('p', { parser: 'integer' }),
      getController('emails').messages
    )
    emailRouter.put(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getParam('subject', { parser: 'string' }),
      getParam('html', { parser: 'string' }),
      getParam('to_user_uids', { parser: 'string' }),
      getParam('cc_user_uids', { parser: 'string' }),
      getParam('bcc_user_uids', { parser: 'string' }),
      getParam('scheduled_at', { parser: 'string' }),
      getParam('from_email_id', { parser: 'integer' }),
      getParam('subscription_list_id', { parser: 'integer' }),
      getController('emails').update
    )
    emailRouter.post(
      '/',
      getParam('subject', { parser: 'string' }),
      getParam('html', { parser: 'string' }),
      getParam('to_user_uids', { parser: 'string' }),
      getParam('cc_user_uids', { parser: 'string' }),
      getParam('bcc_user_uids', { parser: 'string' }),
      getParam('scheduled_at', { parser: 'string' }),
      getParam('from_email_id', { parser: 'integer' }),
      getParam('subscription_list_id', { parser: 'integer' }),
      getController('emails').create
    )
    emailRouter.delete(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getController('emails').destroy
    )
    return emailRouter
  })()
)

router.use('/from_emails',
  ((emailIdRouter = Router()) => {
    emailIdRouter.get(
      '/',
      getParam('p', { parser: 'integer' }),
      getController('fromEmails').list
    )
    emailIdRouter.post(
      '/',
      getParam('sender', { parser: 'string' }),
      getParam('email', { parser: 'string' }),
      getController('fromEmails').create
    )
    emailIdRouter.put(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getParam('sender', { parser: 'string' }),
      getParam('email', { parser: 'string' }),
      getController('fromEmails').create
    )
    emailIdRouter.delete(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getController('fromEmails').destroy
    )
    return emailIdRouter
  })()
)

router.use('/subscription_lists',
  ((subscriptionListRouter = Router()) => {
    subscriptionListRouter.get(
      '/',
      getParam('p', { parser: 'integer' }),
      getController('subscriptionLists').list
    )
    subscriptionListRouter.get(
      '/:id/subscriptions',
      getParam('id', { parser: 'integer' }),
      getParam('p', { parser: 'integer' }),
      getController('subscriptionLists').subscriptions
    )
    subscriptionListRouter.get(
      '/:id/unsubscribe/:unsubscribeKey',
      getParam('id', { parser: 'integer' }),
      getParam('unsubscribeKey', { parser: 'string' }),
      getController('subscriptionLists').unsubscribe
    )
    subscriptionListRouter.put(
      '/:id/subscriptions',
      getParam('id', { parser: 'integer' }),
      getParam('user_uids', { parser: 'array' }),
      getController('subscriptionLists').updateSubscriptions
    )
    subscriptionListRouter.post(
      '/:id/subscriptions',
      getParam('id', { parser: 'integer' }),
      getParam('user_uid', { parser: 'string' }),
      getController('subscriptionLists').addSubscription
    )
    subscriptionListRouter.delete(
      '/:id/subscriptions',
      getParam('id', { parser: 'integer' }),
      getParam('user_uid', { parser: 'string' }),
      getController('subscriptionLists').removeSubscription
    )
    subscriptionListRouter.put(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getParam('name', { parser: 'string' }),
      getParam('description', { parser: 'string' }),
      getController('subscriptionLists').update
    )
    subscriptionListRouter.post(
      '/',
      getParam('name', { parser: 'string' }),
      getParam('description', { parser: 'string' }),
      getController('subscriptionLists').create
    )
    subscriptionListRouter.delete(
      '/:id',
      getParam('id', { parser: 'integer' }),
      getController('subscriptionLists').destroy
    )
    return subscriptionListRouter
  })()
)

router.use('/users',
  ((userRouter = Router()) => {
    userRouter.get(
      '/',
      getParam('p', { parser: 'integer' }),
      getController('users').list
    )
    userRouter.get(
      '/:uid/subscriptions',
      getParam('uid', { parser: 'string' }),
      getParam('p', { parser: 'string' }),
      getController('users').subscriptions
    )
    return userRouter
  })()
)

export default router
