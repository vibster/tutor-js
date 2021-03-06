import React from 'react';
import { observer } from 'mobx-react';
import { action, observable } from 'mobx';
import { isEmpty } from 'lodash';
import { Modal, Button, ControlLabel } from 'react-bootstrap';
import Courses from '../models/courses-map';
import { AsyncButton } from 'shared';
import Router from '../helpers/router';
import BackButton from './buttons/back-button';

@observer
export default class ChangeStudentId extends React.PureComponent {

  static propTypes = {
    courseId: React.PropTypes.string,
  }

  static contextTypes = {
    router: React.PropTypes.object,
  }

  courseId = Router.currentParams().courseId;
  student = Courses.get(this.courseId).userStudentRecord;

  @observable isSaved = false;
  @observable isValid = true;

  @action.bound
  onChange(ev) {
    this.student.student_identifier = ev.target.value;
  }

  @action.bound
  onSubmit() {
    this.student.student_identifier = this.input.value;
    this.student.saveOwnStudentId().then(this.onSaved);
  }

  @action.bound
  onSaved() {
    this.isSaved = true;
  }

  @action.bound
  goToDashboard() {
    this.context.router.history.push(Router.makePathname('dashboard', { courseId: this.courseId }));
  }

  @action.bound
  checkValidity(ev) {
    this.isValid = !isEmpty(ev.target.value);
  }

  renderSuccess() {
    return (
      <Modal.Dialog
        className="change-student-id"
        backdropClassName="change-student-id"
      >
        <Modal.Body>
          <h3>You have successfully updated your student ID.</h3>
        </Modal.Body>
        <Modal.Footer>
          <BackButton fallbackLink={{
            to: 'dashboard', text: 'Back to Dashboard', params: { courseId: this.courseId },
          }} />
        </Modal.Footer>
      </Modal.Dialog>
    );
  }

  renderWarning() {
    return <div className="invalid-warning">An ID is required for credit. You have not yet entered an ID</div>;
  }

  render() {
    if (this.isSaved) { return this.renderSuccess(); }

    return (
      <Modal.Dialog
        className="change-student-id"
        backdropClassName="change-student-id"
      >
        <Modal.Body>
          <div className="title">
            <h3>Update your student ID</h3>
          </div>
          <ControlLabel className="id-number-body">
            <div className="sub-title">Enter your school-issued student ID number *</div>
            <div className="inputs">

              <span className="student-id-icon"></span>
              <input
                autoFocus
                onKeyUp={this.checkValidity}
                ref={i => (this.input = i)}
                placeholder='School issued ID'
                defaultValue={this.student.student_identifier}
              />
            </div>
          </ControlLabel>
          {this.isValid ? null : this.renderWarning()}
          <div className="required">* required for course credit</div>
        </Modal.Body>
        <Modal.Footer>
          <AsyncButton
            disabled={!this.isValid}
            bsStyle="primary"
            className="btn btn-success"
            isWaiting={!!this.student.api.isPending}
            waitingText={'Confirming…'}
            onClick={this.onSubmit}
          >
            Save
          </AsyncButton>
          <Button className="cancel" bsStyle="link" onClick={this.goToDashboard}>Cancel</Button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}
