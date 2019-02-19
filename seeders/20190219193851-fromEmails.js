const fromEmails = [
  {
    id: 1,
    sender: 'EdLab Dev Team',
    email: 'edlabit@tc.columbia.edu',
  },
  {
    id: 2,
    sender: 'EdLab IT 1',
    email: 'edlabit@tc.edu',
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
