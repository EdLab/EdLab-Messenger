const EMAIL_FIELDS = ['id', 'subject', 'html', 'to_user_uids', 'cc_user_uids', 'bcc_user_uids',
  'scheduled_at', 'from_email_id', 'subscription_list_id']
const MESSAGE_FIELDS = ['id', 'ses_id', 'to_user_uid']
const NO_MESSAGES_QUERY = '(SELECT COUNT(`id`) FROM `messages` WHERE `email_id` = `email`.`id`)'
const EMAIL_READ_ONLY_FIELDS = ['completed_at', [SequelizeInst.literal(NO_MESSAGES_QUERY), 'no_messages']]

/**
 * @api {GET} /emails Get Email list
 * @apiName getEmails
 * @apiGroup Emails
 *
 * @apiParam {Number} [p=1] Page number for pagination
 *
 * @apiSuccess {Object} Response Email object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "count": 10,
 *      "results": [
 *        {
 *          "id": 1,
 *          "subject": "New from the Teachers College Archives",
 *          "html": "<h2>Email template here with a user specific variable like ${ firstname } of ${ lastname }</h2>"
 *          "to_user_uids": null,
 *          "cc_user_uids": null,
 *          "bcc_user_uids": null,
 *          "scheduled_at": "2019-01-30T16:28:00.000Z",
 *          "from_email_id": 2,
 *          "subscription_list_id": 1,
 *          "completed_at": "2019-01-30T16:30:03.000Z",
 *          "no_messages": 7
 *        },
 *      ]
 *    }
 */
export function list(_req, res, next) {
  const { p = 1 } = res.locals
  const fields = EMAIL_FIELDS.concat(EMAIL_READ_ONLY_FIELDS)
  Email
    .findAndCountAll({
      limit: AppConfig.PAGINATION_LIMIT,
      offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
      attributes: fields,
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
 * @api {GET} /emails/:id Get Email object by ID
 * @apiName getEmail
 * @apiGroup Emails
 *
 * @apiParam {Number} id The id of Email that you want to retrieve
 *
 * @apiSuccess {Object} Response Email object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *      {
 *        "id": 1,
 *        "subject": "New from the Teachers College Archives",
 *        "html": "<h2>Email template here with a user specific variable like ${ firstname } of ${ lastname }</h2>"
 *        "to_user_uids": null,
 *        "cc_user_uids": null,
 *        "bcc_user_uids": null,
 *        "scheduled_at": "2019-01-30T16:28:00.000Z",
 *        "from_email_id": 2,
 *        "subscription_list_id": 1,
 *        "completed_at": "2019-01-30T16:30:03.000Z",
 *        "no_messages": 7
 *      }
 */
export function retrieve(_req, res, next) {
  const { id = null } = res.locals
  const fields = EMAIL_FIELDS.concat(EMAIL_READ_ONLY_FIELDS)
  Email
    .findByPk(id, {
      attributes: fields,
    })
    .then(email => {
      if (!email) {
        return Promise.reject(Response.NotFound('Email not found'))
      }
      return res.json(email)
    }) // TODO: Add more data on message statuses
    .catch(e => next(e))
}

/**
 * @api {GET} /emails/:id/messages Get Email Message list
 * @apiName getEmailMessages
 * @apiGroup Emails
 *
 * @apiParam {Number} id Mandatory The id of Email that you want to retrieve
 * @apiParam {Number} [p=1] Page number for pagination
 *
 * @apiSuccess {Object} Response Message object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "count": 10,
 *      "results": [
 *        {
 *          "id": 1,
 *          "ses_id": "010001689f98889b-708f59b1-0a15-43de-90ff-3369ab0537d6-000000",
 *          "to_user_uid": "046b7d0b-5f18-11e6-887e-22000b04a6df"
 *        },
 *      ]
 *    }
 */
export function messages(_req, res, next) {
  const { id = null, p = 1 } = res.locals
  Email
    .findByPk(id)
    .then(email => {
      if (!email) {
        return Promise.reject(Response.NotFound('Email not found'))
      }
      return Message
        .findAndCountAll({
          where: { email_id: email.id },
          limit: AppConfig.PAGINATION_LIMIT,
          offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
          attributes: MESSAGE_FIELDS,
          include: [ { model: StatusLog } ],
        })
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
 * @api {PUT} /emails/:id Update Email
 * @apiName updateEmail
 * @apiGroup Emails
 *
 * @apiParam {Number} id The id of Email that you want to update
 * @apiParam (Body) {String} [subject] Email subject.
 * @apiParam (Body) {String} [html] Email HTML.
 * @apiParam (Body) {String} [to_user_uids] String of comma separated user UIDs
 * @apiParam (Body) {String} [cc_user_uids] String of comma separated user UIDs
 * @apiParam (Body) {String} [bcc_user_uids] String of comma separated user UIDs
 * @apiParam (Body) {String} [scheduled_at] Date time string for scdheduled send time
 * @apiParam (Body) {Number} [from_email_id] ID of from email object
 * @apiParam (Body) {Number} [subscription_list_id] ID of recipient subscription list
 *
 * @apiSuccess {Object} Response Email object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *      {
 *        "id": 1,
 *        "subject": "New from the Teachers College Archives",
 *        "html": "<h2>Email template here with a user specific variable like ${ firstname } of ${ lastname }</h2>"
 *        "to_user_uids": null,
 *        "cc_user_uids": null,
 *        "bcc_user_uids": null,
 *        "scheduled_at": "2019-01-30T16:28:00.000Z",
 *        "from_email_id": 2,
 *        "subscription_list_id": 1,
 *        "completed_at": "2019-01-30T16:30:03.000Z",
 *        "no_messages": 7
 *      }
 */
export function update(_req, res, next) {
  const { id = null } = res.locals
  let { scheduled_at = null, subscription_list_id = null,
    to_user_uids = null } = res.locals
  if (scheduled_at && new Date(scheduled_at) < new Date()) {
    return next(Response.Invalid('Scheduled time earlier than now'))
  }
  Email
    .findByPk(id, {
      attributes: EMAIL_FIELDS,
    })
    .then(email => {
      if (!email) {
        return Promise.reject(Response.NotFound('Email not found'))
      }
      if (!scheduled_at) { scheduled_at = email.scheduled_at }
      if (!subscription_list_id) { subscription_list_id = email.subscription_list_id }
      if (!to_user_uids) { to_user_uids = email.to_user_uids }
      if ((subscription_list_id && to_user_uids) || (!subscription_list_id && !to_user_uids)) {
        throw new Error('Require (only) one of `to_user_uids` and `subscription_list_id` fields')
      }
      if (subscription_list_id && !scheduled_at) {
        return next(Response.Invalid('Require scheduling time when sending to a subscription list'))
      }
      if (!email.scheduled_at || email.completed_at) {
        return next(Response.Forbidden('Email already sent. Cannot update.'))
      }
      EMAIL_FIELDS.forEach(field => {
        if (res.locals[field]) {
          email[field] = res.locals[field]
        }
      })
      return email.save()
    })
    .then(email => email.reload())
    .then(email => res.status(201).send(email))
    .catch(e => next(e))
}

/**
 * @api {POST} /emails Create Email
 * @apiName createEmail
 * @apiGroup Emails
 *
 * @apiParam (Body) {String} subject Email subject.
 * @apiParam (Body) {String} html Email HTML.
 * @apiParam (Body) {String} [to_user_uids] String of comma separated user UIDs
 * @apiParam (Body) {String} [cc_user_uids] String of comma separated user UIDs
 * @apiParam (Body) {String} [bcc_user_uids] String of comma separated user UIDs
 * @apiParam (Body) {String} [scheduled_at] Date time string for scdheduled send time
 * @apiParam (Body) {Number} from_email_id Mandatory ID of from email object
 * @apiParam (Body) {Number} [subscription_list_id] ID of recipient subscription list
 *
 * @apiSuccess {Object} Response Email object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *      {
 *        "id": 1,
 *        "subject": "New from the Teachers College Archives",
 *        "html": "<h2>Email template here with a user specific variable like ${ firstname } of ${ lastname }</h2>"
 *        "to_user_uids": null,
 *        "cc_user_uids": null,
 *        "bcc_user_uids": null,
 *        "scheduled_at": "2019-01-30T16:28:00.000Z",
 *        "from_email_id": 2,
 *        "subscription_list_id": 1,
 *        "completed_at": "2019-01-30T16:30:03.000Z",
 *        "no_messages": 7
 *      }
 */
export function create(_req, res, next) {
  const { scheduled_at = null, subscription_list_id = null, to_user_uids = null } = res.locals
  if (scheduled_at && new Date(scheduled_at) < new Date()) {
    return next(Response.Invalid('Scheduled time earlier than now'))
  }
  if (subscription_list_id && to_user_uids) {
    return next(Response.Invalid('Require only one of `to_user_uids` and `subscription_list_id` fields'))
  }
  if (!subscription_list_id && !to_user_uids) {
    return next(Response.Invalid('Require at least one of `to_user_uids` and `subscription_list_id` fields'))
  }
  if (subscription_list_id && !scheduled_at) {
    return next(Response.Invalid('Require scheduling time when sending to a subscription list'))
  }
  const emailData = {}
  EMAIL_FIELDS.forEach(field => {
    if (res.locals[field]) {
      emailData[field] = res.locals[field]
    }
  })
  Email
    .create(emailData)
    .then(email => res.status(201).send(email))
    .catch(e => next(e))
}

/**
 * @api {DELETE} /emails/:id Destroy Email
 * @apiName destroyEmail
 * @apiGroup Emails
 *
 * @apiParam {Number} id The id of Email that you want to delete
 *
 * @apiSuccess {Object} Response empty object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *    {}
 */
export function destroy(_req, res, next) {
  const { id = null } = res.locals
  Email
    .findByPk(id)
    .then(email => {
      if (!email) {
        return Promise.reject(Response.NotFound('Email not found'))
      }
      if (!email.scheduled_at || email.completed_at) {
        return Promise.reject(Response.Forbidden('Email already sent. Cannot delete.'))
      }
      return email.destroy()
    })
    .then(() => res.status(204).send({}))
    .catch(e => next(e))
}
