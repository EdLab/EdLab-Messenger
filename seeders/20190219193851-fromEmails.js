const fromEmails = [
  {
    id: 1,
    sender: 'EdLab Dev Team',
    email: 'edlabit@tc.columbia.edu',
  },
  {
    id: 2,
    sender: 'TC Library',
    email: '***REMOVED***@tc.columbia.edu',
  },
]

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('from_emails', fromEmails, {})
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('from_emails', null, {})
  },
}
