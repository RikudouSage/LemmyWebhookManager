import { Injectable } from '@angular/core';
import {Title} from "@angular/platform-browser";
import {BehaviorSubject, Observable} from "rxjs";
import {Resolvable, toPromise} from "../helper/resolvable";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly titleSubject: BehaviorSubject<string> = new BehaviorSubject<string>(environment.appTitle);

  constructor(
    private readonly angularTitle: Title,
  ) {}

  public get title(): string {
    return this.titleSubject.value;
  }

  public set title(title: Resolvable<string>) {
    toPromise(title).then(title => {
      this.angularTitle.setTitle(title);
      this.titleSubject.next(title);
    });
  }

  public get titleChanged(): Observable<string> {
    return this.titleSubject;
  }
}
