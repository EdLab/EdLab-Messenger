export default function (sequelize, DataTypes) {
  const SubscriptionList = sequelize.define('subscription_list', {
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
  }, {
    underscored: true,
    hooks: {},
  })

  SubscriptionList.associate = (models) => {
    SubscriptionList.hasMany(models.subscription, {
      onDelete: 'CASCADE',
    })
    SubscriptionList.hasMany(models.email, {
      onDelete: 'RESTRICT',
      foreignKey: { allowNull: true },
    })
  }

  SubscriptionList.unsubscribe = (messageId) => {
    Logger.debug(`Unsubscribe triggered for Message ID ${ messageId }`)
    return Message
      .findByPk(messageId, { include: [ { model: Email } ] })
      .then(message => {
        if (!message) {
          return Promise.reject(`Message with ID ${ messageId } not found`)
        }
        const listId = message.email.subscription_list_id
        if (!listId) {
          return Promise.reject(`Message with ID ${ messageId } was not sent through subscription list`)
        }
        const userUid = message.to_user_uid
        return Subscription
          .destroy({
            where: {
              user_uid: userUid,
              subscription_list_id: listId,
            },
          })
          .then(() => {
            Logger.debug(`Successfully unsubscribed User UID ${ userUid } from SubscriptionList ID ${ listId }`)
            return Promise.resolve()
          })
      })
      .catch(error => {
        Logger.error(`Unsubscribing for Message ID ${ messageId } failed: ${ error }`)
        return Promise.reject(error)
      })
  }

  return SubscriptionList
}
