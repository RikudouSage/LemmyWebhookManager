import {Component, computed, OnInit, signal, WritableSignal} from '@angular/core';
import {TitleService} from "../../services/title.service";
import {TranslatorService} from "../../services/translator.service";
import {LoaderComponent} from "../../components/loader/loader.component";
import {FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {TranslocoPipe} from "@ngneat/transloco";
import {AppValidators} from "../../helper/app-validators";
import {MessageService} from "../../services/message.service";
import {ApiService} from "../../services/api.service";
import {toPromise} from "../../helper/resolvable";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    LoaderComponent,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  public loading = signal(true);
  public scopes: WritableSignal<string[]> = signal([]);
  public scopesInForm: WritableSignal<string[]> = signal([]);
  public selectBoxScopes = computed(() => {
    return this.scopes().filter(scope => !this.scopesInForm().includes(scope));
  });

  public form = new FormGroup({
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
    passwordRepeat: new FormControl<string>('', [Validators.required]),
    scopes: new FormArray<FormControl<string | null>>([]),
  }, [
    AppValidators.fieldsSame(['password', 'passwordRepeat']),
  ]);

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslatorService,
    private readonly messageService: MessageService,
    private readonly api: ApiService,
    private readonly router: Router,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('app.register_account');

    this.form.controls.scopes.valueChanges.subscribe(scopes => {
      this.scopesInForm.set(<string[]>scopes.filter(scope => scope !== null));
    });

    this.scopes.set((await toPromise(this.api.scopeList)).map(scope => scope.scope));
    this.loading.set(false);
  }

  public async doRegister(): Promise<void> {
    this.loading.set(true);

    if (!this.form.valid) {
      this.messageService.createError(this.translator.get('app.invalid_form'));
      this.loading.set(false);
      return;
    }

    const result = await toPromise(this.api.registerAccount(
      this.form.controls.username.value!,
      this.form.controls.password.value!,
      <string[]>this.form.controls.scopes.value.filter(scope => scope !== null),
    ));

    if (!result) {
      this.messageService.createError(this.translator.get('app.error.registration_failed'));
      this.loading.set(false);
      return;
    }

    this.router.navigateByUrl('/login').then(() => {
      this.messageService.createSuccess(this.translator.get('app.success.user_registered'));
    })
  }

  public async addScope(scope: string): Promise<void> {
    this.form.controls.scopes.push(new FormControl<string | null>(scope));
  }

  public async removeScope(scope: string): Promise<void> {
    for (let i = 0; i < this.form.controls.scopes.length; ++i) {
      const control = this.form.controls.scopes.at(i);
      if (control.value === scope) {
        this.form.controls.scopes.removeAt(i);
        break;
      }
    }
  }
}
