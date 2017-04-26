import { extend, clone } from 'lodash';
import { TeacherTaskPlanActions, TeacherTaskPlanStore } from '../../../src/flux/teacher-task-plan';
import { StudentDashboardActions, StudentDashboardStore } from '../../../src/flux/student-dashboard';
import User from '../../../src/models/user';
import Courses from '../../../src/models/courses-map';

import STUDENT_DASHBOARD_MODEL from '../../../api/courses/1/dashboard.json';
const TEACHER_DASHBOARD_MODEL = STUDENT_DASHBOARD_MODEL;

const STUDENT_DASHROUTE = 'viewStudentDashboard';
const TEACHER_DASHROUTE = 'taskplans';

const STUDENT_MENU = [
  {
    name: STUDENT_DASHROUTE,
    params: { courseId: '1' },
    label: 'Dashboard',
  },
  {
    name: 'viewPerformanceForecast',
    params: { courseId: '1' },
    label: 'Performance Forecast',
  },
  {
    name: 'changeStudentId',
    params: { courseId: '1' },
    label: 'Change Student ID',
  },
  {
    label: '', // divider has no label
  },
  {
    label: 'Get Help',
  },
  {
    label: 'Browse the Book',
  },
];

const TEACHER_MENU = [
  {
    name: TEACHER_DASHROUTE,
    label: 'Dashboard',
  },
  {
    name: 'viewTeacherPerformanceForecast',
    params: { courseId: '1' },
    label: 'Performance Forecast',
  },
  {
    name: 'viewQuestionsLibrary',
    params: { courseId: '2' },
    label: 'Question Library',
  },
  {
    name: 'viewScores',
    label: 'Student Scores',
  },
  {
    name: 'courseSettings',
    label: 'Course Settings and Roster',
  },
  {
    name: 'createNewCourse',
    label: 'Teach Another Course',
    params: { courseId: '2' },
  },
  {
    name: 'createNewCourse',
    label: 'Teach This Course Again',
    params: { sourceId: '2' },
  },
  {
    label: '', // divider has no label
  },
  {
    label: 'Get Help',
  },
  {
    label: 'Browse the Book',
  },
];


import COURSES_LIST from '../../../api/user/courses.json';
const COURSE_ID = COURSES_LIST[0].id;
import USER_MODEL from '../../../api/user.json';

const USER_ROLE_MODES = {
  teacher: {
    faculty_status: 'confirmed_faculty',
  },
};

const testParams = {
  student: {
    dashboard: STUDENT_DASHBOARD_MODEL,
    dashroute: STUDENT_DASHROUTE,
    menu: STUDENT_MENU,
    actions: StudentDashboardActions,
    dashpath: '/courses/1/list/',
  },

  teacher: {
    dashboard: TEACHER_DASHBOARD_MODEL,
    dashroute: TEACHER_DASHROUTE,
    menu: TEACHER_MENU,
    actions: TeacherTaskPlanActions,
    dashpath: '/courses/1/t/calendar/',
  },

};

export function setupStores(roleType) {
  const roleTestParams = testParams[roleType];
  roleTestParams.user = USER_MODEL;

  if (USER_ROLE_MODES[roleType]) { roleTestParams.user = extend({}, roleTestParams.user, USER_ROLE_MODES[roleType]); }

  const coursesList = clone(COURSES_LIST);
  coursesList[0].roles[0].type = roleType;

  User.update(roleTestParams.user);
  Courses.bootstrap(coursesList);
  roleTestParams.actions.loaded(roleTestParams.dashboard, COURSE_ID);
  return roleTestParams;
}

export function resetStores(roleType) {
  return testParams[roleType].actions.reset();
}

const courseModel = COURSES_LIST[0];

export { testParams, USER_MODEL as userModel, courseModel };
