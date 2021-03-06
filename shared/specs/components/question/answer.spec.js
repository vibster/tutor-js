import Factories from '../../factories';
import Snapshot from 'react-test-renderer';
import Answer from '../../../src/components/question/answer';

jest.mock('../../../src/components/html', () => ({ className, html }) =>
  html ? <div className={className} dangerouslySetInnerHTML={{ __html: html }} /> : null
);

describe('Answer Component', function() {
  let props;
  let answer;

  beforeEach(() => {
    const exercise = Factories.exercise();
    answer = exercise.questions[0].answers[0];
    props = {
      answer,
      type: 'student',
      iter: 1,
      qid: answer.id,
      hasCorrectAnswer: false,
      onChangeAnswer: jest.fn(),
    };
  });

  it('renders answer', () => {
    const a = mount(<Answer {...props} />);
    expect(a).toHaveRendered('.openstax-answer');
    expect(Snapshot.create(<Answer {...props} />).toJSON()).toMatchSnapshot();
  });

  it('renders answer feedback based on props', () => {
    props.show_all_feedback = true;
    const a = mount(<Answer {...props} />);
    expect(a).toHaveRendered('.question-feedback-content');
    expect(Snapshot.create(<Answer {...props} />).toJSON()).toMatchSnapshot();
  });

});
