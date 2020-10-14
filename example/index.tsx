import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RoomServiceProvider, useMap } from '../.';

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

const Wrapper = () => {
  return (
    <div>
      <RoomServiceProvider
        clientParameters={{ auth: 'http://localhost:3002/roomservice' }}
      >
        <MapDemo />
      </RoomServiceProvider>
    </div>
  );
};

ReactDOM.render(<Wrapper />, document.getElementById('root'));
