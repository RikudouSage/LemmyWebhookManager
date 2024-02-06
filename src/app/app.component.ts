import {Component, ElementRef, HostListener, Inject, OnInit, signal, ViewChild, WritableSignal} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {TranslocoMarkupComponent} from "ngx-transloco-markup";
import {TranslocoPipe} from "@ngneat/transloco";
import {environment} from "../environments/environment";
import {LeftMenuComponent} from "./components/left-menu/left-menu.component";
import {LeftMenuUserPanelComponent} from "./components/left-menu-user-panel/left-menu-user-panel.component";
import {FooterComponent} from "./components/footer/footer.component";
import {TopMenuComponent} from "./components/top-menu/top-menu.component";
import {NotificationComponent} from "./components/notification/notification.component";
import {LoaderComponent} from "./components/loader/loader.component";
import {toSignal} from "@angular/core/rxjs-interop";
import {TitleService} from "./services/title.service";
import {MessageService, MessageType} from "./services/message.service";
import {toPromise} from "./helper/resolvable";

interface ResolvedMessage {
  type: MessageType;
  message: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TranslocoMarkupComponent, TranslocoPipe, RouterLink, LeftMenuComponent, LeftMenuUserPanelComponent, FooterComponent, TopMenuComponent, NotificationComponent, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private readonly autoCollapse = 992;

  public readonly appTitle = environment.appTitle;
  public notifications: WritableSignal<ResolvedMessage[]> = signal([]);
  public title = toSignal(this.titleService.titleChanged);

  public darkModeEnabled: boolean = false;
  public appVersion: string = environment.appVersion;

  @ViewChild('sideMenu') private sideMenu: ElementRef<HTMLElement> | null = null;
  @ViewChild('sideMenuToggle') private sideMenuToggle: ElementRef<HTMLAnchorElement> | null = null;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly titleService: TitleService,
    private readonly messageService: MessageService,
    private readonly router: Router,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    const darkModeDetected = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (darkModeDetected) {
      this.document.body.classList.add('dark-mode');
    } else {
      this.document.body.classList.remove('dark-mode');
    }
    this.darkModeEnabled = darkModeDetected;

    this.messageService.messageReceived.subscribe(async message => {
      const messageContent = await toPromise(message.message);
      this.notifications.update(messages => {
        messages.push({
          message: messageContent,
          type: message.type,
        });

        return messages;
      });
    });

    if (typeof window !== 'undefined' && window.outerWidth <= this.autoCollapse) {
      await this.toggleSideMenu();
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.notifications.set([]);
        if (typeof window !== 'undefined' && window.outerWidth <= this.autoCollapse) {
          this.hideMenu();
        }
      }
    });
  }

  public async toggleSideMenu(): Promise<void> {
    const body = this.document.body;
    if (body.classList.contains('sidebar-collapse')) {
      if (window.outerWidth <= this.autoCollapse) {
        body.classList.add('sidebar-open');
      }
      body.classList.remove('sidebar-collapse');
      body.classList.remove('sidebar-closed');
    } else {
      await this.hideMenu();
    }
  }

  private async hideMenu(): Promise<void> {
    const body = this.document.body;
    if (window.outerWidth <= this.autoCollapse) {
      body.classList.remove('sidebar-open');
      body.classList.add('sidebar-closed');
    }
    body.classList.add('sidebar-collapse');
  }

  @HostListener('body:click', ['$event'])
  public async onBodyClicked(event: Event): Promise<void> {
    if (this.sideMenu !== null && this.sideMenuToggle !== null) {
      if (this.sideMenu.nativeElement.contains(<HTMLElement>event.target) || this.sideMenuToggle.nativeElement.contains(<HTMLElement>event.target)) {
        return;
      }
      if (window.outerWidth <= this.autoCollapse) {
        await this.hideMenu();
      }
    }
  }
}
