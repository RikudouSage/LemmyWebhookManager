import {CanActivateFn, Router, UrlTree} from "@angular/router";
import {inject} from "@angular/core";
import {AuthenticationService} from "../services/authentication.service";

export const NotLoggedInGuard: CanActivateFn = async (): Promise<UrlTree | boolean> => {
  const authentication = inject(AuthenticationService);
  const router = inject(Router);
  const url = router.createUrlTree(['/']);

  if (await authentication.checkCredentials()) {
    return url;
  }

  return true;
}
