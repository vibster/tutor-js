import React from 'react';
import { observer } from 'mobx-react';
import { computed, observable, action } from 'mobx';
import camelCase from 'lodash/camelCase';
import classnames from 'classnames';
import { Modal, Button } from 'react-bootstrap';
import TourRegion from '../tours/region';
import Stats from '../plan-stats';
import Event from '../plan-stats/event';
import LmsInfo from '../task-plan/lms-info';
import TutorLink from '../link';
import TeacherTaskPlan from '../../models/task-plan/teacher';


@observer
export default class CoursePlanDetails extends React.PureComponent {

  static defaultProps = {
    hasReview: false,
  }

  static propTypes = {
    plan: React.PropTypes.instanceOf(TeacherTaskPlan).isRequired,
    courseId: React.PropTypes.string.isRequired,
    onHide: React.PropTypes.func.isRequired,
    hasReview: React.PropTypes.bool,
    className: React.PropTypes.string,
  }

  @observable showAssignmentLinks = false;

  @computed get linkParams() {
    return { courseId: this.props.courseId, id: this.props.plan.id };
  }

  @action.bound onShowAssignmentLinks() {
    this.showAssignmentLinks = true;
  }
  @action.bound onDisplayStats() {
    this.showAssignmentLinks = false;
  }


  @computed get assignmentLinksButton() {
    if (this.props.plan.type === 'event'){ return null; }
    return (
      <Button onClick={this.onShowAssignmentLinks}>
        Get assignment link
      </Button>
    );
  }

  @computed get footer() {
    const { plan } = this.props;
    if (this.showAssignmentLinks || !plan.isPublished) { return null; }

    const editLinkName = camelCase(`edit-${this.props.plan.type}`);

    return (
      <div className="modal-footer">

        <TutorLink
          disabled={!plan.isPublished}
          className="btn btn-default"
          to={plan.isExternal ? 'viewScores' : 'reviewTask'}
          params={this.linkParams}>
          {plan.isExternal ? 'View Scores' : 'Review Metrics'}
        </TutorLink>

        <TutorLink
          className="btn btn-default"
          to={editLinkName}
          params={this.linkParams}
        >
          {plan.isEditable ? 'Edit' : 'View'}
          {' '}
          {plan.type === 'event' ? 'Event' : 'Assignment'}
        </TutorLink>

        {this.assignmentLinksButton}
      </div>
    );
  }

  @computed get body() {
    const { courseId, plan } = this.props;
    if (this.showAssignmentLinks) {
      return (
        <LmsInfo
          onBack={this.onDisplayStats}
          plan={plan} courseId={this.props.courseId} />
      );
    }

    if (plan.isPublished) {
      if (plan.isEvent) {
        return (
          <Event plan={plan} courseId={courseId} />
        );
      } else {
        return (
          <Stats plan={plan} courseId={courseId} />
        );
      }
    } else if (plan.isPublishing) {
      return (
        <p>
          This assignment is publishing.
        </p>
      );
    }
    return null;
  }

  render() {
    const { plan: { title, type }, className, onHide } = this.props;

    return (
      <Modal
        onHide={onHide}
        show={true}
        enforceFocus={false}
        data-assignment-type={type}
        className={classnames('plan-modal', className)}
      >
        <TourRegion
          id="analytics-modal"
          courseId={this.props.courseId}
        >
          <Modal.Header closeButton={true}>
            <Modal.Title>
              {title}
            </Modal.Title>
          </Modal.Header>
          <div className="modal-body">
            {this.body}
          </div>
          {this.footer}
        </TourRegion>
      </Modal>
    );
  }
}
