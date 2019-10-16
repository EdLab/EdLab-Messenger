const { Op } = require('sequelize')

const SUBSCRIPTION_FIELDS = ['user_uid', 'subscription_list_id']
const SUBSCRIPTION_LIST_FIELDS = ['id', 'name', 'description']

/**
 * @api {GET} /subscription_lists Get list of Subscription lists
 * @apiName getSubscriptionLists
 * @apiGroup SubscriptionLists
 *
 * @apiParam {Number} [p=1] Page number
 *
 * @apiSuccess {Object} Response SubscriptionList object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "count": 10,
 *      "results": [
 *        {
 *          id: 1,
 *          name: "EdLab Dev Team",
 *          description: "This list contains users who work in the EdLab dev team"
 *        },
 *      ]
 *    }
 */
export function list(_req, res, next) {
  const { p = 1 } = res.locals
  SubscriptionList
    .findAndCountAll({
      limit: AppConfig.PAGINATION_LIMIT,
      offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
      attributes: SUBSCRIPTION_LIST_FIELDS,
    })
    .then(result => {
      res.json({
        count: result.count,
        results: result.rows,
        p: p,
      })
    })
    .catch(e => next(e))
}

/**
 * @api {GET} /subscription_lists/:id/subscriptions Get list of Subscriptions of a subscription list
 * @apiName getSubscriptionListSubscriptions
 * @apiGroup SubscriptionLists
 *
 * @apiParam {Number} id Subscription List ID
 * @apiParam {Number} [p=1] Page number
 *
 * @apiSuccess {Object} Response Subscription object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "count": 10,
 *      "results": [
 *        {
 *          user_uid: "b0ae9ed7-05a2-11e6-a4d1-22000b04a6df",
 *          subscription_list_id: 1
 *        },
 *      ]
 *    }
 */
export function subscriptions(_req, res, next) {
  const { id = null, p = 1 } = res.locals
  SubscriptionList
    .findByPk(id)
    .then(subscriptionList => {
      return Subscription
        .findAndCountAll({
          where: { subscription_list_id: subscriptionList.id },
          limit: AppConfig.PAGINATION_LIMIT,
          offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
          attributes: SUBSCRIPTION_FIELDS,
        })
    })
    .then(result => {
      res.json({
        count: result.count,
        results: result.rows,
      })
    })
    .catch(e => next(e))
}

/**
 * @api {GET} /subscription_lists/unsubscribe/:key Unsubscribe User
 * @apiName unsubscribeUserFromSubscriptionList
 * @apiGroup SubscriptionLists
 *
 * @apiParam {String} key Unsubscribe Key
 *
 * @apiSuccess {Object} Response Subscription object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *    {
 *      message: 'Your have been successfully removed from this subscription list',
 *    }
 */
export function unsubscribe(_req, res, next) {
  const { key = null } = res.locals
  let listId
  return User
    .getDataFromKey(key)
    .then(([user, subscriptionListId]) => {
      listId = subscriptionListId
      return Subscription
        .destroy({
          where: {
            user_uid: user.uid,
            subscription_list_id: subscriptionListId,
          },
        })
    })
    .then(() => SubscriptionList.findByPk(listId))
    .then(subscriptionList => {
      return res.render('unsubscribe', {
        subscribeLink: `/subscription_lists/subscribe/${key}`,
        subscriptionListName: subscriptionList ? subscriptionList.name : '',
        subscriptionListDescription: subscriptionList ? subscriptionList.description : '',
      })
    })
    .catch(e => next(e))
}

/**
 * @api {GET} /subscription_lists/subscribe/:key Subscribe User
 * @apiName subscribeUserToSubscriptionList
 * @apiGroup SubscriptionLists
 *
 * @apiParam {String} key Subscribe Key
 *
 * @apiSuccess {Object} Response Subscription object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 HTML Content
 */
export function subscribe(_req, res, next) {
  const { key = null } = res.locals
  let listId
  return User
    .getDataFromKey(key)
    .then(([user, subscriptionListId]) => {
      listId = subscriptionListId
      return Subscription
        .findOrCreate({
          where: {
            user_uid: user.uid,
            subscription_list_id: subscriptionListId,
          },
        })
    })
    .then(() => SubscriptionList.findByPk(listId))
    .then(subscriptionList => {
      return res.render('subscribe', {
        subscriptionListName: subscriptionList ? subscriptionList.name : '',
        subscriptionListDescription: subscriptionList ? subscriptionList.description : '',
      })
    })
    .catch(e => next(e))
}

/**
 * @api {PUT} /subscription_lists/:id/subscriptions Update list of Subscriptions of a subscription list
 * @apiName updateSubscriptionListSubscriptions
 * @apiGroup SubscriptionLists
 *
 * @apiParam {Number} id Subscription List ID
 * @apiParam {String} user_uids Comma separated User UIDs
 *
 * @apiSuccess {Object} Response empty object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *    {}
 */
export function updateSubscriptions(_req, res, next) {
  const { id = null, user_uids = [] } = res.locals
  User
    .findAll({
      where: {
        uid: {
          [Op.in]: user_uids,
        },
      },
    })
    .then(users => {
      if (users.length !== user_uids.length) {
        return Promise.reject(Response.Invalid('Invalid User UID sent'))
      }
      Subscription
        .destroy({
          where: {
            subscription_list_id: id,
          },
        })
    })
    .then(() => {
      const subscriptions = user_uids.map(uid => {
        return {
          user_uid: uid,
          subscription_list_id: id,
        }
      })
      Subscription.bulkCreate(subscriptions)
    })
    .then(() => res.status(201).json({}))
    .catch(e => next(e))
}

/**
 * @api {POST} /subscription_lists/:id/subscriptions Create a new Subscription on a subscription list
 * @apiName createSubscriptionListSubscription
 * @apiGroup SubscriptionLists
 *
 * @apiParam {Number} id Subscription List ID
 * @apiParam {String} user_uid User UID
 *
 * @apiSuccess {Object} Response Subscription object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *      {
 *        user_uid: "b0ae9ed7-05a2-11e6-a4d1-22000b04a6df",
 *        subscription_list_id: 1
 *      }
 */
export function addSubscription(_req, res, next) {
  const { id = null, user_uid = null } = res.locals
  return Subscription
    .findOrCreate({
      where: {
        user_uid: user_uid,
        subscriptionListId: id,
      },
    })
    .spread((subscription, created) => {
      if (!created) {
        return next(Response.Invalid('Subscription already exists'))
      }
      return res.status(201).json(subscription)
    })
    .catch(e => next(e))
}

/**
 * @api {DELETE} /subscription_lists/:id/subscription Delete a Subscription on a subscription list
 * @apiName destroySubscriptionListSubscription
 * @apiGroup SubscriptionLists
 *
 * @apiParam {Number} id Subscription List ID
 * @apiParam {String} user_uid User UID
 *
 * @apiSuccess {Object} Response Subscription object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *    {}
 */
export function removeSubscription(_req, res, next) {
  const { id = null, user_uid = null } = res.locals
  Subscription
    .destroy({
      where: {
        user_uid: user_uid,
        subscription_list_id: id,
      },
    })
    .then(() => res.status(204).json({}))
    .catch(e => next(e))
}

/**
 * @api {PUT} /subscription_lists/:id Update Subscription list
 * @apiName updateSubscriptionList
 * @apiGroup SubscriptionLists
 *
 * @apiParam {Number} id Subscription List ID
 * @apiParam {Number} name Subscription List Name
 * @apiParam {Number} [description] Subscription List Description
 *
 * @apiSuccess {Object} Response SubscriptionList object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *    {
 *      id: 1,
 *      name: "EdLab Dev Team",
 *      description: "This list contains users who work in the EdLab dev team"
 *    }
 */
export function update(_req, res, next) {
  const { id = null } = res.locals
  SubscriptionList
    .findByPk(id)
    .then(subscriptionList => {
      SUBSCRIPTION_LIST_FIELDS.forEach(field => {
        if (res.locals[field]) {
          subscriptionList[field] = res.locals[field]
        }
      })
      return subscriptionList.save()
    })
    .then(subscriptionList => subscriptionList.reload())
    .then(subscriptionList => res.status(201).send(subscriptionList))
    .catch(e => next(e))
}

/**
 * @api {POST} /subscription_lists Create new Subscription list
 * @apiName createSubscriptionList
 * @apiGroup SubscriptionLists
 *
 * @apiParam {Number} name Subscription List Name
 * @apiParam {Number} [description] Subscription List Description
 *
 * @apiSuccess {Object} Response SubscriptionList object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *    {
 *      id: 1,
 *      name: "EdLab Dev Team",
 *      description: "This list contains users who work in the EdLab dev team"
 *    }
 */
export function create(_req, res, next) {
  const subscriptionListData = {}
  SUBSCRIPTION_LIST_FIELDS.forEach(field => {
    if (res.locals[field]) {
      subscriptionListData[field] = res.locals[field]
    }
  })
  SubscriptionList
    .create(subscriptionListData)
    .then(subscriptionList => res.status(201).send(subscriptionList))
    .catch(e => next(e))
}

/**
 * @api {DELETE} /subscription_lists/:id Delete Subscription list
 * @apiName destroySubscriptionList
 * @apiGroup SubscriptionLists
 *
 * @apiParam {Number} id Subscription List ID
 *
 * @apiSuccess {Object} Response empty object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *    {}
 */
export function destroy(_req, res, next) {
  const { id = null } = res.locals
  SubscriptionList
    .findByPk(id)
    .then(subscriptionList => subscriptionList.destroy())
    .then(() => res.status(204).json({}))
    .catch(e => next(e))
}
