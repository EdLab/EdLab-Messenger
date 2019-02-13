const USER_FIELDS = ['uid', 'email', 'firstname', 'lastname', 'username']
const SUBSCRIPTION_FIELDS = ['user_uid', 'subscription_list_id']
const SUBSCRIPTION_LIST_FIELDS = ['id', 'name', 'description']

/**
 * @api {GET} /users Get list of Users
 * @apiName getUsers
 * @apiGroup Users
 *
 * @apiSuccess {Object} Response Users object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "count": 77514,
 *      "results": [
 *        {
 *          uid: "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 *          email: "xxxxxxx.xxxx@xxxxx.xxx",
 *          firstname: "Xxxxx",
 *          lastname: "Xxxxxxxx",
 *          username: "Xxxxx.Xxxxxx"
 *        },
 *      ]
 *    }
 */
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

/**
 * @api {GET} /users/:uid/subscriptions Get list of Subscriptions of a subscription list
 * @apiName getUserSubscriptions
 * @apiGroup Users
 *
 * @apiParam {String} uid User UID
 * @apiParam {Number} [p=1] Page number
 *
 * @apiSuccess {Object} Response Subscription object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "count": 10,
 *      "results": [
 *        {
 *          user_uid: "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 *          subscription_list_id: 1,
 *          subscription_list: {
 *            id: 1,
 *            name: "EdLab Dev Team",
 *            description: "This list contains users who work in the EdLab dev team"
 *          }
 *        },
 *      ]
 *    }
 */
export function subscriptions(_req, res, next) {
  const { uid = null, p = 1 } = res.locals
  User
    .findByPk(uid)
    .then(user => {
      return Subscription
        .findAndCountAll({
          limit: AppConfig.PAGINATION_LIMIT,
          offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
          where: { user_uid: user.uid },
          attributes: SUBSCRIPTION_FIELDS,
          include: [
            {
              model: SubscriptionList,
              attributes: SUBSCRIPTION_LIST_FIELDS,
            },
          ],
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
