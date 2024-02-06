import {Component, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {RouterLink} from "@angular/router";
import {TranslocoPipe} from "@ngneat/transloco";
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'app-top-menu',
  standalone: true,
    imports: [
        RouterLink,
        TranslocoPipe
    ],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.scss'
})
export class TopMenuComponent implements OnInit {
  public loggedIn: Signal<boolean> = this.authManager.loggedIn;

  constructor(
    private readonly authManager: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
  }
}
