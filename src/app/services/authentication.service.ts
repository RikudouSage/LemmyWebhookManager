import {Injectable, signal, Signal} from '@angular/core';
import {ApiService} from "./api.service";
import {toPromise} from "../helper/resolvable";
import {CredentialsResponse} from "../helper/http-types";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private initialCheckComplete = false;

  private readonly storageKey = 'app_password';
  private readonly _loggedInSignal = signal(false);
  private readonly _isAdmin = signal(false);

  constructor(
    private readonly api: ApiService,
  ) {
  }

  public get loggedIn(): Signal<boolean> {
    return this._loggedInSignal;
  }

  public get isAdmin(): Signal<boolean> {
    return this._isAdmin;
  }

  public get apiKey(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const item = localStorage.getItem(this.storageKey);
    if (item === null) {
      return null;
    }

    return (<CredentialsResponse>JSON.parse(item)).token;
  }

  public async checkCredentials(): Promise<boolean> {
    if (this.initialCheckComplete) {
      return this.loggedIn();
    }
    this.initialCheckComplete = true;
    const apiKey = this.apiKey;
    if (apiKey === null) {
      return this.loggedIn();
    }
    const result = await toPromise(this.api.checkCredentials(apiKey));
    this._loggedInSignal.set(result);
    if (result) {
      const flags = await toPromise(this.api.flags());
      this._isAdmin.set(flags.admin ?? false);
    }

    return result;
  }

  public async logIn(username: string, password: string): Promise<boolean> {
    try {
      const result = await toPromise(this.api.logIn(username, password));
      localStorage.setItem(this.storageKey, JSON.stringify(result));
      this._loggedInSignal.set(true);
      const flags = await toPromise(this.api.flags());
      this._isAdmin.set(flags.admin ?? false);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async logout(): Promise<void> {
    localStorage.removeItem(this.storageKey);
    this._loggedInSignal.set(false);
  }
}
