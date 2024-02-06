import {Injectable} from '@angular/core';
import {sleep} from "../helper/sleep";

export class Lock {
  constructor(
    public readonly name: string,
    private readonly freeCallable: (targetLock: string) => Promise<void>,
  ) {
  }

  public async free(): Promise<void> {
    await this.freeCallable(this.name);
  }
}

@Injectable({
  providedIn: 'root'
})
export class LockService {
  private locks: string[] = [];

  public async acquire(lock: string): Promise<Lock> {
    while (this.locks.includes(lock)) {
      await sleep(100);
    }
    this.locks.push(lock);
    return new Lock(lock, async targetLock => {
      this.locks = this.locks.filter(lock => lock !== targetLock);
    });
  }
}
