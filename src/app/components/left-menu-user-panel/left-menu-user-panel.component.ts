import {Component, computed, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import {NgIf, NgTemplateOutlet} from "@angular/common";
import {RouterLink} from "@angular/router";
import {TranslocoPipe} from "@ngneat/transloco";
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'app-left-menu-user-panel',
  standalone: true,
  imports: [
    NgIf,
    NgTemplateOutlet,
    RouterLink,
    TranslocoPipe
  ],
  templateUrl: './left-menu-user-panel.component.html',
  styleUrl: './left-menu-user-panel.component.scss'
})
export class LeftMenuUserPanelComponent implements OnInit {
  public loggedIn: Signal<boolean> = this.authManager.loggedIn;

  constructor(
    private readonly authManager: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
  }
}
