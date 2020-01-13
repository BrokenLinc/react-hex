import React from 'react';
import { map, times } from 'lodash';
import cn from 'classnames';
import panzoom from 'panzoom';

import './App.less';
import { AppStateProvider, useAppState } from './useAppState';
import Button from './components/Button';
import getDistanceBetweenTiles from './utils/getDistanceBetweenTiles';
import pointsToString from './utils/pointsToString';
import yf from './utils/yf';

const HEX_DIAMETER = 200;

const pointAtFractionedAngle = (fraction, diameter) => [
  Math.cos(Math.PI * 2 * fraction) * diameter,
  Math.sin(Math.PI * 2 * fraction) * diameter,
];

const EquilateralPolygon = (props) => {
  const { points, radius, transform, ...restProps } = props;

  const pointsArray = times(points, (n) => {
    return pointAtFractionedAngle(n / points, radius);
  });

  return (
    <g transform={transform}>
      <polygon
        {...restProps}
        points={pointsToString(pointsArray)}
      />
    </g>
  );
};

const p = pointAtFractionedAngle(1 / 6, HEX_DIAMETER);
const offset = {
  x: p[0] * 1.5,
  y: p[1],
};

const getGridOffsets = ({ x, y }) => {
  return {
    x: x * offset.x,
    y: (y - (x % 2) / 2) * offset.y,
  }
};

const getGridTranslation = (tile, xOffset = 0, yOffset = 0) => {
  const { x, y } = getGridOffsets(tile);
  return `translate(${x + xOffset} ${y + yOffset})`;
};

const useTileInfo = (tile) => {
  const [{ selectedTile, ship }] = useAppState();

  if (!tile) return {};

  const distanceToSelectedTile = getDistanceBetweenTiles(tile, selectedTile);
  const distanceToShip = getDistanceBetweenTiles(tile, ship);
  const isShipHere = (ship.x === tile.x && ship.y === tile.y);
  const canMoveShipHere = distanceToShip <= ship.movesLeft && !isShipHere;
  const isSelected = !!selectedTile && (tile.id === selectedTile.id);

  return {
    canMoveShipHere,
    distanceToSelectedTile,
    distanceToShip,
    isSelected,
    isShipHere,
  };
};

const HexTile = (props) => {
  const { tile, ...restProps } = props;

  const [isHovered, setHovered] = React.useState(false);
  const [, actions] = useAppState();
  const tileInfo = useTileInfo(tile);

  const classname = cn('hex-tile', {
    'is-hovered' : isHovered,
    'is-selected': tileInfo.isSelected,
  });

  return (
    <g className={classname} {...restProps}>
      {/*<circle r={20} fill="#c82" stroke="#b51" strokeWidth={3} />*/}
      <EquilateralPolygon
        className="hex"
        radius={(HEX_DIAMETER - 8) / 2}
        points={6}
      />
      {/*<text>{tileInfo.distanceToSelectedTile}</text>*/}
      <EquilateralPolygon
        onMouseDown={() => actions.focusHex(tile)}
        onMouseUp={() => actions.selectFocusedHex()}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
        fill="rgba(0,0,0,0)"
        radius={HEX_DIAMETER / 2}
        points={6}
      />
    </g>
  );
};

const useSvgPanzoom = () => {
  const svgRef = React.useRef();
  const svgPanzoomRef = React.useRef();
  const [, actions] = useAppState();

  React.useEffect(() => {
    svgPanzoomRef.current = panzoom(svgRef.current);
    svgPanzoomRef.current.on('panstart', () => {
      actions.setMapPanning(true);
    });
    svgPanzoomRef.current.on('panend', () => {
      actions.setMapPanning(false);
    });
    svgPanzoomRef.current.on('zoomStart', () => {
      actions.setMapZooming(true);
    });
    svgPanzoomRef.current.on('zoomend', () => {
      actions.setMapZooming(false);
    });
  }, [actions]);

  return svgRef;
};

const RangeTile = (props) => {
  const { tile } = props;
  const tileInfo = useTileInfo(tile);

  if (!tileInfo.canMoveShipHere) {
    return null;
  }

  return (
    <EquilateralPolygon
      fill="rgba(0, 100, 200, 1)"
      transform={getGridTranslation(tile)}
      radius={HEX_DIAMETER / 2}
      points={6}
    />
  );
};

const OutlineFilter = () => (
  <filter id="outline">
    <feMorphology operator="dilate" radius="2" in="SourceGraphic" result="THICKNESS" />
    <feComposite operator="out" in="THICKNESS" in2="SourceGraphic" result="OUTLINE" />
    <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="1" result="TURBULENCE" />
    <feDisplacementMap in="OUTLINE" in2="turbulence" scale="10" xChannelSelector="R" yChannelSelector="G" />
  </filter>
);
OutlineFilter.applyProps = { filter: 'url(#outline)' };

const Map = () => {
  const [{ ship, tiles }] = useAppState();
  const svgRef = useSvgPanzoom();

  return (
    <svg id="svg-viewport" className="fill focus-none cursor-pointer">
      <defs>
        <OutlineFilter />
      </defs>
      <g ref={svgRef}>
        {map(tiles, (tile) => (
          <HexTile
            key={tile.id}
            tile={tile}
            transform={getGridTranslation(tile)}
          />
        ))}
        <circle
          className="ship pointer-events-none"
          r={15}
          fill="white"
          stroke="red"
          strokeWidth={3}
          transform={getGridTranslation(ship, 30, 30)}
        />

        <g {...OutlineFilter.applyProps} className="pointer-events-none">
          {map(tiles, (tile) => (
            <RangeTile key={tile.id} tile={tile}/>
          ))}
        </g>
      </g>
    </svg>
  );
};

const TileInfo = () => {
  const [{ selectedTile: tile }, actions] = useAppState();
  const tileInfo = useTileInfo(tile);

  return !!tile && (
    <div className="p-content">
      <h1>{tile.name}</h1>
      {/*<p>x: {tile.x}</p>*/}
      {/*<p>y: {tile.y}</p>*/}
      {/*<p>yf: {yf(tile)}</p>*/}
      {tileInfo.canMoveShipHere && (
        <Button onClick={actions.moveShipToSelectedTile}>Move ship here</Button>
      )}
      <h2>Cards</h2>
      <div className="row">
        <CardList cards={tile.cards} />
      </div>
    </div>
  );
};

const sign = (value) => {
  const number = value || 0;
  return number >= 0 ? `+${number}` : number;
};

const CardList = (props) => {
  const { cards, onDropClick } = props;

  return map(cards, (card) => {
    return (
      <div className="card">
        <h4>{card.name}</h4>
        {!!card.speed && (
          <div>
            {sign(card.speed)} Moves
          </div>
        )}
        {!!card.actions && (
          <div>
            {sign(card.actions)} Actions
          </div>
        )}
        {!!card.combat && (
          <div>
            {sign(card.combat)} Combat
          </div>
        )}
        {onDropClick && (
          <Button onClick={() => onDropClick(card)}>Drop</Button>
        )}
      </div>
    );
  });
};

const ShipInfo = () => {
  const [{ ship }, actions] = useAppState();

  return (
    <div className="p-content">
      <h1>Your Ship</h1>
      <p>Moves: {ship.movesLeft} / {ship.speed}</p>
      <p>Actions: {ship.actionsLeft} / {ship.actions}</p>
      <p>Combat: {ship.combat}</p>
      <br />
      <h2>Cards</h2>
      <div className="row">
        <CardList cards={ship.cards} onDropClick={actions.dropShipCard} />
      </div>
    </div>
  );
};

const App = () => {
  const [, actions] = useAppState();

  return (
    <div className="fill">
      <div className="grow row">
        <div className="grow shrink">
          <Map />
        </div>
      </div>
      <div className="bg-almost-black white">
        <TileInfo />
      </div>
      <div className="bg-almost-black white">
        <ShipInfo />
      </div>
      <div className="row p-content bg-dark-gray white">
        <Button onClick={actions.generateMap}>Generate Map</Button>
        <Button onClick={actions.startTurn}>New Turn</Button>
      </div>
    </div>
  );
};

const AppContainer = () => {
  return (
    <AppStateProvider>
      <App />
    </AppStateProvider>
  );
};

export default AppContainer;
