import {CanActivateFn, Router, UrlSegment, UrlSegmentGroup, UrlTree} from "@angular/router";
import {inject} from "@angular/core";
import {AuthenticationService} from "../services/authentication.service";

export const LoggedInGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authentication = inject(AuthenticationService);
  const router = inject(Router);
  const url = router.createUrlTree(['/login']);

  if (!await authentication.checkCredentials()) {
    return url;
  }

  return true;
};
