const Op = SequelizeInst.Op

const SUBSCRIPTION_FIELDS = ['user_uid', 'subscription_list_id']
const SUBSCRIPTION_LIST_FIELDS = ['id', 'name', 'description']

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
      })
    })
    .catch(e => next(e))
}

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
    .then(() => res.json({}))
    .catch(e => next(e))
}

export function addSubscription(_req, res, next) {
  const { id = null, user_uid = null } = res.locals
  Subscription
    .findOrCreate({
      where: {
        user_uid: user_uid,
        subscription_list_id: id,
      }
    })
    .spread((subscription, _created) => {
      // if (!created) {
      //   return next(Response.Invalid('Subscription already exists'))
      // }
      return res.json(subscription)
    })
    .catch(e => next(e))
}

export function removeSubscription(_req, res, next) {
  const { id = null, user_uid = null } = res.locals
  Subscription
    .destroy({
      where: {
        user_uid: user_uid,
        subscription_list_id: id,
      }
    })
    .then(response => res.json(response))
    .catch(e => next(e))
}

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

export function destroy(_req, res, next) {
  const { id = null} = res.locals
  SubscriptionList
    .findByPk(id)
    .then(subscriptionList => subscriptionList.destroy())
    .catch(e => next(e))
}
