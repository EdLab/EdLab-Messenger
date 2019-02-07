export function getController(name, path = '../controllers') {
  return require(`${path}/${name}`)
}
