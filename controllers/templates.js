TEMPLATE_FIELDS = ['name', 'description', 'subject', 'html', 'fields', 'default_from']

export function list(_req, res, next) {
  const { p = 1 } = res.locals
  Template
    .findAndCountAll({
      limit: AppConfig.PAGINATION_LIMIT,
      offset: AppConfig.PAGINATION_LIMIT * Math.max(0, p - 1),
      attributes: TEMPLATE_FIELDS,
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
  Template
    .findByPk(id, {
      attributes: TEMPLATE_FIELDS,
    })
    .then(template => res.json(template))
    .catch(e => next(e))
}

export function update(_req, res, next) {
  const { id = null } = res.locals
  Template
    .findByPk(id, {
      attributes: TEMPLATE_FIELDS,
    })
    .then(template => {
      TEMPLATE_FIELDS.forEach(field => {
        if (res.locals[field]) {
          template[field] = res.locals[field]
        }
      })
      return template.save()
    })
    .then(template => template.reload())
    .then(template => res.status(201).send(template))
    .catch(e => next(e))
}

export function create(_req, res, next) {
  templateData = {}
  TEMPLATE_FIELDS.forEach(field => {
    if (res.locals[field]) {
      templateData[field] = res.locals[field]
    }
  })
  Template
    .create(templateData)
    .then(template => res.status(201).send(template))
    .catch(e => next(e))
}

export function destroy(_req, res, next) {
  const { id = null } = res.locals
  Template
    .findByPk(id, {
      attributes: TEMPLATE_FIELDS,
    })
    .then(template => template.destroy())
    .then(() => res.status(204).send({}))
    .catch(e => next(e))
}
