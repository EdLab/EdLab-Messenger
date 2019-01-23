const USER_FIELDS = ['uid', 'email', 'firstname', 'lastname', 'username']
const SUBSCRIPTION_FIELDS = ['user_uid', 'subscription_list_id']
const SUBSCRIPTION_LIST_FIELDS = ['id', 'name', 'description', 'default_from_id']
const EMAIL_ID_FIELDS = ['sender', 'email']

export function list(_req, res, next) {
  const { p = 1 } = res.locals
  SubscriptionList
    .findAndCountAll({
      limit: AppConfig.PAGINATION_LIMIT,
      offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
      attributes: SUBSCRIPTION_LIST_FIELDS,
      include: [ { model: EmailId, attributes: EMAIL_ID_FIELDS } ],
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
      subscriptionList
        .getSubscriptions({
          limit: AppConfig.PAGINATION_LIMIT,
          offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
          attributes: SUBSCRIPTION_FIELDS,
          include: [ { model: User, attributes: USER_FIELDS } ],
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
  SubscriptionList
    .findByPk(id)
    .then(subscriptionList => {
      const subscriptions = user_uids.map(uid => {
        return { user_uid: uid }
      })
      subscriptionList.setSubscriptions(subscriptions)
    })
    .then(response => res.json(response))
    .catch(e => next(e))
}

export function addSubscription(_req, res, next) {
  const { id = null, user_uid = null } = res.locals
  SubscriptionList
    .findByPk(id)
    .then(subscriptionList => {
      subscriptionList.addSubscription({ user_uid: user_uid })
    })
    .then(response => res.json(response))
    .catch(e => next(e))
}

export function update(_req, res, next) {
  const { id = null} = res.locals
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
  subscriptionListData = {}
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
