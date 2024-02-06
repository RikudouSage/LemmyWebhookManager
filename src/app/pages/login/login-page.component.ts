import {Component, OnInit, signal} from '@angular/core';
import {TranslatorService} from "../../services/translator.service";
import {TitleService} from "../../services/title.service";
import {LoaderComponent} from "../../components/loader/loader.component";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TranslocoMarkupComponent} from "ngx-transloco-markup";
import {NgIf} from "@angular/common";
import {TranslocoPipe} from "@ngneat/transloco";
import {MessageService} from "../../services/message.service";
import {AuthenticationService} from "../../services/authentication.service";
import {Router, RouterLink} from "@angular/router";
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    LoaderComponent,
    ReactiveFormsModule,
    TranslocoMarkupComponent,
    NgIf,
    TranslocoPipe,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
  public loading = signal<boolean>(false);
  public registrationsEnabled = signal(false);
  public form = new FormGroup({
    username: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    private readonly translator: TranslatorService,
    private readonly titleService: TitleService,
    private readonly messageService: MessageService,
    private readonly authentication: AuthenticationService,
    private readonly router: Router,
    private readonly api: ApiService,
  ) {
  }

  ngOnInit(): void {
    this.titleService.title = this.translator.get('app.title.login');
    this.api.flags().subscribe(flags => {
      this.registrationsEnabled.set(flags.registrations);
    });
  }

  public async doLogin() {
    this.loading.set(true);

    if (!this.form.valid) {
      this.messageService.createError(this.translator.get('app.invalid_form'));
      this.loading.set(false);
      return;
    }

    if (await this.authentication.logIn(this.form.controls.username.value!, this.form.controls.password.value!)) {
      await this.router.navigateByUrl('/');
      return;
    }

    this.messageService.createError(this.translator.get('app.login.invalid_credentials'));
  }
}
