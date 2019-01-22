const debug = require('debug')('DB:Models')
const globalModels = {
  Email: SequelizeInst.import('./email'),
  Message: SequelizeInst.import('./message'),
  StatusLog: SequelizeInst.import('./statusLog'),
  Template: SequelizeInst.import('./template'),
}
Object
  .keys(SequelizeInst.models)
  .forEach((model) => {
    if ('associate' in SequelizeInst.models[model]) {
      SequelizeInst.models[model].associate(SequelizeInst.models)
      debug(`Adding associations for ${model}`)
    }
  })
export default globalModels
