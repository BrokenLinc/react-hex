import yf from './yf';

// https://stackoverflow.com/questions/15919783/distance-between-2-hexagons-on-hexagon-grid
const getDistanceBetweenTiles = (tileA, tileB) => {
  if (tileA && tileB) {
    const du = tileB.x - tileA.x;
    const dv = yf(tileB) - yf(tileA);
    if ((du >= 0 && dv >= 0) || (du < 0 && dv < 0)) {
      return Math.max(Math.abs(du), Math.abs(dv))
    }
    return Math.abs(du) + Math.abs(dv);
  }
  return null;
};

export default getDistanceBetweenTiles;
