export default function (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  if (err.status != 404) {
    Logger.error(`[${req.sessionID}] ${err}`)
  } else {
    Logger.silly(err)
  }
  if (err.status) {
    res.status(err.status)
  } else {
    res.status(500)
  }
  res.json({ ...err, message: err.message })
}
