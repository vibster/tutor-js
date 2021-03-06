import React from 'react';

import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { Popover, OverlayTrigger } from 'react-bootstrap';

// NOTE: this selector must be kept in sync with CNX as well as
// the style in components/reference-book/page.less
@observer
class TeacherContentToggle extends React.Component {

  static propTypes = {
    ux:  React.PropTypes.object.isRequired,
  };

  renderNoContentTooltip = () => {
    return (
      <Popover id="no-content">
        No teacher edition content is available for this page.
      </Popover>
    );
  };

  render() {
    const { ux } = this.props;

    const teacherLinkText = ux.isShowingTeacherContent ?
      'Hide Teacher Edition' : 'Show Teacher Edition';

    if (ux.hasTeacherContent) {
      return (
        <button
          className="teacher-content-toggle has-content"
          onClick={ux.toggleTeacherContent}
        >
          {teacherLinkText}
        </button>
      );
    } else {
      return (
        <OverlayTrigger
          placement="bottom"
          trigger="click"
          overlay={this.renderNoContentTooltip()}
        >
          <span className="no-content teacher-content-toggle">
            {teacherLinkText}
          </span>
        </OverlayTrigger>
      );
    }
  }
}


export default TeacherContentToggle;
