const EMAIL_FIELDS = ['id', 'subject', 'html', 'to_user_uids', 'cc_user_uids', 'bcc_user_uids',
                      'scheduled_at', 'from_email_id', 'subscription_list_id']
const MESSAGE_FIELDS = ['id', 'ses_id', 'to_user_uid']
// const STATUS_LOG_FIELDS = ['id', 'status', 'status_at', 'comment']
const NO_MESSAGES_QUERY = '(SELECT COUNT(`id`) FROM `messages` WHERE `email_id` = `email`.`id`)'

export function list(_req, res, next) {
  const { p = 1 } = res.locals
  const fields = EMAIL_FIELDS
  fields.push('completed_at')
  fields.push([SequelizeInst.literal(NO_MESSAGES_QUERY), 'no_messages'])
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
      })
    })
    .catch(e => next(e))
}

export function retrieve(_req, res, next) {
  const { id = null } = res.locals
  const fields = EMAIL_FIELDS
  fields.push('completed_at')
  fields.push([SequelizeInst.literal(NO_MESSAGES_QUERY), 'no_messages'])
  Email
    .findByPk(id, {
      attributes: fields,
    })
    .then(email => res.json(email)) // TODO: Add more data on message statuses
    .catch(e => next(e))
}

export function messages(_req, res, next) {
  const { id = null, p = 1 } = res.locals
  Email
    .findByPk(id)
    .then(email => {
      email
        .getMessages({
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
      })
    })
    .catch(e => next(e))
}

export function update(_req, res, next) {
  const { id = null, scheduled_at = null,
    subscription_list_id = null, to_user_uids = null } = res.locals
  if (scheduled_at && new Date(scheduled_at) < new Date()) {
    return next(Response.Invalid('Scheduled time earlier than now'))
  }
  if ((subscription_list_id && to_user_uids) || (!subscription_list_id && !to_user_uids)) {
    throw new Error('Require (only) one of `to_user_uids` and `subscription_list_id` fields')
  }
  if (subscription_list_id && !scheduled_at) {
    return next(Response.Invalid('Require scheduling time when sending to a subscription list'))
  }
  Email
    .findByPk(id, {
      attributes: EMAIL_FIELDS,
    })
    .then(email => {
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

export function create(_req, res, next) {
  const { scheduled_at = null, subscription_list_id = null, to_user_uids = null } = res.locals
  if (scheduled_at && new Date(scheduled_at) < new Date()) {
    return next(Response.Invalid('Scheduled time earlier than now'))
  }
  if ((subscription_list_id && to_user_uids) || (!subscription_list_id && !to_user_uids)) {
    return next(Response.Invalid('Require (only) one of `to_user_uids` and `subscription_list_id` fields'))
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

export function destroy(_req, res, next) {
  const { id = null } = res.locals
  Email
    .findByPk(id)
    .then(email => {
      if (!email.scheduled_at || email.completed_at) {
        return Promise.reject(Response.Forbidden('Email already sent. Cannot delete.'))
      }
      return email.destroy()
    })
    .then(() => res.status(204).send({}))
    .catch(e => next(e))
}
