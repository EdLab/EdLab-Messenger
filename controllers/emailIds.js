EMAIL_ID_FIELDS = ['id', 'sender', 'email']

export function list(_req, res, next) {
  EmailId
    .findAndCountAll({
      attributes: EMAIL_ID_FIELDS,
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

// export function update(_req, res, next) {
//   const { id = null } = res.locals
//   EmailId
//     .findByPk(id, {
//       attributes: EMAIL_ID_FIELDS,
//     })
//     .then(emailId => {
//       EMAIL_ID_FIELDS.forEach(field => {
//         if (res.locals[field]) {
//           emailId[field] = res.locals[field]
//         }
//       })
//       return emailId.save()
//     })
//     .then(emailId => emailId.reload())
//     .then(emailId => res.status(201).send(emailId))
//     .catch(e => next(e))
// }

// export function create(_req, res, next) {
//   emailIdData = {}
//   EMAIL_ID_FIELDS.forEach(field => {
//     if (res.locals[field]) {
//       emailIdData[field] = res.locals[field]
//     }
//   })
//   EmailId
//     .create(emailIdData)
//     .then(emailId => res.status(201).send(emailId))
//     .catch(e => next(e))
// }

export function destroy(_req, res, next) {
  const { id = null } = res.locals
  EmailId
    .findByPk(id)
    .then(emailId => emailId.destroy())
    .then(() => res.status(204).send({}))
    .catch(e => next(e))
}
