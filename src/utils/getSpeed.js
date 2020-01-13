import { sumBy } from 'lodash';

const getSpeed = (ship) => {
  return ship.baseSpeed + sumBy(ship.cards, 'speed');
};

export default getSpeed;
