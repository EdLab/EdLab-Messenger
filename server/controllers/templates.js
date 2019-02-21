const TEMPLATE_FIELDS = ['id', 'name', 'description', 'subject', 'html', 'fields']

/**
 * @api {GET} /templates Get list of Email Templates
 * @apiName getTemplates
 * @apiGroup Templates
 *
 * @apiParam {Number} [p=1] Page number
 *
 * @apiSuccess {Object} Response Template object list.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "count": 10,
 *      "results": [
 *        {
 *          id: 1,
 *          name: "NLT Newsletter Template 1",
 *          description: "This is the first NLT Newsletter template",
 *          subject: "This is the subject of the newsletter with a {variable1}",
 *          html: "<h3>header</h3><div>with body and {variable2} and {variable3}</div>",
 *          fields: "variable1,variable2,variable3",
 *        },
 *      ]
 *    }
 */
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
        p: p,
      })
    })
    .catch(e => next(e))
}

/**
 * @api {GET} /templates/:id Retrieve Email Template
 * @apiName getTemplate
 * @apiGroup Templates
 *
 * @apiParam {Number} id Id of Template
 *
 * @apiSuccess {Object} Response Template object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      id: 1,
 *      name: "NLT Newsletter Template 1",
 *      description: "This is the first NLT Newsletter template",
 *      subject: "This is the subject of the newsletter with a {variable1}",
 *      html: "<h3>header</h3><div>with body and {variable2} and {variable3}</div>",
 *      fields: "variable1,variable2,variable3",
 *    }
 */
export function retrieve(_req, res, next) {
  const { id = null } = res.locals
  Template
    .findByPk(id, {
      attributes: TEMPLATE_FIELDS,
    })
    .then(template => res.json(template))
    .catch(e => next(e))
}

/**
 * @api {PUT} /templates/:id Update Email Template
 * @apiName updateTemplate
 * @apiGroup Templates
 *
 * @apiParam {Number} id Id of Template
 * @apiParam {String} name Name of Template
 * @apiParam {String} [description] Description of Template
 * @apiParam {String} [subject] Email Subject of Template
 * @apiParam {String} html HTML of Template
 * @apiParam {String} fields Variable fields in a Template
 *
 * @apiSuccess {Object} Response Template object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *    {
 *      id: 1,
 *      name: "NLT Newsletter Template 1",
 *      description: "This is the first NLT Newsletter template",
 *      subject: "This is the subject of the newsletter with a {variable1}",
 *      html: "<h3>header</h3><div>with body and {variable2} and {variable3}</div>",
 *      fields: "variable1,variable2,variable3",
 *    }
 */
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

/**
 * @api {POST} /templates Create Email Template
 * @apiName createTemplate
 * @apiGroup Templates
 *
 * @apiParam {String} name Name of Template
 * @apiParam {String} [description] Description of Template
 * @apiParam {String} [subject] Email Subject of Template
 * @apiParam {String} html HTML of Template
 * @apiParam {String} fields Variable fields in a Template
 *
 * @apiSuccess {Object} Response Template object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *    {
 *      id: 1,
 *      name: "NLT Newsletter Template 1",
 *      description: "This is the first NLT Newsletter template",
 *      subject: "This is the subject of the newsletter with a {variable1}",
 *      html: "<h3>header</h3><div>with body and {variable2} and {variable3}</div>",
 *      fields: "variable1,variable2,variable3",
 *    }
 */
export function create(_req, res, next) {
  const templateData = {}
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

/**
 * @api {DELETE} /templates/:id Delete Email Template
 * @apiName destroyTemplate
 * @apiGroup Templates
 *
 * @apiParam {Number} id Id of Template
 *
 * @apiSuccess {Object} Response Empty object.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 204 No Content
 *    {}
 */
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
