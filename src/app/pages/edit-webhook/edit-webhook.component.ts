import {Component, computed, OnInit, signal, WritableSignal} from '@angular/core';
import {TitleService} from "../../services/title.service";
import {TranslatorService} from "../../services/translator.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ApiService} from "../../services/api.service";
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Resolvable, toPromise} from "../../helper/resolvable";
import {HttpMethod} from "../../enum/http-method";
import {DatabaseOperation} from "../../enum/database-operation";
import {TranslocoPipe} from "@ngneat/transloco";
import {LoaderComponent} from "../../components/loader/loader.component";
import {CheckboxComponent, Color} from "../../components/checkbox/checkbox.component";
import {TranslocoMarkupComponent} from "ngx-transloco-markup";
import {WebhookCreateData, WebhookUpdateData} from "../../helper/http-types";
import {MessageService} from "../../services/message.service";
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'app-edit-webhook',
  standalone: true,
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    LoaderComponent,
    CheckboxComponent,
    TranslocoMarkupComponent
  ],
  templateUrl: './edit-webhook.component.html',
  styleUrl: './edit-webhook.component.scss'
})
export class EditWebhookComponent implements OnInit {
  protected readonly HttpMethod = HttpMethod;
  protected readonly DatabaseOperation = DatabaseOperation;
  protected readonly Color = Color;

  private webhookId: WritableSignal<number | null> = signal(null);
  private formReady = signal(false);
  private dataReady = signal(false);

  public loading = computed(() => !this.formReady() || !this.dataReady());
  public availableObjectTypes: WritableSignal<string[]> = signal([]);
  public isAdmin = this.auth.isAdmin;

  public form = new FormGroup({
    url: new FormControl<string>('', [Validators.required]),
    method: new FormControl<HttpMethod>(HttpMethod.Get, [Validators.required]),
    objectType: new FormControl<string>('', [Validators.required]),
    operation: new FormControl<DatabaseOperation>(DatabaseOperation.Insert, [Validators.required]),
    enabled: new FormControl<boolean>(true),
    bodyExpression: new FormControl<string | null>(null),
    filterExpression: new FormControl<string | null>(null),
    enhancedFilter: new FormControl<string | null>(null),
    headers: new FormArray<FormGroup<{
      name: FormControl<string | null>,
      value: FormControl<string | null>,
    }>>([]),
    anonymous: new FormControl<boolean>(false),
    logResponses: new FormControl<boolean>(false),
  });

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslatorService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly api: ApiService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly auth: AuthenticationService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    if (this.activatedRoute.snapshot.params['id']) {
      this.titleService.title = this.translator.get('app.webhook.edit');
    } else {
      this.titleService.title = this.translator.get('app.webhook.create');
      this.dataReady.set(true);
    }

    this.activatedRoute.params.subscribe(async params => {
      const id = Number(params['id']);
      if (!id) {
        return;
      }

      this.webhookId.set(id);
      const webhook = (await toPromise(this.api.webhook(id))).data;
      this.form.patchValue({
        url: webhook.attributes.url,
        method: webhook.attributes.method,
        objectType: webhook.attributes.objectType,
        operation: webhook.attributes.operation,
        enabled: webhook.attributes.enabled,
        bodyExpression: webhook.attributes.bodyExpression,
        filterExpression: webhook.attributes.filterExpression,
        enhancedFilter: webhook.attributes.enhancedFilter,
        anonymous: webhook.relationships.user.data === null,
      });
      const headers = webhook.attributes.headers;
      if (headers) {
        for (const headerName of Object.keys(headers)) {
          const headerValue = headers[headerName];
          this.form.controls.headers.push(new FormGroup({
            name: new FormControl<string>(headerName, [Validators.required]),
            value: new FormControl<string>(headerValue, [Validators.required]),
          }));
        }
      }

      this.dataReady.set(true);
    });

    this.availableObjectTypes.set(await toPromise(this.api.availableScopes));
    this.formReady.set(true);
  }

  public async addHeaderForm(): Promise<void> {
    this.form.controls.headers.push(new FormGroup({
      name: new FormControl<string>('', [Validators.required]),
      value: new FormControl<string>('', [Validators.required]),
    }));
  }

  public async onSubmit(): Promise<void> {
    if (!this.form.valid) {
      this.messageService.createError(this.translator.get('app.invalid_form'))
      return;
    }
    this.formReady.set(false);

    const value = this.form.value;
    let webhook: WebhookCreateData | WebhookUpdateData;
    if (this.webhookId()) {
      webhook = {
        id: this.webhookId()!,
        type: "webhooks",
        attributes: {
          url: value.url!,
          method: value.method!,
          objectType: value.objectType!,
          operation: value.operation!,
          enabled: value.enabled ?? true,
          bodyExpression: (value.bodyExpression ?? null) || null,
          filterExpression: (value.filterExpression ?? null) || null,
          enhancedFilter: (value.enhancedFilter ?? null) || null,
          headers: value.headers?.length ? {} : null,
          logResponses: value.logResponses ?? false,
        },
      };
    } else {
      webhook = {
        type: "webhooks",
        attributes: {
          url: value.url!,
          method: value.method!,
          objectType: value.objectType!,
          operation: value.operation!,
          enabled: value.enabled ?? true,
          bodyExpression: (value.bodyExpression ?? null) || null,
          filterExpression: (value.filterExpression ?? null) || null,
          enhancedFilter: (value.enhancedFilter ?? null) || null,
          headers: value.headers?.length ? {} : null,
          logResponses: value.logResponses ?? false,
        },
      };
    }

    for (const header of (value.headers ?? [])) {
      webhook.attributes.headers![header.name!] = header.value!
    }

    if (this.isAdmin()) {
      if (value.anonymous) {
        webhook.relationships = {
          user: {
            data: null,
          },
        };
      } else {
        webhook.relationships = {
          user: {
            data: {
              type: 'user',
              id: (await toPromise(this.api.currentUser)).data.id,
            },
          },
        };
      }
    }

    let message: Resolvable<string>;
    if (this.webhookId()) {
      await toPromise(this.api.updateWebhook(this.webhookId()!, <WebhookUpdateData>webhook));
      message = this.translator.get('app.webhook.updated');
    } else {
      await toPromise(this.api.createWebhook(<WebhookCreateData>webhook));
      message = this.translator.get('app.webhook.created');
    }

    await this.router.navigateByUrl('/');
    this.messageService.createSuccess(message);
  }
}
