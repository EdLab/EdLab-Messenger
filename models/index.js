const debug = require('debug')('DB:Models')
const globalModels = {
  Email: SequelizeInst.import('./email'),
  EmailId: SequelizeInst.import('./emailId'),
  Message: SequelizeInst.import('./message'),
  StatusLog: SequelizeInst.import('./statusLog'),
  Subscription: SequelizeInst.import('./subscription'),
  SubscriptionList: SequelizeInst.import('./subscriptionList'),
  Template: SequelizeInst.import('./template'),
  User: AccountsSequelizeInst.import('./user'),
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
