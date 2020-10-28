import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RoomServiceProvider, useMap, usePresence } from '../.';

function Input(props: { name: string; map: string }) {
  const [map, setMap] = useMap<any>('room', props.map);
  const rerenders = React.useRef(0);
  rerenders.current++;
  if (!map) return null;

  function onChange(key, e) {
    if (!map) return;
    setMap(map.set(key, e.target.value));
  }

  return (
    <>
      <input
        value={map.get(props.name) || ''}
        onChange={e => onChange(props.name, e)}
      />{' '}
      {rerenders.current}
    </>
  );
}

const MapDemo = () => {
  return (
    <div>
      <label>
        <p>
          A <Input name="a" map="first" />
        </p>
        <p>
          B <Input name="b" map="second" />
        </p>
        <p>
          A <Input name="a" map="first" />
        </p>
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
