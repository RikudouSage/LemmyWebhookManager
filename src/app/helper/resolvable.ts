import {from, lastValueFrom, Observable, of} from "rxjs";

export type Resolvable<T> = Observable<T> | Promise<T> | T;

export function toPromise<T>(resolvable: Resolvable<T>): Promise<T> {
  if (resolvable instanceof Promise) {
    return resolvable;
  }
  if (resolvable instanceof Observable) {
    return lastValueFrom(resolvable);
  }

  return Promise.resolve(resolvable);
}

export function toObservable<T>(resolvable: Resolvable<T>): Observable<T> {
  if (resolvable instanceof Observable) {
    return resolvable;
  }
  if (resolvable instanceof Promise) {
    return from(resolvable);
  }

  return of(resolvable);
}
