import crypto from 'crypto'

export default function (sequelize, DataTypes) {
  const User = sequelize.define('subscription_user', {
    uid: {
      type: DataTypes.STRING(128),
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    firstname: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
  }, {
    timestamps: false,
  })

  User.prototype.getEmailAddress = function () {
    return `${ this.firstname } ${ this.lastname } <${ this.email }>`
  }

  User.prototype.getKey = function (subscriptionListId) {
    const iv = Buffer.from(crypto.randomBytes(16))
    const cipher = crypto.createCipheriv(AppConfig.UNSUBSCRIBE_ENCRYPTION, AppConfig.UNSUBSCRIBE_SECRET, iv)
    const user = this.get({ plain: true })
    user.subscriptionListId = subscriptionListId
    let key = cipher.update(JSON.stringify(user), 'utf8', 'hex')
    key += cipher.final('hex')
    return `${ key }:${ iv.toString('hex') }`
  }

  User.prototype.getUnsubscribeLink = function (subscriptionListId) {
    const prefix = `${ AppConfig.HOST_URL }subscription_lists/unsubscribe`
    const key = this.getKey(subscriptionListId)
    return `${ prefix }/${ key }`
  }

  User.getDataFromKey = function (keyIv) {
    const [key, ivString] = keyIv.split(':')
    const iv = Buffer.from(ivString, 'hex')
    const decipher = crypto.createDecipheriv(AppConfig.UNSUBSCRIBE_ENCRYPTION, AppConfig.UNSUBSCRIBE_SECRET, iv)
    let userString = decipher.update(key, 'hex', 'utf8')
    userString += decipher.final('utf8')
    const user = JSON.parse(userString)
    const subscriptionListId = user.subscriptionListId
    return User
      .findOne({
        where: {
          uid: user.uid,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
        },
      })
      .then(user => {
        return Promise.resolve([user, subscriptionListId])
      })
  }

  return User
}
