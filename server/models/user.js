import crypto from 'crypto'

export default function (sequelize, DataTypes) {
  const User = sequelize.define('user', {
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

  User.prototype.getUnsubscribeKey = function (subscriptionListId) {
    const cipher = crypto.createCipher(AppConfig.UNSUBSCRIBE_ENCRYPTION, AppConfig.UNSUBSCRIBE_SECRET)
    const user = this.get({ plain: true })
    user.subscriptionListId = subscriptionListId
    let unsubscribeKey = cipher.update(JSON.stringify(user), 'utf8', 'hex')
    unsubscribeKey += cipher.final('hex')
    return unsubscribeKey
  }

  User.prototype.getUnsubscribeLink = function (subscriptionListId) {
    const prefix = `${ AppConfig.HOST_URL }subscription_lists/${ subscriptionListId }/unsubscribe`
    const unsubscribeKey = this.getUnsubscribeKey(subscriptionListId)
    return `${ prefix }/${ unsubscribeKey }`
  }

  User.getDataFromUnsubscribeKey = function (unsubscribeKey) {
    const decipher = crypto.createDecipher(AppConfig.UNSUBSCRIBE_ENCRYPTION, AppConfig.UNSUBSCRIBE_SECRET)
    let userString = decipher.update(unsubscribeKey, 'hex', 'utf8')
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
