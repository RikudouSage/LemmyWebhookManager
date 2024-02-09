import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {catchError, map, Observable, of} from "rxjs";
import {
  CredentialsResponse,
  FlagsResponse,
  RestCollectionResponse,
  RestDetailResponse, Scope, ScopeDetailList, User,
  Webhook, WebhookCreateData, WebhookResponse, WebhookUpdateData
} from "../helper/http-types";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private readonly httpClient: HttpClient,
  ) {
  }

  public checkCredentials(apiKey: string): Observable<boolean> {
    return this.httpClient.get(environment.apiUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  public logIn(username: string, password: string): Observable<CredentialsResponse> {
    return this.httpClient.post<CredentialsResponse>(`${environment.apiUrl}/auth/login`, {
      username: username,
      password: password,
    });
  }

  public flags(): Observable<FlagsResponse> {
    return this.httpClient.get<FlagsResponse>(`${environment.apiUrl}/flags`);
  }

  public webhooks(page: number = 1): Observable<RestCollectionResponse<Webhook, never>> {
    return this.httpClient.get<RestCollectionResponse<Webhook, never>>(`${environment.apiUrl}/rest/webhooks?page=${page}`);
  }

  public webhook(id: number): Observable<RestDetailResponse<Webhook>> {
    return this.httpClient.get<RestDetailResponse<Webhook>>(`${environment.apiUrl}/rest/webhooks/${id}`);
  }

  public updateWebhook(id: number, data: WebhookUpdateData): Observable<RestDetailResponse<Webhook>> {
    data.type = 'webhooks';
    return this.httpClient.patch<RestDetailResponse<Webhook>>(`${environment.apiUrl}/rest/webhooks/${id}`, {
      data: data,
    });
  }

  public createWebhook(data: WebhookCreateData): Observable<RestDetailResponse<Webhook>> {
    data.type = 'webhooks';

    return this.httpClient.post<RestDetailResponse<Webhook>>(`${environment.apiUrl}/rest/webhooks`, {
      data: data,
    });
  }

  public deleteWebhook(id: number): Observable<boolean> {
    return this.httpClient.delete(`${environment.apiUrl}/rest/webhooks/${id}`).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  public get scopeList(): Observable<ScopeDetailList> {
    return this.httpClient.get<ScopeDetailList>(`${environment.apiUrl}/auth/scopes`);
  }

  public get availableScopes(): Observable<string[]> {
    return this.scopeList.pipe(
      map(
        result => result
          .filter(scope => scope.granted)
          .map(scope => scope.scope),
      ),
    );
  }

  public get currentUser(): Observable<RestDetailResponse<User>> {
    return this.httpClient.get<RestDetailResponse<User>>(`${environment.apiUrl}/rest/users/me`);
  }

  public users(page: number = 1): Observable<RestCollectionResponse<User, Scope>> {
    return this.httpClient.get<RestCollectionResponse<User, Scope>>(`${environment.apiUrl}/rest/users?page=${page}&include=scopes`);
  }

  public usersToApprove(page: number = 1): Observable<RestCollectionResponse<User, Scope>> {
    return this.httpClient.get<RestCollectionResponse<User, Scope>>(`${environment.apiUrl}/rest/users?page=${page}&include=scopes&filter[enabled]=0`);
  }

  public scopesToApprove(): Observable<RestCollectionResponse<Scope, User>> {
    return this.httpClient.get<RestCollectionResponse<Scope, User>>(`${environment.apiUrl}/rest/scopes?limit=-1&filter[granted]=0&include=user`);
  }

  public deleteUser(id: number): Observable<boolean> {
    return this.httpClient.delete(`${environment.apiUrl}/rest/users/${id}`).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  public registerAccount(username: string, password: string, scopes: string[] = []): Observable<boolean> {
    return this.httpClient.post(`${environment.apiUrl}/auth/register`, {
      username: username,
      password: password,
      scopes: scopes,
    }, {observe: 'response'}).pipe(
      map(response => response.status === 201),
      catchError(() => of(false)),
    );
  }

  public approveUser(user: User): Observable<boolean> {
    return this.httpClient.patch<RestDetailResponse<User>>(`${environment.apiUrl}/rest/users/${user.id}`, {
      data: {
        type: 'users',
        id: user.id,
        attributes: {
          enabled: true,
        },
      },
    }).pipe(
      map(user => user.data.attributes.enabled),
      catchError(() => of(false)),
    );
  }

  public rejectUser(user: User): Observable<boolean> {
    return this.httpClient.delete<void>(`${environment.apiUrl}/rest/users/${user.id}`).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  public approveScope(scope: Scope): Observable<boolean> {
    return this.httpClient.patch<RestDetailResponse<Scope>>(`${environment.apiUrl}/rest/scopes/${scope.id}`, {
      data: {
        type: 'scopes',
        id: scope.id,
        attributes: {
          granted: true,
        },
      },
    }).pipe(
      map(scope => scope.data.attributes.granted),
      catchError(() => of(false)),
    );
  }

  public rejectScope(scope: Scope): Observable<boolean> {
    return this.httpClient.delete<void>(`${environment.apiUrl}/rest/scopes/${scope.id}`).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  public getLogs(webhookId: number): Observable<WebhookResponse[]> {
    return this.httpClient.get<RestCollectionResponse<WebhookResponse, void>>(
      `${environment.apiUrl}/rest/webhook-responses?filter[webhook]=${webhookId}&sort=-created`
    ).pipe(
      map(response => response.data),
    );
  }

  public importWebhooks(configuration: string): Observable<boolean> {
    return this.httpClient.post<void>(`${environment.apiUrl}/api/webhooks/import`, {
      configuration: configuration,
    }).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  public askForScope(scope: string): Observable<boolean | null> {
    return this.httpClient.post<void>(`${environment.apiUrl}/auth/scopes`, {
      scope: scope,
    }, {
      observe: 'response',
    }).pipe(
      map(response => response.status >= 200 && response.status < 300),
      catchError(e => {
        const status = (<HttpErrorResponse>e).status;
        switch (status) {
          case 409:
            return of(null);
          default:
            return of(false);
        }
      }),
    );
  }
}
