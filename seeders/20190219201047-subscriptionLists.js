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
]

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('subscription_lists', subscriptionLists, {})
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('subscription_lists', null, {})
  },
}
