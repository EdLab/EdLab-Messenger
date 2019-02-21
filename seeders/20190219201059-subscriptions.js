const subscriptions = [
  {
    id: 1,
    user_uid: 'b0ae9ed7-05a2-11e6-a4d1-22000b04a6df',
    subscription_list_id: 1,
  },
  {
    id: 2,
    user_uid: 'ec41bf74-8f1d-11e6-887e-22000b04a6df',
    subscription_list_id: 1,
  },
  {
    id: 3,
    user_uid: '046b7d0b-5f18-11e6-887e-22000b04a6df',
    subscription_list_id: 1,
  },
  {
    id: 4,
    user_uid: '240c44d0-da0d-11e6-887e-22000b04a6df',
    subscription_list_id: 1,
  },
  {
    id: 5,
    user_uid: '7a943048-156b-11e7-ab9f-22000b04a6df',
    subscription_list_id: 1,
  },
  {
    id: 6,
    user_uid: 'b1c55ee0-05a2-11e6-a4d1-22000b04a6df',
    subscription_list_id: 1,
  },
  {
    id: 7,
    user_uid: '8e9c58ba-e8c6-11e6-887e-22000b04a6df',
    subscription_list_id: 1,
  },
  {
    id: 8,
    user_uid: 'ec41bf74-8f1d-11e6-887e-22000b04a6df',
    subscription_list_id: 2,
  },
  {
    id: 9,
    user_uid: '046b7d0b-5f18-11e6-887e-22000b04a6df',
    subscription_list_id: 2,
  },
  {
    id: 10,
    user_uid: '41f9ebcf-35f3-11e9-b884-069a23f2fafa',
    subscription_list_id: 3,
  },
  {
    id: 11,
    user_uid: '57cb5f29-35f3-11e9-b884-069a23f2fafa',
    subscription_list_id: 3,
  },
  {
    id: 12,
    user_uid: '3299d182-35f3-11e9-b884-069a23f2fafa',
    subscription_list_id: 3,
  },
]

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('subscriptions', subscriptions, {})
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete('subscriptions', null, {})
  },
}
