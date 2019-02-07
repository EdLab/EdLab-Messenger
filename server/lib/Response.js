const errorObj = (option) => {
  if (typeof option === 'string') {
    return new Error(option)
  } else { //Error Object it self
    return option
  }
}
export function Invalid(option) {
  const error = errorObj(option)
  error.status = 400
  return error
}
export function Unauthorized(option) {
  const error = errorObj(option)
  error.status = 401
  return error
}
export function Forbidden(option) {
  const error = errorObj(option)
  error.status = 403
  return error
}
export function NotFound(option) {
  const error = errorObj(option)
  error.status = 404
  return error
}
export function InternalError(option) {
  const error = errorObj(option)
  error.status = 500
  return error
}
