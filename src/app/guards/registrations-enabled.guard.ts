import {CanActivateFn, Router} from "@angular/router";
import {inject} from "@angular/core";
import {ApiService} from "../services/api.service";
import {toPromise} from "../helper/resolvable";

export const RegistrationsEnabledGuard: CanActivateFn = async () => {
  const api = inject(ApiService);
  const router = inject(Router);

  if ((await toPromise(api.flags())).registrations) {
    return true;
  }

  return router.createUrlTree(['/']);
};
