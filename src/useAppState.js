import { assign, find, remove, sumBy, uniqueId } from 'lodash';

import generatePlanetName from './generators/generatePlanetName';
import createAppState from './utils/createAppState';
import getDistanceBetweenTiles from './utils/getDistanceBetweenTiles';

const initialState = {
  ship: {
    x: 2,
    y: 2,
    actionsBase: 1,
    combatBase: 0,
    speedBase: 1,
    actionsLeft: 0,
    movesLeft: 0,
    cards: [
      { id: 1, name: 'Nitrous Injector', speed: 1, location: 'ship' },
      { id: 2, name: 'Basic Blasters', combat: 1, location: 'ship' },
      { id: 3, name: 'Deringo Flatblaster', actions: 1, location: 'ship' },
    ],
  },
  graveyard: [],
};

const removeCard = (from, { id }) => {
  const [card] = remove(from.cards, (card) => card.id === id);

  if (card && card.speed) {
    // Subtract card speed but don't drop below zero.
    from.movesLeft = Math.max(0, from.movesLeft - card.speed);
  }

  return card;
};

const getShipTileFromState = ({ tiles, ship }) => {
  const { x, y } = ship;
  return find(tiles, { x, y });
};

const mutators = {
  destroyShipCard: (state, card) => {
    removeCard(state.ship, card);
  },
  dropShipCard: (state, card) => {
    const removedCard = removeCard(state.ship, card);

    const tile = getShipTileFromState(state);
    if (tile) {
      tile.cards.push(removedCard);
    }
  },
  focusHex: (state, tile) => {
    state.focusedTile = tile;
  },
  generateMap: (state) => {
    const tiles = [];

    for (let x = 0; x < 9; x += 1) {
      for (let y = 0; y < 7; y += 1) {
        tiles.push({
          id: uniqueId(),
          x,
          y,
          cards: [],
          name: generatePlanetName(),
        });
      }
    }

    state.tiles = tiles;
  },
  // moveCard: (state, card, from, to) => {
  //   remove(from.cards, card);
  //   to.cards.push(card);
  // },
  moveShipToSelectedTile: (state) => {
    const { x, y } = state.selectedTile;
    const movesLeft = state.ship.movesLeft - getDistanceBetweenTiles(state.ship, state.selectedTile);
    assign(state.ship, { x, y, movesLeft });
  },
  // moveShipToTile: (state, tile) => {
  //   const { x, y } = tile;
  //   const movesLeft = state.ship.movesLeft - getDistanceBetweenTiles(state.ship, tile);
  //   assign(state.ship, { x, y, movesLeft });
  // },
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
  startTurn: (state) => {
    state.ship.actionsLeft = getStat(state.ship, 'actions');
    state.ship.movesLeft = getStat(state.ship, 'speed');
  },
};

export const [AppStateProvider, useUnderlyingAppState] = createAppState(initialState, mutators);

const getStat = (ship, stat) => {
  return ship[`${stat}Base`] + sumBy(ship.cards, stat);
};

export const useAppState = () => {
  const [{ ship, ...restState}, actions] = useUnderlyingAppState();

  return [{
    ship: {
      ...ship,
      actions: getStat(ship, 'actions'),
      combat: getStat(ship, 'combat'),
      speed: getStat(ship, 'speed'),
    },
    ...restState,
  }, actions]
};

export default useAppState;
