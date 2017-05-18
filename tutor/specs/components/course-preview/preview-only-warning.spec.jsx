import { Wrapper, SnapShot } from '../helpers/component-testing';
import PreviewOnlyWarning from '../../../src/components/course-preview/preview-only-warning';
import CoursePreviewUX from '../../../src/models/course/preview-ux';
import EnzymeContext from '../helpers/enzyme-context';

describe('Preview Only Warning', () => {

  let ux;
  beforeEach(() => {
    ux = new CoursePreviewUX({});
  });

  it('renders and matches snapshot', () => {
    expect(SnapShot.create(
      <Wrapper _wrapped_component={PreviewOnlyWarning} ux={ux} />).toJSON()
    ).toMatchSnapshot();
  });

  it('dismisses on continue', () => {
    const warning = shallow(<PreviewOnlyWarning ux={ux} />);
    expect(ux.isDismissed).toBe(false);
    warning.find('Button[bsStyle="default"]').simulate('click');
    expect(ux.isDismissed).toBe(true);
  });

  it('navigates on add', () => {
    const context =  EnzymeContext.build();
    const warning = shallow(<PreviewOnlyWarning ux={ux} />, context);
    warning.find('Button[bsStyle="primary"]').simulate('click');
    expect(context.context.router.transitionTo).to.have.been.calledWith('/new-course');
  });

});
