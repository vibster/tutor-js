import { map } from 'lodash';
import Factories from '../../factories';

describe('Exercise Question', () => {
  let question;

  beforeEach(() => question = Factories.exercise().questions[0]);

  it('has an updatable format', () => {
    expect(map(question.formats, 'value')).toEqual(['free-response', 'multiple-choice']);
    question.setExclusiveFormat('true-false');
    expect(map(question.formats, 'value')).toEqual(['true-false']);
    question.setExclusiveFormat('multiple-choice');
    expect(map(question.formats, 'value')).toEqual(['multiple-choice', 'free-response']);
  });

  it('can toggle formats', () => {
    expect(map(question.formats, 'value')).toEqual(['free-response', 'multiple-choice']);
    question.toggleFormat('free-response', false);
    expect(map(question.formats, 'value')).toEqual(['multiple-choice']);
    question.toggleFormat('free-response', true);
    expect(map(question.formats, 'value')).toEqual(['multiple-choice', 'free-response']);
    question.toggleFormat('free-response', true);
    expect(map(question.formats, 'value')).toEqual(['multiple-choice', 'free-response']);
  });

  it('can move answers up/down', () => {
    const second = question.answers[1];
    question.moveAnswer(second, -1);
    expect(question.answers[0]).toBe(second);
    expect(() =>
      question.moveAnswer(second, -1)
    ).toThrow();

    const nextToLast = question.answers[question.answers.length - 2];
    question.moveAnswer(nextToLast, 1);
    expect(question.answers[question.answers.length - 1]).toBe(nextToLast);
    expect(() =>
      question.moveAnswer(nextToLast, 1)
    ).toThrow();
  });

  it('can serialize formats', () => {
    expect(question.serialize()).toMatchObject({
      formats: [ 'free-response', 'multiple-choice' ],
    });
  });

});
