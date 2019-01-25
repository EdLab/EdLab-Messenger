const USER_FIELDS = ['uid', 'email', 'firstname', 'lastname', 'username']
const SUBSCRIPTION_FIELDS = ['user_uid', 'subscription_list_id']
const SUBSCRIPTION_LIST_FIELDS = ['id', 'name', 'description']
const EMAIL_ID_FIELDS = ['sender', 'email']

export function list(_req, res, next) {
  const { p = 1 } = res.locals
  User
    .findAndCountAll({
      limit: AppConfig.PAGINATION_LIMIT,
      offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
      attributes: USER_FIELDS,
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
  User
    .findByPk(id)
    .then(user => {
      Subscription
        .findAll({
          limit: AppConfig.PAGINATION_LIMIT,
          offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
          where: { user_uid: user.uid },
          attributes: SUBSCRIPTION_FIELDS,
          include: [
            {
              model: SubscriptionList,
              attributes: SUBSCRIPTION_LIST_FIELDS,
              include: [ { model: EmailId, attributes: EMAIL_ID_FIELDS } ],
            }
          ]
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
