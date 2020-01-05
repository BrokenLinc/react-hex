import { flow, join, map } from 'lodash/fp';

const pointsToString = flow(
  map(join(',')),
  join(' ')
);

export default pointsToString;
