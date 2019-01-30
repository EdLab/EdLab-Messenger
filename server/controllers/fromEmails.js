const FROM_EMAIL_FIELDS = ['id', 'sender', 'email']

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

// TODO: Following function need AWS verification of new email IDs

export function update(_req, res, next) {
  const { id = null } = res.locals
  FromEmail
    .findByPk(id, {
      attributes: FROM_EMAIL_FIELDS,
    })
    .then(fromEmail => {
      EMAIL_ID_FIELDS.forEach(field => {
        if (res.locals[field]) {
          fromEmail[field] = res.locals[field]
        }
      })
      return fromEmail.save()
    })
    .then(fromEmail => fromEmail.reload())
    .then(fromEmail => res.status(201).send(fromEmail))
    .catch(e => next(e))
}

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

export function destroy(_req, res, next) {
  const { id = null } = res.locals
  EmailId
    .findByPk(id)
    .then(emailId => emailId.destroy())
    .then(() => res.status(204).send({}))
    .catch(e => next(e))
}
