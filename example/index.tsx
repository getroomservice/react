import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RoomServiceProvider, useMap, usePresence } from '../.';

const MapDemo = () => {
  const [map, setMap] = useMap<any>('room', 'map');
  if (!map) return null;

  function onChange(key, e) {
    if (!map) return;
    setMap(map.set(key, e.target.value));
  }

  return (
    <div>
      <label>
        A <input value={map.get('a') || ''} onChange={e => onChange('a', e)} />
        B <input value={map.get('b') || ''} onChange={e => onChange('b', e)} />
        C <input value={map.get('c') || ''} onChange={e => onChange('c', e)} />
      </label>
    </div>
  );
};

const useInterval = (callback, delay) => {
  const savedCallback = React.useRef() as any;

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

const PresenceDemo = () => {
  const [first, setFirst] = usePresence('room', 'positions1');
  const [second, setSecond] = usePresence('room', 'positions2');

  useInterval(() => {
    setFirst(new Date().toTimeString());
    setSecond(new Date().toTimeString());
  }, 1000);

  return (
    <div>
      <p>{JSON.stringify(first)}</p>
      <p>{JSON.stringify(second)}</p>
    </div>
  );
};

const Wrapper = () => {
  return (
    <div>
      <RoomServiceProvider
        clientParameters={{ auth: 'http://localhost:3002/roomservice' }}
      >
        <MapDemo />
        <PresenceDemo />
      </RoomServiceProvider>
    </div>
  );
};

ReactDOM.render(<Wrapper />, document.getElementById('root'));
