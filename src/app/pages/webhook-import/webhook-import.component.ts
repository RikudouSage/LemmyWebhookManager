import {AfterViewInit, Component, ElementRef, OnInit, signal, ViewChild} from '@angular/core';
import {TitleService} from "../../services/title.service";
import {TranslatorService} from "../../services/translator.service";
import {TranslocoMarkupComponent} from "ngx-transloco-markup";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslocoPipe} from "@ngneat/transloco";
import {EditorView, keymap} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {defaultKeymap, indentWithTab} from "@codemirror/commands";
import {yaml} from "@codemirror/lang-yaml";
import {basicSetup} from "codemirror";
import {oneDark} from "@codemirror/theme-one-dark";
import {LoaderComponent} from "../../components/loader/loader.component";
import {MessageService} from "../../services/message.service";
import {ApiService} from "../../services/api.service";
import {toPromise} from "../../helper/resolvable";
import {Router} from "@angular/router";

@Component({
  selector: 'app-webhook-import',
  standalone: true,
  imports: [
    TranslocoMarkupComponent,
    ReactiveFormsModule,
    TranslocoPipe,
    LoaderComponent
  ],
  templateUrl: './webhook-import.component.html',
  styleUrl: './webhook-import.component.scss'
})
export class WebhookImportComponent implements OnInit, AfterViewInit {
  @ViewChild('editor') private editorElement: ElementRef<HTMLDivElement> | null = null;
  private editor: EditorView | null = null;

  public loading = signal(true);

  public form = new FormGroup({
    configuration: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslatorService,
    private readonly messageService: MessageService,
    private readonly api: ApiService,
    private readonly router: Router,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('app.webhook.import');
  }

  public async ngAfterViewInit(): Promise<void> {
    this.loading.set(false);

    this.editor = new EditorView({
      state: EditorState.create({
        doc: this.form.controls.configuration.value ?? '',
        extensions: [
          keymap.of(defaultKeymap),
          keymap.of([indentWithTab]),
          basicSetup,
          yaml(),
          oneDark,
          EditorView.updateListener.of(update => {
            this.form.patchValue({configuration: update.state.doc.toString()});
          }),
        ],
      }),
      parent: this.editorElement!.nativeElement,
    });
  }

  public async import(): Promise<void> {
    if (!this.form.valid) {
      this.messageService.createError(this.translator.get('app.invalid_form'));
      return;
    }

    this.loading.set(true);

    if (!await toPromise(this.api.importWebhooks(this.form.controls.configuration.value!))) {
      this.messageService.createError(this.translator.get('app.webhook.import.error'));
    } else {
      this.router.navigateByUrl('/').then(() => {
        this.messageService.createSuccess(this.translator.get('app.webhook.import.success'));
      });
    }

    this.loading.set(false);
  }
}
