import {Component, computed, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {TitleService} from "../../services/title.service";
import {TranslatorService} from "../../services/translator.service";
import {User} from "../../helper/http-types";
import {toPromise} from "../../helper/resolvable";
import {LoaderComponent} from "../../components/loader/loader.component";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {TranslocoPipe} from "@ngneat/transloco";

interface UserWithScopes extends User {
  scopes: string[];
  scopeRequests: string[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    LoaderComponent,
    RouterLink,
    TranslocoPipe
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  private allUsers: WritableSignal<UserWithScopes[]> = signal([]);

  public loading: WritableSignal<boolean> = signal(true);
  public pages: WritableSignal<number> = signal(1);
  public filterId: WritableSignal<number | null> = signal(null);

  public users = computed(() => {
    if (!this.filterId()) {
      return this.allUsers();
    }

    return this.allUsers().filter(user => user.id === this.filterId());
  });

  constructor(
    private readonly titleService: TitleService,
    private readonly translator: TranslatorService,
    private readonly api: ApiService,
    private readonly activatedRoute: ActivatedRoute,
  ) {
  }

  public async ngOnInit(): Promise<void> {
    this.titleService.title = this.translator.get('app.title.users');
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams['id']) {
        this.filterId.set(Number(queryParams['id']));
      }
    });
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    const response = await toPromise(this.api.users());

    const users: UserWithScopes[] = [];
    for (const user of response.data) {
      users.push({
        ...user,
        scopes: response.included
          .filter(scope => scope.relationships.user.data.id === user.id)
          .filter(scope => scope.attributes.granted)
          .map(scope => scope.attributes.scope),
        scopeRequests: response.included
          .filter(scope => scope.relationships.user.data.id === user.id)
          .filter(scope => !scope.attributes.granted)
          .map(scope => scope.attributes.scope),
      })
    }

    this.allUsers.set(users);
    this.pages.set(Math.ceil(response.meta.totalItems / response.meta.itemsPerPage));
    this.loading.set(false);
  }

  public async deleteUser(id: number): Promise<void> {
    this.loading.set(true);
    await toPromise(this.api.deleteUser(id));
    await this.loadData();
  }
}
