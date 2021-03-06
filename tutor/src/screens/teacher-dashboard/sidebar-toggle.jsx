import { React, observable, observer, action, cn } from '../../helpers/react';
import { Button } from 'react-bootstrap';
import Course from '../../models/course';
import Icon from '../../components/icon';
import CalendarHelper from './helper';

const OPEN_ICON = 'times';
const CLOSED_ICON = 'bars';

@observer
export default class CalendarSidebarToggle extends React.Component {

  static propTypes = {
    course: React.PropTypes.instanceOf(Course).isRequired,
    onToggle: React.PropTypes.func.isRequired,
    defaultOpen: React.PropTypes.bool,
  };

  static defaultProps = { defaultOpen: false };

  @observable isOpen = CalendarHelper.isSidebarOpen(this.props.course);
  @observable iconType = this.isOpen ? OPEN_ICON : CLOSED_ICON;
  @observable pendingIntroTimeout;

  componentWillMount() {
    if (this.isOpen) {
      this.props.onToggle(this.isOpen);
    } else {
      this.pendingIntroTimeout = CalendarHelper.scheduleIntroEvent(this.onToggle);
    }
  }

  componentWillUnmount() {
    CalendarHelper.clearScheduledEvent(this.pendingIntroTimeout);
  }

  @action.bound setIconType() {
    this.iconType = this.isOpen ? OPEN_ICON : CLOSED_ICON;
  }

  @action.bound onToggle() {
    const isOpen = !this.isOpen;
    CalendarHelper.setSidebarOpen(this.props.course, isOpen);
    CalendarHelper.clearScheduledEvent(this.pendingIntroTimeout);
    this.isOpen = isOpen;
    this.pendingIntroTimeout = false;
    this.props.onToggle(isOpen);
  }

  render() {
    return (
      <Button
        onTransitionEnd={this.setIconType}
        onClick={this.onToggle}
        className={cn('sidebar-toggle', { open: this.isOpen })}>
        <Icon type={this.iconType} />
        <span className="text">
          Add Assignment
        </span>
      </Button>
    );
  }
}
