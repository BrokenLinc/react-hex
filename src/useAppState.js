import createAppState from './utils/createAppState';

const initialState = {
};

const mutators = {
  focusHex: (state, id) => {
    state.focusedHex = id;
  },
  generateMap: (state) => {
    const map = [];

    for (let x = 0; x < 5; x += 1) {
      for (let y = 0; y < 5; y += 1) {
        map.push({ x, y });
      }
    }

    state.map = map;
  },
  selectFocusedHex: (state) => {
    if (state.focusedHex) {
      state.selectedHexId = state.focusedHex;
    }
  },
  setMapPanning: (state, mapPanning) => {
    delete state.focusedHex;
    state.mapPanning = mapPanning;
  },
  setMapZooming: (state, mapZooming) => {
    delete state.focusedHex;
    state.mapZooming = mapZooming;
  },
};

export const [AppStateProvider, useAppState] = createAppState(initialState, mutators);
export default useAppState;
