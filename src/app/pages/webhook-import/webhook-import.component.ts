import {Component, OnInit} from '@angular/core';
import {TitleService} from "../../services/title.service";
import {TranslatorService} from "../../services/translator.service";
import {TranslocoMarkupComponent} from "ngx-transloco-markup";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslocoPipe} from "@ngneat/transloco";

@Component({
  selector: 'app-webhook-import',
  standalone: true,
  imports: [
    TranslocoMarkupComponent,
    ReactiveFormsModule,
    TranslocoPipe
  ],
  templateUrl: './webhook-import.component.html',
  styleUrl: './webhook-import.component.scss'
})
export class WebhookImportComponent implements OnInit {
  public form = new FormGroup({
    configuration: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslatorService,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('app.webhook.import');
  }
}
