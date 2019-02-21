const subscriptionLists = [
  {
    id: 1,
    name: 'EdLab Dev Team',
    description: 'EdLab Development Team List',
  },
  {
    id: 2,
    name: 'Ryan and Srujan',
    description: 'List containing Ryan and Srujan',
  },
  {
    id: 3,
    name: 'AWS Tests',
    description: 'List containing AWS Test Email IDs',
  },
]

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('subscription_lists', subscriptionLists, {})
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('subscription_lists', null, {})
  },
}
