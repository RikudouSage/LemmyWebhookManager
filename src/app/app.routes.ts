import {Routes} from '@angular/router';
import {LoggedInGuard} from "./guards/logged-in.guard";
import {NotLoggedInGuard} from "./guards/not-logged-in.guard";
import {RegistrationsEnabledGuard} from "./guards/registrations-enabled.guard";
import {IsAdminGuard} from "./guards/is-admin.guard";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/webhooks/webhooks.component').then(m => m.WebhooksComponent),
    canActivate: [LoggedInGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login-page.component').then(m => m.LoginPageComponent),
    canActivate: [NotLoggedInGuard],
  },
  {
    path: 'webhooks/create',
    loadComponent: () => import('./pages/edit-webhook/edit-webhook.component').then(m => m.EditWebhookComponent),
    canActivate: [LoggedInGuard],
  },
  {
    path: 'webhooks/detail/:id',
    loadComponent: () => import('./pages/edit-webhook/edit-webhook.component').then(m => m.EditWebhookComponent),
    canActivate: [LoggedInGuard],
  },
  {
    path: 'webhooks/logs/:id',
    loadComponent: () => import('./pages/webhook-responses/webhook-responses.component').then(m => m.WebhookResponsesComponent),
    canActivate: [LoggedInGuard],
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
    canActivate: [LoggedInGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [RegistrationsEnabledGuard, NotLoggedInGuard],
  },
  {
    path: 'approval-queue',
    loadComponent: () => import('./pages/approval-queue/approval-queue.component').then(m => m.ApprovalQueueComponent),
    canActivate: [LoggedInGuard, IsAdminGuard],
  }
];
