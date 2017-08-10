import {React, SnapShot, Wrapper} from '../helpers/component-testing';
import Dashboard from '../../../src/components/student-dashboard/dashboard';
import EnzymeContext from '../helpers/enzyme-context';
import StudentTasks from '../../../src/models/student-tasks';
import { bootstrapCoursesList } from '../../courses-test-data';

describe('Student Dashboard', () => {
  let props;

  beforeEach(() => {
    bootstrapCoursesList();
    props = {
      courseId: '1',
      params: {},
    };
    StudentTasks.forCourseId(1).onLoaded({ data: { tasks: [{
      'id': '118',
      'title': 'Read Chapter 1',
      'opens_at': (new Date(Date.now() - 1000 * 3600 * 24)).toString(),
      'due_at': '2016-05-19T12:00:00.000Z',
      'last_worked_at': '2016-05-19T11:59:00.000Z',
      'type': 'reading',
      'complete': true,
      'is_deleted': false,
      'exercise_count': 3,
      'complete_exercise_count': 3,
    }] } });
  });

  it('matches snapshot', function() {
    const component = SnapShot.create(<Wrapper _wrapped_component={Dashboard} {...props} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

});
