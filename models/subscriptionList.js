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

  return SubscriptionList
}
