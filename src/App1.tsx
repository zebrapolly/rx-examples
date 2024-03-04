import React, {useEffect, useMemo, useState} from 'react';
import logo from './logo.svg';
import './App.css';
import {Observable, interval, filter, throttleTime, scan} from "rxjs";
import internal from "node:stream";


function useSubscription<T>(
    source: Observable<T>,
    nextHandler: (value: T) => void
) {
  useEffect(() => {
    if (source) {
      const subs = source.subscribe({
        next: nextHandler
      });
      return () => subs.unsubscribe();
    }
  }, [source]);
}


function App() {
  const [counter, setCounter] = useState(0);

  const source = useMemo(
      () => interval(1000)
          .pipe(
              throttleTime(1000),
              scan((count) => count + 1, 0)
          )
  , []);

  useSubscription(source, (n) => setCounter(n))

  return (
    <div className="App">
      {counter}
    </div>
  );
}

export default App;
