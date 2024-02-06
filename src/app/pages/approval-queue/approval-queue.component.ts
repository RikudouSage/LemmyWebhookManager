import {Component, computed, OnInit, signal, WritableSignal} from '@angular/core';
import {TitleService} from "../../services/title.service";
import {TranslatorService} from "../../services/translator.service";
import {TranslocoPipe} from "@ngneat/transloco";
import {TranslocoMarkupComponent} from "ngx-transloco-markup";
import {ApiService} from "../../services/api.service";
import {toPromise} from "../../helper/resolvable";
import {LoaderComponent} from "../../components/loader/loader.component";
import {Scope, User} from "../../helper/http-types";
import {MessageService} from "../../services/message.service";

interface ResolvedUser extends User {
  scopes: string[];
}

interface ResolvedScope extends Scope {
  user: User;
}

@Component({
  selector: 'app-approval-queue',
  standalone: true,
  imports: [
    TranslocoPipe,
    TranslocoMarkupComponent,
    LoaderComponent
  ],
  templateUrl: './approval-queue.component.html',
  styleUrl: './approval-queue.component.scss'
})
export class ApprovalQueueComponent implements OnInit {
  private ungrantedScopes: WritableSignal<ResolvedScope[]> = signal([]);

  public loading = signal(true);
  public users: WritableSignal<ResolvedUser[]> = signal([]);
  public scopesToList = computed(() => {
    const userIds = this.users().map(user => user.id);
    return this.ungrantedScopes().filter(scope => !userIds.includes(scope.relationships.user.data.id));
  });

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslatorService,
    private readonly api: ApiService,
    private readonly messageService: MessageService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('app.approval_queue');
    const responses = await Promise.all([
      toPromise(this.api.usersToApprove()),
      toPromise(this.api.scopesToApprove()),
    ]);
    this.users.set(responses[0].data.map(user => {
      return {
        ...user,
        scopes: user.relationships.scopes.data.map(
          scopeStruct => responses[0].included.filter(scope => scope.id === scopeStruct.id)[0].attributes.scope,
        ),
      }
    }));
    this.ungrantedScopes.set(responses[1].data.map(
      scope => ({
        ...scope,
        user: responses[1].included.filter(
          user => user.id === scope.relationships.user.data.id,
        )[0],
      }),
    ));
    this.loading.set(false);
  }

  public async approveUser(userToApprove: ResolvedUser): Promise<void> {
    this.loading.set(true);
    if (!await toPromise(this.api.approveUser(userToApprove))) {
      this.messageService.createError(this.translator.get('app.error.approve_user_failed'));
      this.loading.set(false);
      return;
    }

    this.messageService.createSuccess(this.translator.get('app.success.approve_user_succeeded'));
    this.users.update(users => users.filter(user => user.id !== userToApprove.id));
    this.loading.set(false);
  }

  public async rejectUser(userToReject: ResolvedUser): Promise<void> {
    this.loading.set(true);
    if (!await toPromise(this.api.rejectUser(userToReject))) {
      this.messageService.createError(this.translator.get('app.error.reject_user_failed'));
      this.loading.set(false);
      return;
    }

    this.messageService.createSuccess(this.translator.get('app.success.reject_user_succeeded'));
    this.users.update(users => users.filter(user => user.id !== userToReject.id));
    this.ungrantedScopes.update(scopes => scopes.filter(scope => scope.relationships.user.data.id !== userToReject.id));
    this.loading.set(false);
  }

  public async approveScope(scopeToApprove: ResolvedScope): Promise<void> {
    this.loading.set(true);
    if (!await toPromise(this.api.approveScope(scopeToApprove))) {
      this.messageService.createError(this.translator.get('app.error.approve_scope_failed'));
      this.loading.set(false);
      return;
    }

    this.messageService.createSuccess(this.translator.get('app.success.approve_scope_succeeded'));
    this.ungrantedScopes.update(scopes => scopes.filter(scope => scope.id !== scopeToApprove.id));
    this.loading.set(false);
  }

  public async rejectScope(scopeToReject: ResolvedScope): Promise<void> {
    this.loading.set(true);
    if (!await toPromise(this.api.rejectScope(scopeToReject))) {
      this.messageService.createError(this.translator.get('app.error.reject_scope_failed'));
      this.loading.set(false);
      return;
    }

    this.messageService.createSuccess(this.translator.get('app.success.reject_scope_succeeded'));
    this.ungrantedScopes.update(scopes => scopes.filter(scope => scope.id !== scopeToReject.id));
    this.loading.set(false);
  }
}
