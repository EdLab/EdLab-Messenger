export default function (sequelize, DataTypes) {
  const Subscription = sequelize.define('subscription', {
    user_uid: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  }, {
    underscored: true,
    hooks: {},
    classMethods: {},
    instanceMethods: {},
  })

  Subscription.associate = (models) => {
    Subscription.belongsTo(models.subscription_list, {
      onDelete: 'CASCADE',
    })
  }

  return Subscription
}
