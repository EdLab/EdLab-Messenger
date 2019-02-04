const FROM_EMAIL_FIELDS = ['id', 'sender', 'email']

/**
 * @api {GET} /from_emails Get list of Email sender IDs
 * @apiName getFromEmails
 * @apiGroup FromEmails
 *
 * @apiSuccess {Object} Response FromEmail object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "count": 10,
 *      "results": [
 *        {
 *          id: 1,
 *          sender: "TC Library",
 *          email: "***REMOVED***@tc.columbia.edu"
 *        },
 *      ]
 *    }
 */
export function list(_req, res, next) {
  FromEmail
    .findAndCountAll({
      attributes: FROM_EMAIL_FIELDS,
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
 * @api {PUT} /from_emails/:id Update an Email sender
 * @apiName updateFromEmail
 * @apiGroup FromEmails
 *
 * @apiParam {Number} id Email sender ID
 * @apiParam {String} sender Sender name
 *
 * @apiSuccess {Object} Response FromEmail object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *      {
 *        id: 1,
 *        sender: "TC Library",
 *        email: "***REMOVED***@tc.columbia.edu"
 *      }
 */
export function update(_req, res, next) {
  const { id = null, sender = null } = res.locals
  if (!sender) {
    return next(Response.Invalid('Nothing to update (can only update sender field)'))
  }
  FromEmail
    .findByPk(id, {
      attributes: FROM_EMAIL_FIELDS,
    })
    .then(fromEmail => {
      fromEmail.sender = sender
      return fromEmail.save()
    })
    .then(fromEmail => fromEmail.reload())
    .then(fromEmail => res.status(201).send(fromEmail))
    .catch(e => next(e))
}

/**
 * @api {POST} /from_emails Create a new Email sender
 * @apiName createFromEmail
 * @apiGroup FromEmails
 *
 * @apiParam {String} sender Sender name
 * @apiParam {String} email Sender email address
 *
 * @apiSuccess {Object} Response FromEmail object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *      {
 *        id: 1,
 *        sender: "TC Library",
 *        email: "***REMOVED***@tc.columbia.edu"
 *      }
 */
export function create(_req, res, next) {
  const emailIdData = {}
  FROM_EMAIL_FIELDS.forEach(field => {
    if (res.locals[field]) {
      emailIdData[field] = res.locals[field]
    }
  })
  FromEmail
    .create(emailIdData)
    .then(fromEmail => res.status(201).send(fromEmail))
    .catch(e => next(e))
}

/**
 * @api {DELETE} /from_emails/:id Delete an Email sender
 * @apiName destroyFromEmail
 * @apiGroup FromEmails
 *
 * @apiParam {Number} id Email sender ID
 *
 * @apiSuccess {Object} Response empty object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *    {}
 */
export function destroy(_req, res, next) {
  const { id = null } = res.locals
  EmailId
    .findByPk(id)
    .then(emailId => emailId.destroy())
    .then(() => res.status(204).send({}))
    .catch(e => next(e))
}
