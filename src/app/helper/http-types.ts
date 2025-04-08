import {HttpMethod} from "../enum/http-method";
import {DatabaseOperation} from "../enum/database-operation";
import {SigningMode} from "../enum/signing-mode.enum";

export interface CredentialsResponse {
  token: string;
  expires: string;
  refreshToken: string;
}

export interface FlagsResponse {
  registrations: boolean;
  admin?: boolean;
}

export interface LoggedInFlagsResponse extends FlagsResponse {
  admin: boolean;
}

interface EntityWithoutId {
  type: string;
  attributes: { [key: string]: any }
  relationships?: { [key: string]: any }
}

interface Entity extends EntityWithoutId {
  id: number;
}

export interface RestCollectionResponse<TData, TIncludes> {
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
  };
  data: TData[];
  included: TIncludes[];
}

export interface RestDetailResponse<T> {
  data: T;
}

interface WebhookAttributes {
  url: string;
  method: HttpMethod;
  bodyExpression: string | null;
  filterExpression: string | null;
  objectType: string;
  operation: DatabaseOperation;
  headers: { [header: string]: string } | null;
  enhancedFilter: string | null;
  enabled: boolean;
  logResponses: boolean;
  uniqueMachineName: string | null;
  signingMode: SigningMode;
  signingKey: string | null;
  retryOnFailure: boolean;
}

interface WebhookRelationships {
  user: {
    data: null | {
      type: 'user';
      id: number;
    };
  };
}

export interface Webhook extends Entity {
  type: 'webhook' | 'webhooks';
  attributes: WebhookAttributes;
  relationships: WebhookRelationships;
}

export interface WebhookCreateData extends EntityWithoutId {
  type: 'webhook' | 'webhooks';
  attributes: WebhookAttributes;
  relationships?: WebhookRelationships;
}

export interface WebhookUpdateData extends Entity {
  type: 'webhook' | 'webhooks';
  attributes: Partial<WebhookAttributes>
  relationships?: Partial<WebhookRelationships>;
}

export interface User extends Entity {
  attributes: {
    username: string;
    enabled: boolean;
  };
  relationships: {
    webhooks: {
      data: {
        type: 'webhook';
        id: number;
      }[];
    };
    scopes: {
      data: {
        type: 'scope';
        id: number;
      }[];
    };
  };
}

export interface Scope extends Entity {
  type: 'scope';
  attributes: {
    scope: string;
    granted: boolean;
  };
  relationships: {
    user: {
      data: {
        id: number;
        type: 'user';
      };
    };
  };
}

export interface WebhookResponse extends Entity {
  type: 'webhook-response';
  attributes: {
    statusCode: number;
    body: string | null;
    headers: {
      [header: string]: string[];
    };
    validUntil: string;
    created: string;
  };
  relationships: {
    webhook: {
      data: {
        id: number;
        type: 'webhook';
      };
    };
  };
}

export interface ScopeDetail {
  scope: string;
  granted: boolean;
}

export type ScopeDetailList = ScopeDetail[];
