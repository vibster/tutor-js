import React from 'react';
import ReactDOM from 'react-dom';

import { Navbar, Nav } from 'react-bootstrap';
import Router from '../../helpers/router';
import ToursReplay from './tours-replay';
import CourseName from './course-name';
import ServerErrorMonitoring from '../error-monitoring';
import UserActionsMenu from './user-actions-menu';
import BookLinks from './book-links';
import CenterControls from './center-controls';
import TutorLink from '../link';

import Courses from '../../models/courses-map';
import PreviewAddCourseBtn from './preview-add-course-btn';
import { action } from 'mobx';

export default class NavigationBar extends React.PureComponent {

  @action.bound
  collapseNav() {
    const navBar = ReactDOM.findDOMNode(this.navBar);
    const collapsibleNav = navBar.querySelector('div.navbar-collapse');
    const toggleBtn = navBar.querySelector('button.navbar-toggle');
    if (collapsibleNav.classList.contains('in')) { toggleBtn.click(); }
  }

  render() {
    const params = Router.currentParams();
    const { courseId } = params;
    const course = courseId ? Courses.get(courseId) : null;

    return (
      <nav
        className="tutor-top-navbar"
        ref={nb => (this.navBar = nb)}
      >
        <div className="left-side-controls">
          <TutorLink to="listing" className="brand">
            <i className="ui-brand-logo" />
          </TutorLink>
          <CourseName course={course} />
          <BookLinks courseId={courseId} onItemClick={this.collapseNav} />
        </div>
        <CenterControls params={params} />
        <div className="right-side-controls">
          <PreviewAddCourseBtn courseId={courseId} />
          <ToursReplay />
          <UserActionsMenu
            courseId={courseId}
          />
        </div>
        <ServerErrorMonitoring />
      </nav>
    );
  }
}
