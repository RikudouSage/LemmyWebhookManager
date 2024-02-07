import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {TitleService} from "../../services/title.service";
import {TranslatorService} from "../../services/translator.service";
import {ApiService} from "../../services/api.service";
import {toPromise} from "../../helper/resolvable";
import {ActivatedRoute} from "@angular/router";
import {WebhookResponse} from "../../helper/http-types";
import {LoaderComponent} from "../../components/loader/loader.component";
import {TranslocoPipe} from "@ngneat/transloco";
import {FormatDatetimePipe} from "../../pipes/format-datetime.pipe";
import {KeyValuePipe} from "@angular/common";

@Component({
  selector: 'app-webhook-responses',
  standalone: true,
  imports: [
    LoaderComponent,
    TranslocoPipe,
    FormatDatetimePipe,
    KeyValuePipe
  ],
  templateUrl: './webhook-responses.component.html',
  styleUrl: './webhook-responses.component.scss'
})
export class WebhookResponsesComponent implements OnInit {
  public loading = signal(true);
  public logs: WritableSignal<WebhookResponse[]> = signal([]);

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslatorService,
    private readonly api: ApiService,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('app.webhook_logs');
    this.activatedRoute.params.subscribe(async params => {
      const webhookId = Number(params['id']);
      if (!webhookId) {
        return;
      }

      this.loading.set(true);
      this.logs.set(await toPromise(this.api.getLogs(webhookId)));
      this.loading.set(false);
    });
  }
}
