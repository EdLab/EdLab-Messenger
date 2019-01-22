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
    classMethods: {
      associate(models) {
        SubscriptionList.belongsTo(models.email_id, {
          onDelete: 'SET NULL',
          as: 'default_from',
          foreignKey: { allowNull: true },
        })
        SubscriptionList.hasMany(models.subscription, {
          onDelete: 'CASCADE',
        })
        SubscriptionList.hasMany(models.email, {
          onDelete: 'RESTRICT',
          foreignKey: { allowNull: true },
        })
      },
    },
    instanceMethods: {},
  })

  return SubscriptionList
}
