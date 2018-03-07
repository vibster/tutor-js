import React from 'react';
import ReactDOM from 'react-dom';
import { Overlay, Popover } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import TH from '../../helpers/task';
import TutorLink from '../../components/link';
import { LateWork } from './late-work';
import PieProgress from './pie-progress';
import PercentCorrect from './percent-correct';
import TaskResult from '../../models/course/scores/task-result';

const HomeworkScore = ({ task, displayAs, courseId }) => {

  const scorePercent = TH.getHumanScorePercent(task);
  const scoreNumber = TH.getHumanScoreNumber(task);
  const completed = task.completed_exercise_count === task.exercise_count;
  const scoreText = completed || TH.isDue(task) ? displayAs === 'number' ? scoreNumber : scorePercent : '---';

  if (TH.isHomeworkTaskStarted(task)) {
    return (
      <div className="score">
        <TutorLink
          to="viewTaskStep"
          data-assignment-type={`${task.type}`}
          params={{ courseId, id: task.id, stepIndex: 1 }}>
          {scoreText}
        </TutorLink>
      </div>
    );
  }

  return (
    <div className="score not-started">
      ---
    </div>
  );

};


@observer
export default class HomeworkCell extends React.PureComponent {

  static propTypes = {
    className: React.PropTypes.string,
    courseId: React.PropTypes.string.isRequired,
    isConceptCoach: React.PropTypes.bool,
    columnIndex: React.PropTypes.number.isRequired,
    task: React.PropTypes.instanceOf(TaskResult).isRequired,
  }

  @observable isShowingPopover = false;

  @action.bound show() {
    this.isShowingPopover = true;
  }

  @action.bound hide() {
    this.isShowingPopover = false;
  }

  @action.bound getPieChartTarget() {
    return (
      ReactDOM.findDOMNode(this.refs.pieChart)
    );
  }

  renderPopover() {
    const { task } = this.props;
    const progress = <PieProgress ref="pieChart" task={task} />;
    if (!task.isStarted) {
      return <div>{progress}</div>;
    }
    return (
      <div className="worked" onMouseOver={this.show} onMouseLeave={this.hide}>

        <Overlay
          target={this.getPieChartTarget}
          show={this.isShowingPopover}
          onHide={this.hide}
          placement="left">
          <Popover
            onMouseOver={this.show}
            onMouseLeave={this.hide}
            id={`scores-cell-info-popover-${task.id}`}
            className="scores-scores-tooltip-completed-info"
          >
            <div className="info">
              <div className="row">
                <div>
                  Completed {TH.getHumanCompletedPercent(task)}
                </div>
              </div>
              <div className="row">
                <div>
                  {TH.getHumanProgress(task)} questions
                </div>
              </div>
            </div>
          </Popover>
        </Overlay>
        {progress}
      </div>
    );
  }

  renderLateWork() {
    const { task, columnIndex } = this.props;

    if (!this.props.period.course.isTeacher) {
      return null;
    }

    return (
      <LateWork
        task={task}
        onMouseOver={this.show}
        onMouseLeave={this.hide}
        columnIndex={columnIndex}
      />
    );
  }

  render() {
    return (
      <div className="scores-cell">
        <PercentCorrect task={this.props.task} />
        {this.renderPopover()}
        {this.renderLateWork()}
      </div>
    );
  }

}
