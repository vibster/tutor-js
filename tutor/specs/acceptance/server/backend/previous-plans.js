const Factory = require('object-factory-bot');
require('../../../factories/book');
const { times } = require('lodash');
const { now } = require('../time-now');

let ROLE = 'teacher';

let payload = {
  total_count: 5,
  items: times(5, (i) => Factory.create('TeacherDashboardTask',
    { now, days_ago: 100 + (i*5) }
  )),
};

module.exports = {

  setRole(role) {
    ROLE = role;
  },

  handler(req, res) {
    return res.json(payload);
  },

};
