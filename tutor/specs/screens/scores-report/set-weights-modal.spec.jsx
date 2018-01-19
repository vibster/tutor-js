import { React, SnapShot, Wrapper } from '../../components/helpers/component-testing';
import { each, pick } from 'lodash';
import bootstrapScores from '../../helpers/scores-data.js';
import UX from '../../../src/screens/scores-report/ux';
import SetWeightsModal from '../../../src/screens/scores-report/set-weights-modal';
import EnzymeContext from '../../components/helpers/enzyme-context';
import { wrapModalContents } from '../../helpers/modal-wrapper';

describe('Scores Report: set weights modal', () => {

  let props, modal, ux;

  beforeEach(() => {
    const { course } = bootstrapScores();
    ux = new UX(course);
    props = { ux };
    props.ux.weights.onSetClick();
    modal = wrapModalContents(
      mount(<SetWeightsModal {...props} />, EnzymeContext.build()),
    );
  });

  it('renders and matches snapshot', () => {
    expect(modal.html()).toMatchSnapshot();
  });

  it('sets values to error when not matching 100%', () => {
    expect(modal.find('input').map(i => i.props().value)).toEqual([80, 15, 5, 0]);
    modal.find('input[name="homework_scores"]').first().simulate('change', { target: {
      name: 'homework_scores',
      value: '100',
    } });
    expect(modal).toHaveRendered('.valid-msg.invalid');
  });

  it('can save weights', () => {
    each({
      homework_scores: 50,
      homework_progress: 15,
      reading_scores: 10,
      reading_progress: 25,
    }, (value, name) => {
      modal.find('input[name="homework_scores"]').first().simulate('change', { target: {
        name, value,
      } });
    });
    expect(ux.weights.isValid).toBe(true);
    modal.find('Button').first().simulate('click');
    // TODO test save fires
    // console.log(modal.debug())

  });

});
