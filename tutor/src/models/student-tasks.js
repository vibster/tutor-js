import Map from 'shared/model/map';
import moment from 'moment-timezone';
import { readonly } from 'core-decorators';
import { computed, action, observable } from 'mobx';
import { filter, groupBy, sortBy, pickBy } from 'lodash';
import { TimeStore } from '../flux/time';
import Task from './student/task';
import ResearchSurveys from './research-surveys';

const MAX_POLLING_ATTEMPTS = 10;
const POLL_SECONDS = 30;
const ISOWEEK_FORMAT = 'GGGGWW';

export class CourseStudentTasks extends Map {
  @readonly static Model = Task;

  @observable researchSurveys;
  @observable expecting_assignments_count = 0;

  constructor(courseId) {
    super();
    this.courseId = courseId;
  }

  @computed get byWeek() {
    const weeks = groupBy(this.array, event => moment(event.due_at).startOf('isoweek').format(ISOWEEK_FORMAT));
    const sorted = {};
    for (let weekId in weeks) {
      const events = weeks[weekId];
      sorted[weekId] = sortBy(events, 'due_at');
    }
    return sorted;
  }

  @computed get pastEventsByWeek() {
    const thisWeek = moment(TimeStore.getNow()).startOf('isoweek').format(ISOWEEK_FORMAT);
    return pickBy(this.byWeek, (events, week) => week < thisWeek);
  }

  weeklyEventsForDay(day) {
    return this.byWeek[moment(day).startOf('isoweek').format(ISOWEEK_FORMAT)] || [];
  }

  // Returns events who's due date has not passed
  upcomingEvents(now = TimeStore.getNow()) {
    return sortBy(filter(this.array, event => event.due_at > now), 'due_at');
  }

  // note: the response also contains limited course and role information but they're currently unused
  onLoaded({ data: { tasks, research_surveys } }) {
    this.researchSurveys = research_surveys ? new ResearchSurveys(research_surveys) : null;
    this.mergeModelData(tasks);
  }
}

class StudentTasks extends Map {

  forCourseId(courseId) {
    let courseMap = this.get(courseId);
    if (!courseMap) {
      courseMap = new CourseStudentTasks(courseId);
      this.set(courseId, courseMap);
    }
    return courseMap;
  }

}

const studentTasks = new StudentTasks;
export default studentTasks;
