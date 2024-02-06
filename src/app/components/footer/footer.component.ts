import {Component, OnInit, Signal, signal, WritableSignal} from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  public loggedIn: Signal<boolean> = this.authManager.loggedIn;

  constructor(
    private readonly authManager: AuthenticationService,
  ) {
  }

  ngOnInit(): void {
  }
}
