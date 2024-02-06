import {Component, computed, effect, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {TranslocoPipe} from "@ngneat/transloco";
import {AuthenticationService} from "../../services/authentication.service";
import {NgIf} from "@angular/common";
import {toSignal} from "@angular/core/rxjs-interop";
import {ApiService} from "../../services/api.service";
import {FlagsResponse} from "../../helper/http-types";

@Component({
  selector: 'app-left-menu',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoPipe,
    NgIf
  ],
  templateUrl: './left-menu.component.html',
  styleUrl: './left-menu.component.scss'
})
export class LeftMenuComponent implements OnInit {
  public loggedIn: Signal<boolean> = this.authManager.loggedIn;
  public isAdmin: Signal<boolean> = this.authManager.isAdmin;

  constructor(
    private readonly authManager: AuthenticationService,
    private readonly router: Router,
  ) {
  }

  ngOnInit(): void {
  }

  public async logout() {
    await this.authManager.logout();
    await this.router.navigateByUrl('/login');
  }
}
