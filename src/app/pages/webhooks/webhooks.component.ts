import {Component, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {TitleService} from "../../services/title.service";
import {environment} from "../../../environments/environment";
import {TranslatorService} from "../../services/translator.service";
import {LoaderComponent} from "../../components/loader/loader.component";
import {ApiService} from "../../services/api.service";
import {toPromise} from "../../helper/resolvable";
import {Webhook} from "../../helper/http-types";
import {TranslocoPipe} from "@ngneat/transloco";
import {AuthenticationService} from "../../services/authentication.service";
import {NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-webhooks',
  standalone: true,
  imports: [
    LoaderComponent,
    TranslocoPipe,
    RouterLink,
  ],
  templateUrl: './webhooks.component.html',
  styleUrl: './webhooks.component.scss'
})
export class WebhooksComponent implements OnInit {
  public loading: WritableSignal<boolean> = signal(true);
  public webhooks: WritableSignal<Webhook[]> = signal([]);
  public pages: WritableSignal<number> = signal(1);
  public isAdmin: Signal<boolean> = this.auth.isAdmin;

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslatorService,
    private readonly api: ApiService,
    private readonly auth: AuthenticationService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('app.webhooks');
    await this.loadData();
  }

  public async deleteWebhook(id: number): Promise<void> {
    this.loading.set(true);
    await toPromise(this.api.deleteWebhook(id));
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    const response = await toPromise(this.api.webhooks());
    this.webhooks.set(response.data);
    this.pages.set(Math.ceil(response.meta.totalItems / response.meta.itemsPerPage));
    this.loading.set(false);
  }
}
