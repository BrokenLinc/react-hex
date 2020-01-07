import { uniqueId } from 'lodash';

import createAppState from './utils/createAppState';

const initialState = {
};

const mutators = {
  focusHex: (state, tile) => {
    state.focusedTile = tile;
  },
  generateMap: (state) => {
    const map = [];

    for (let x = 0; x < 9; x += 1) {
      for (let y = 0; y < 7; y += 1) {
        map.push({
          id: uniqueId(),
          x,
          y,
          yf: y + Math.floor(x / 2), // facial adjacency
        });
      }
    }

    state.map = map;
  },
  selectFocusedHex: (state) => {
    if (state.focusedTile) {
      state.selectedTile = state.focusedTile;
    }
  },
  setMapPanning: (state, mapPanning) => {
    delete state.focusedTile;
    state.mapPanning = mapPanning;
  },
  setMapZooming: (state, mapZooming) => {
    delete state.focusedTile;
    state.mapZooming = mapZooming;
  },
};

export const [AppStateProvider, useAppState] = createAppState(initialState, mutators);
export default useAppState;
