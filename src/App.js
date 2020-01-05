import React from 'react';
import { map, times } from 'lodash';
import cn from 'classnames';
import panzoom from 'panzoom';

import './App.less';
import { AppStateProvider, useAppState } from './useAppState';
import Button from './components/Button';
import pointsToString from './utils/pointsToString';

const HEX_DIAMETER = 200;

const pointAtFractionedAngle = (fraction, diameter) => [
  Math.cos(Math.PI * 2 * fraction) * diameter,
  Math.sin(Math.PI * 2 * fraction) * diameter,
];

const EquilateralPolygon = (props) => {
  const { points, radius, ...restProps } = props;

  const pointsArray = times(points, (n) => {
    return pointAtFractionedAngle(n / points, radius);
  });

  return (
    <polygon
      {...restProps}
      points={pointsToString(pointsArray)}
    />
  );
};

const p = pointAtFractionedAngle(1 / 6, HEX_DIAMETER);
const offset = {
  x: p[0] * 1.5,
  y: p[1],
};

const getGridTranslation = (x, y) => {
  return `translate(${x * offset.x} ${(y + (x % 2) / 2) * offset.y})`;
};

const getKey = (...args) => args.join('_');

const HexTile = (props) => {
  const { id, ...restProps } = props;

  const [isHovered, setHovered] = React.useState(false);
  const [state, actions] = useAppState();

  const classname = cn('hex-tile', {
    'is-hovered' : isHovered,
    'is-selected': state.selectedHexId === id,
  });

  return (
    <g className={classname} {...restProps}>
      <circle r={20} fill="#c82" stroke="#b51" strokeWidth={3} />
      <EquilateralPolygon
        className="hex"
        radius={(HEX_DIAMETER - 4) / 2}
        points={6}
      />
      <EquilateralPolygon
        onMouseDown={() => actions.focusHex(id)}
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

const Map = () => {
  const svg = React.useRef();
  const svgPanzoom = React.useRef();
  const [state, actions] = useAppState();

  React.useEffect(() => {
    svgPanzoom.current = panzoom(svg.current);
    svgPanzoom.current.on('panstart', () => {
      actions.setMapPanning(true);
    });
    svgPanzoom.current.on('panend', () => {
      actions.setMapPanning(false);
    });
    svgPanzoom.current.on('zoomStart', () => {
      actions.setMapZooming(true);
    });
    svgPanzoom.current.on('zoomend', () => {
      actions.setMapZooming(false);
    });
  }, []);

  return (
    <svg id="svg-viewport" className="fill focus-none">
      <g ref={svg}>
        {map(state.map, ({ x, y }) => (
          <HexTile
          key={getKey(x, y)}
          id={getKey(x, y)}
          transform={getGridTranslation(x, y)}
          />
        ))}
      </g>
    </svg>
  );
};

const Information = () => {
  const [state] = useAppState();

  return (
    <h1>{state.selectedHexId}</h1>
  );
};

const App = () => {
  const [, actions] = useAppState();

  return (
    <div className="fill">
      <div className="row p-content bg-dark-gray">
        <Button onClick={actions.generateMap}>Generate Map</Button>
      </div>
      <div className="grow row">
        <div className="grow shrink">
          <Map />
        </div>
        <div className="bg-almost-black w-320px white">
          <Information />
        </div>
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
