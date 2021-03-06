import React from 'react';
import { isEmpty, map } from 'lodash';
import { observer } from 'mobx-react';
import { observable, computed } from 'mobx';

import Progress from './progress';

export function ChaptersPerformance(props) {
  let chapters;
  const { currentPages, activeSection } = props;

  if (!isEmpty(currentPages)) {
    chapters = map(currentPages, (data, i) =>
      <Progress
        key={`chapter-performance-${data.id}-${i}`}
        data={data}
        type="chapter"
        index={i}
        activeSection={activeSection} />
    );
    chapters = <section>
      <label>
        Current Topics Performance
      </label>
      {chapters}
    </section>;
  }

  return (

    chapters || null

  );
}

ChaptersPerformance.displayName = 'ChaptersPerformance';

ChaptersPerformance.propTypes = {
  currentPages: React.PropTypes.object.isRequired,
  activeSection: React.PropTypes.string,
};


@observer
export class PracticesPerformance extends React.PureComponent {

  static propTypes = {
    spacedPages: React.PropTypes.object.isRequired,
    activeSection: React.PropTypes.string,
  };

  calculatePercentDelta = (a, b) => {
    let change, op;
    if (a > b) {
      change = a - b;
      op = '+';
    } else if (a === b) {
      change = 0;
      op = '';
    } else {
      change = b - a;
      op = '-';
    }
    return (
      op + ' ' + Math.round((change / b) * 100)
    );
  };

  renderPracticeBars = (data, i) => {
    let previous;
    const { activeSection } = this.props;

    if (data.previous_attempt) {
      previous =
        <div className="reading-progress-delta">
          {this.calculatePercentDelta(data.correct_count, data.previous_attempt.correct_count)}
          {'% change\
  '}
        </div>;
    }
    return (
      (
        <Progress
          key={`practice-performance-${data.id}-${i}`}
          data={data}
          type="practice"
          index={i}
          previous={previous}
          activeSection={activeSection} />
      )
    );
  };

  render() {
    let practices;
    const { spacedPages } = this.props;

    if (!isEmpty(spacedPages)) {
      practices = map(spacedPages, this.renderPracticeBars);
      practices = <section>
        <label>
          Spaced Practice Performance
        </label>
        {practices}
      </section>;
    }

    return (

      practices || null

    );
  }
}
