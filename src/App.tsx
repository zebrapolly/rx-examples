import React, {useEffect, useMemo, useState} from 'react';
import './App.css';
import {
    BehaviorSubject,
    tap,
    debounceTime,
    map,
    switchMap,
    distinctUntilChanged,
    filter,
    from,
    toArray,
    mergeMap, catchError, EMPTY
} from "rxjs";
import {fromFetch} from "rxjs/internal/observable/dom/fetch";

function App() {
    const [input, setInput ] = useState('');
    const [searchResults, setSearchResults] = useState([])
    const userInput = useMemo(() => new BehaviorSubject(''), []);


    useEffect(() => {
      if(userInput) {

          const sub = userInput
              .pipe(
                  tap(e => setInput(e)),
                  filter(val => !!val.length),
                  debounceTime(1000),
                  distinctUntilChanged(),
                  switchMap(val =>
                      fromFetch(`/-/v1/search?text=${val}&size=20`),

                  ),
                  catchError(err => {
                      console.log(err)
                      return EMPTY;
                  }),
                  switchMap((response) => response.json()),
                  map(res => res.objects),
                  mergeMap(val => from(val).pipe(
                      // @ts-ignore
                      map(item => item.package.name),
                      toArray()
                  )),
              )
              // @ts-ignore
              .subscribe((res) => setSearchResults(res));
          return () => sub.unsubscribe();
      }
    }, [userInput]);

  return (
    <div className="App">
      <input
          type="text"
          onChange={(e) => userInput.next(e.target.value)}
          value={input}
      />
        {JSON.stringify(searchResults, null, 4)}
    </div>
  );
}

export default App;
