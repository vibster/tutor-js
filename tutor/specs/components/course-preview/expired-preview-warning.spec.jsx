import { Wrapper, SnapShot } from '../helpers/component-testing';
import ExpiredPreviewWarning from '../../../src/components/course-preview/expired-preview-warning';
import CoursePreviewUX from '../../../src/models/course/preview-ux';
import EnzymeContext from '../helpers/enzyme-context';

describe('Expired Preview Warning', () => {

  let ux;
  beforeEach(() => {
    ux = new CoursePreviewUX({});
  });

  it('renders and matches snapshot', () => {
    expect(SnapShot.create(
      <Wrapper _wrapped_component={ExpiredPreviewWarning} ux={ux} />).toJSON()
    ).toMatchSnapshot();
  });

  it('dislays got it and dismisses on continue', () => {
    const warning = shallow(<ExpiredPreviewWarning ux={ux} />);
    expect(ux.isDismissed).toBe(false);
    warning.find('Button[bsStyle="default"]').simulate('click');
    expect(ux.isDismissed).toBe(false);
    expect(warning.find('Body').render().text()).toContain('No problem');
    warning.find('Button[bsStyle="primary"]').simulate('click');
    expect(ux.isDismissed).toBe(true);
  });

  it('navigates on add', () => {
    const context =  EnzymeContext.build();
    const warning = shallow(<ExpiredPreviewWarning ux={ux} />, context);
    warning.find('Button[bsStyle="primary"]').simulate('click');
    expect(context.context.router.transitionTo).to.have.been.calledWith('/new-course');
  });

});
