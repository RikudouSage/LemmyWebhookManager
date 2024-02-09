import {ApplicationConfig, isDevMode} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withInterceptors} from "@angular/common/http";
import {defaultTranslocoMarkupTranspilers, provideTranslationMarkupTranspiler} from "ngx-transloco-markup";
import {translocoMarkupRouterLinkRenderer} from "ngx-transloco-markup-router-link";
import {TranslocoHttpLoader} from './transloco-loader';
import {provideTransloco} from '@ngneat/transloco';
import {AuthenticationHttpInterceptor} from "./helper/authentication-http-interceptor";
import {ParagraphTranslocoTranspiler} from "./services/transloco-transpiler/paragraph-transloco.transpiler";


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([AuthenticationHttpInterceptor]),
    ),
    defaultTranslocoMarkupTranspilers(),
    translocoMarkupRouterLinkRenderer(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'cs'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          allowEmpty: true,
          useFallbackTranslation: true,
        }
      },
      loader: TranslocoHttpLoader
    }),
    provideTranslationMarkupTranspiler(ParagraphTranslocoTranspiler),
  ],
};
