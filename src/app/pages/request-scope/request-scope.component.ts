import {Component, computed, OnInit, signal, WritableSignal} from '@angular/core';
import {TitleService} from "../../services/title.service";
import {TranslatorService} from "../../services/translator.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ApiService} from "../../services/api.service";
import {toPromise} from "../../helper/resolvable";
import {map} from "rxjs";
import {TranslocoPipe} from "@ngneat/transloco";
import {LoaderComponent} from "../../components/loader/loader.component";
import {MessageService} from "../../services/message.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-request-scope',
  standalone: true,
  imports: [
    TranslocoPipe,
    LoaderComponent,
    ReactiveFormsModule
  ],
  templateUrl: './request-scope.component.html',
  styleUrl: './request-scope.component.scss'
})
export class RequestScopeComponent implements OnInit {
  private allScopes: WritableSignal<string[]> = signal([]);

  public grantedScopes: WritableSignal<string[]> = signal([]);
  public loading = signal(true);
  public ungrantedScopes = computed(() => {
    return this.allScopes().filter(scope => !this.grantedScopes().includes(scope));
  });

  public form = new FormGroup({
    scope: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslatorService,
    private readonly api: ApiService,
    private readonly messageService: MessageService,
    private readonly router: Router,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('app.scope_request');

    const responses = await Promise.all([
      toPromise(this.api.availableScopes),
      toPromise(this.api.scopeList.pipe(
        map(scopes => scopes.map(scope => scope.scope)),
      )),
    ]);
    this.grantedScopes.set(responses[0]);
    this.allScopes.set(responses[1]);
    this.loading.set(false);
  }

  public async submitForm(): Promise<void> {
    if (!this.form.valid) {
      this.messageService.createError(this.translator.get('app.invalid_form'));
      return;
    }
    this.loading.set(true);
    const result = await toPromise(this.api.askForScope(this.form.controls.scope.value!));

    if (result) {
      this.router.navigateByUrl('/').then(() => {
        this.messageService.createSuccess(this.translator.get('app.scope_request.success'));
      });
    } else if (result === null) {
      this.messageService.createWarning(this.translator.get('app.scope_request.error.already_asked'));
    } else {
      this.messageService.createError(this.translator.get('app.scope_request.error'));
    }

    this.loading.set(false);
  }
}
