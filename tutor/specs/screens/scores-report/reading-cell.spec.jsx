import { React, Testing, _ } from '../../components/helpers/component-testing';
import ScoresUX from '../../../src/screens/scores-report/ux';
import bootstrapScores from '../../helpers/scores-data.js';
import Cell from '../../../src/screens/scores-report/reading-cell';
import PieProgress from '../../../src/screens/scores-report/pie-progress';
import TH from '../../../src/helpers/task';
import EnzymeContext from '../../components/helpers/enzyme-context';

describe('Student Scores Report Reading Cell', function() {
  let task;
  let props;
  let scores;
  let course;
  let ux;

  beforeEach(function() {
    ({ course, scores } = bootstrapScores());
    ux = new ScoresUX(course);
    task = scores.getTask(8);
    props = {
      ux,
      task,
      columnIndex: 0,
      isConceptCoach: false,
      student: {
        name: 'Molly Bloom',
        role: 1,
      },
    };
  });


  it('renders as not started', function() {
    props.task.completed_step_count = 0;
    props.task.completed_on_time_step_count = 0;
    expect(TH.getCompletedPercent(props.task)).to.equal(0);
    const cell = mount(<Cell {...props} />, EnzymeContext.build());
    expect(cell).not.toHaveRendered('.worked .not-started');
    expect(cell.text()).toEqual('17%');
    ux.displayValuesAs = 'number';
    expect(cell.text()).toEqual('5 of 29');
  });

  it('displays late caret when worked late', function() {
    props.task.completed_on_time_step_count = 3;
    const cell = shallow(<Cell {...props} />);
    expect(cell).toHaveRendered('LateWork');
  });

  it('displays accepted caret when accepted', function() {
    props.task.completed_on_time_step_count = 1;
    props.task.completed_step_count = 2;
    props.task.is_late_work_accepted = true;
    expect(props.task.isLate).toBe(true);
    const cell = mount(<Cell {...props} />, EnzymeContext.build());
    expect(cell).toHaveRendered('LateWork');
    expect(cell).toHaveRendered('.late-caret.accepted');
  });

  it('hides late work from students', () => {
    props.task.completed_on_time_step_count = 1;
    props.task.completed_step_count = 2;
    props.task.is_late_work_accepted = true;
    const cell = mount(<Cell {...props} />, EnzymeContext.build());
    expect(cell).toHaveRendered('.late-caret');
    props.task.student.period.course.roles[0].type = 'student';
    expect(cell).not.toHaveRendered('.late-caret');
  });

});
