import { Pipe, PipeTransform } from '@angular/core';
import {IntlService} from "../services/intl.service";

@Pipe({
  name: 'formatDatetime',
  standalone: true
})
export class FormatDatetimePipe implements PipeTransform {
  constructor(
    private readonly intl: IntlService,
  ) {
  }

  public transform(value: string | Date, locale: string | null = null): string {
    if (typeof value !== 'string') {
      value = value.toISOString();
    }
    return this.intl.formatDatetime(value, locale);
  }
}
