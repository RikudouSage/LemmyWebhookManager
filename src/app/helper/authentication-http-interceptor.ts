import {HttpInterceptorFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import {AuthenticationService} from "../services/authentication.service";

export const AuthenticationHttpInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('X-No-Auth')) {
    return next(req);
  }
  const authenticator = inject(AuthenticationService);

  let requestToSend: HttpRequest<any> = req;
  if (!req.headers.has('Authorization') && authenticator.loggedIn()) {
    requestToSend = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authenticator.apiKey}`),
    });
  }
  return next(requestToSend);
}
