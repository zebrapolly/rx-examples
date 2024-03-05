import {animationFrameScheduler, fromEvent, map, switchMap, takeUntil, subscribeOn} from "rxjs";
import {useEffect, useRef} from "react";

export function Dnd() {

    const elem = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (elem.current) {
            const mousedown$ = fromEvent<MouseEvent>(elem.current, 'mousedown');
            const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
            const mouseup$ = fromEvent<MouseEvent>(elem.current, 'mouseup');

            const drag$ = mousedown$.pipe(
                switchMap(
                    (start) => {
                        return mousemove$.pipe(map(move => {
                                move.preventDefault();
                                return {
                                    left: move.clientX - start.offsetX,
                                    top: move.clientY - start.offsetY
                                }
                            }),
                            takeUntil(mouseup$));
                    }));

            const position$ = drag$
                .pipe(subscribeOn(animationFrameScheduler))
                .subscribe(pos => {
                    if (elem.current) {
                        elem.current.style.top = `${pos.top}px`
                        elem.current.style.left = `${pos.left}px`
                    }
            });

            return () => {
                position$.unsubscribe();
            };
        }
    }, []);


    return <div className='draggable' ref={elem}></div>
}