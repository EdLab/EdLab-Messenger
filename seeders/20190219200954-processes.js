const processes = [
  {
    id: 1,
    name: 'sendScheduledEmails',
    is_running: false,
  },
  {
    id: 2,
    name: 'updateStatusLogs',
    is_running: false,
  },
]

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('processes', processes, {})
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('processes', null, {})
  },
}
