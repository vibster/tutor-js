const Factory = require('object-factory-bot');

const BOOTSTRAP_DATA = require('../../data/bootstrap.json');
require('../../../factories/user');
require('../../../factories/course');
const { fe_port, be_port } = require('./ports');

const { clone, merge } = require('lodash');

let ROLE = 'teacher';

function addCourses(courses, attrs) {
  courses.push(Factory.create('Course', merge(attrs, { type: 'biology' })));
  courses.push(Factory.create('Course', merge(attrs, { type: 'physics' })));
  courses.push(Factory.create('Course', merge(attrs, { type: 'physics', months_ago: -6 })));
  courses.push(Factory.create('Course', merge(attrs, { type: 'biology', months_ago: -7 })));
}

BOOTSTRAP_DATA.accounts_api_url = `http://localhost:${be_port}/api`;
BOOTSTRAP_DATA.tutor_api_url = `http://localhost:${be_port}/api`;

const student = clone(BOOTSTRAP_DATA);
student.user = Factory.create('User', { is_teacher: false });
student.courses = [];
addCourses(student.courses, { is_teacher: false });

const teacher = clone(BOOTSTRAP_DATA);
teacher.user = Factory.create('User', { is_teacher: true });
teacher.courses = [];
addCourses(teacher.courses, { is_teacher: true });

const PAYLOADS = {
  student, teacher,
};

module.exports = {

  setRole(role) {
    ROLE = role;
  },

  handler(req, res) {
    res.json(PAYLOADS[ROLE]);
  },

};
