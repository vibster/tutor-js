import { ExercisesMap as Exercises } from '../../src/models/exercises';
import Factory, { FactoryBot } from '../factories';
import { sampleSize, keys, forEach } from 'lodash';

describe('Exercises Map', () => {
  let book, exercises, page_ids;

  beforeEach(() => {
    book = Factory.book();
    exercises = new Exercises();
    page_ids = sampleSize(book.pages.byId.keys(), 3);
  });

  it('collects important tag info', () => {
    const exercise = Factory.tutorExercise();
    expect(exercise.tags.importantInfo).toEqual({
      section: '', lo: 'lo:stax-phys:1-2-1', tagString: [ 'blooms:3', 'dok:3' ],
    });
  });

  it('filters', () => {
    exercises = Factory.exercisesMap({ book, pageIds: page_ids });
    const ex = exercises.array[0];
    expect(ex.isAssignable).toBe(true);
    ex.pool_types = ['homework_core'];

    expect(exercises.assignableHomework.array).toContain(ex);
    ex.is_excluded = true;
    expect(exercises.assignableHomework.array).not.toContain(ex);

    ex.pool_types = ['reading_dynamic'];
    expect(exercises.reading.array).toContain(ex);
    expect(exercises.homework.array).not.toContain(ex);
    expect(exercises.assignableHomework.array).not.toContain(ex);

    ex.pool_types = ['homework_core'];
    expect(exercises.homework.array).toContain(ex);
    expect(exercises.reading.array).not.toContain(ex);

    ex.is_excluded = false;
    expect(exercises.assignableHomework.array).toContain(ex);
  });

  it('can be loaded and group by page', () => {
    page_ids.forEach(page_id => { expect(exercises.isFetching({ book, page_id })).toBe(false); });

    expect(
      exercises.fetch({ book, page_ids })
    ).toEqual({ url: `ecosystems/${book.id}/exercises`, query: { page_ids } });

    page_ids.forEach(page_id => { expect(exercises.isFetching({ book, page_id })).toBe(true); });

    const items = page_ids.map(page_id =>
      FactoryBot.create('TutorExercise', { page_uuid: book.pages.byId.get(page_id).uuid }),
    );

    exercises.onLoaded({ data: { items } }, [{ book, page_ids }]);

    page_ids.forEach(page_id => { expect(exercises.isFetching({ book, page_id })).toBe(false); });
    page_ids.forEach(page_id => { expect(exercises.hasFetched({ book, page_id })).toBe(true); });

    expect(keys(exercises.byPageId).sort()).toEqual( page_ids.sort() );
    forEach(exercises.byPageId, (exs, pageId) => {
      expect(exs).toHaveLength(1);
      expect(exs[0].page.id).toEqual(pageId);
    });

  });

  it('loads for course with optional limit', () => {
    page_ids.forEach(page_id => { expect(exercises.isFetching({ book, page_id })).toBe(false); });
    const course = Factory.course();
    expect(
      exercises.fetch({ course, page_ids })
    ).toEqual({ url: `courses/${course.id}/exercises/homework_core`, query: { page_ids } });
    expect(
      exercises.fetch({ course, page_ids, limit: 'reading-things' })
    ).toEqual({ url: `courses/${course.id}/exercises/reading-things`, query: { page_ids } });
    expect(
      exercises.fetch({ course, page_ids, limit: false })
    ).toEqual({ url: `courses/${course.id}/exercises`, query: { page_ids } });

  });

  it('can check if any page is loading', () => {
    exercises.fetch({ book, page_ids });
    expect(exercises.isFetching({ page_id: page_ids[0] })).toBe(true);
    expect(exercises.isFetching({ pageIds: [ 1011, 1023, 1034 ] })).toBe(false);
    expect(exercises.isFetching({ pageIds: [ 1011, 1023, 1034, page_ids[0] ] })).toBe(true);
  });

});
