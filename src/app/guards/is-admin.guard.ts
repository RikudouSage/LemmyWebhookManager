import {CanActivateFn, Router, UrlTree} from "@angular/router";
import {inject} from "@angular/core";
import {AuthenticationService} from "../services/authentication.service";

export const IsAdminGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authentication = inject(AuthenticationService);
  const router = inject(Router);
  const url = router.createUrlTree(['/login']);


  return true;

  if (!authentication.isAdmin()) {
    return url;
  }

  return true;
}
