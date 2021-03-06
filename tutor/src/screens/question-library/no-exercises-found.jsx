import React from 'react';

export default function NoExercisesFound(props) {
  return (
    <div className="no-exercises">
      <h3>
        No exercises were found for the given sections or types.
      </h3>
      <p className="lead">
        Please select addtional sections and retry
      </p>
    </div>
  );
}
