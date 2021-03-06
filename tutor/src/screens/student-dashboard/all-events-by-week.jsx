import React from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { autobind } from 'core-decorators';
import EmptyPanel from './empty-panel';
import EventsPanel from './events-panel';
import StudentTasks from '../../models/student-tasks';
import { map, isEmpty } from 'lodash';

@observer
export default class AllEventsByWeek extends React.PureComponent {

  static propTypes = {
    courseId: React.PropTypes.string.isRequired,
    isCollege: React.PropTypes.bool.isRequired,
  }

  @autobind
  renderWeek(events, week) {
    const startAt = moment(week, 'YYYYww');
    return (
      <EventsPanel
        key={week}
        className="-weeks-events"
        courseId={this.props.courseId}
        isCollege={this.props.isCollege}
        events={events}
        startAt={startAt}
        endAt={startAt.clone().add(1, 'week')} />
    );
  }

  render() {
    const { courseId } = this.props;
    const weeks = StudentTasks.get(courseId).pastEventsByWeek;

    if (isEmpty(weeks)) {
      return <EmptyPanel courseId={courseId} message="No past assignments" />;
    }

    return (
      <div>
        {map(weeks, this.renderWeek)}
      </div>
    );
  }
}
