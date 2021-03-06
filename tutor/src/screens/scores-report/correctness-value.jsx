import React from 'react';
import { isNil } from 'lodash';
import { observer } from 'mobx-react';
import { asPercent } from '../../helpers/string';
import TaskResult from '../../models/course/scores/task-result';
import TH from '../../helpers/task';
import TutorLink from '../../components/link';
import UX from './ux';

const ReviewLink = ({ task, children }) => {
  const { course } = task.student.period;
  if (!course.isTeacher) {
    return children;
  }
  return (
    <TutorLink
      to="viewTaskStep"
      data-assignment-type={`${task.type}`}
      params={{ courseId: course.id, id: task.id, stepIndex: 1 }}
    >
      {children}
    </TutorLink>
  );
};

const Progress = observer(({ task }) => {
  const progress = isNil(task.correct_exercise_count) ? '---' : TH.getHumanScoreNumber(task);
  return <div className="correct-progress">{progress}</div>;
});

const Percent = observer(({ task: { score } }) => {
  const display = isNil(score) ? '---' : `${asPercent(score)}%`;
  return <div className="correct-score">{display}</div>;
});


@observer
export default class CorrectnessValue extends React.Component {

  static propTypes = {
    ux: React.PropTypes.instanceOf(UX).isRequired,
    task: React.PropTypes.instanceOf(TaskResult).isRequired,
  }

  render() {
    const { ux, task } = this.props;
    const isDue = TH.isDue(task);

    if (task.isStarted || isDue) {
      const Display = (ux.displayValuesAs === 'percentage') ? Percent : Progress;
      const value = <Display task={task} />;

      return task.isStarted ?
        <ReviewLink task={task}>{value}</ReviewLink> : value;
    } else {
      return <div className="correct unstarted">---</div>;
    }
  }
}
