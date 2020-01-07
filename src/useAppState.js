import { assign, uniqueId } from 'lodash';

import createAppState from './utils/createAppState';

const initialState = {
  ship: { x: 0, y: 0, speed: 1 },
};

const mutators = {
  focusHex: (state, tile) => {
    state.focusedTile = tile;
  },
  generateMap: (state) => {
    const map = [];

    for (let x = 0; x < 9; x += 1) {
      for (let y = 0; y < 7; y += 1) {
        map.push({ id: uniqueId(), x, y });
      }
    }

    state.map = map;
  },
  moveShipToTile: (state, tile) => {
    const { x, y } = tile;
    assign(state.ship, { x, y });
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
