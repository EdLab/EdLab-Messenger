import { readdirSync } from 'fs'
import { basename as _basename } from 'path'
const basename = _basename(module.filename)

const Lib = {}
readdirSync(__dirname)
  .filter((file) => {
    return file !== basename
  })
  .forEach((file) => {
    const moduleName = _basename(file, '.js')
    Lib[moduleName] = require(`./${file}`)
  })

export default Lib
