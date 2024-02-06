import {Injectable} from '@angular/core';
import {getLocaleFirstDayOfWeek, WeekDay} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class IntlService {
  public async formatCurrency(value: string | number, currency: string, locale: string | null = null): Promise<string> {
    return new Intl.NumberFormat(locale ?? undefined, {
      currency: currency,
      style: 'currency',
    }).format(Number(value));
  }

  public formatDate(value: string, locale: string | null = null): string {
    return new Intl.DateTimeFormat(locale ?? undefined, {
      dateStyle: 'medium',
    }).format(new Date(value));
  }

  public formatDatetime(value: string, locale: string | null = null): string {
    return new Intl.DateTimeFormat(locale ?? undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }

  public formatNumber(value: string | number, digits: number | null = null, locale: string | null = null): string {
    return new Intl.NumberFormat(locale ?? undefined, {
      minimumFractionDigits: digits ?? undefined,
      maximumFractionDigits: digits ?? undefined,
    }).format(Number(value));
  }

  public formatPercentage(value: string | number, digits: number | null = null, locale: string | null = null): string {
    return new Intl.NumberFormat(locale ?? undefined, {
      minimumFractionDigits: digits ?? undefined,
      maximumFractionDigits: digits ?? undefined,
      style: 'percent',
    }).format(Number(value));
  }

  public getMonths(locale: string | null = null): string[] {
    const result = [];

    for (let i = 1; i <= 12; ++i) {
      result.push(this.getMonth(i, locale));
    }

    return result;
  }

  public getMonth(number: number, locale: string | null = null): string {
    const intl = new Intl.DateTimeFormat(locale ?? undefined, { month: 'long' });

    return intl.format(new Date(Date.UTC(2022, number - 1)));
  }

  public getWeekDayName(day: number, format: 'short' | 'long' = 'long', localeOrdering: boolean = false, locale: string | null = null): string {
    const map = [
      '2023-04-02',
      '2023-04-03',
      '2023-04-04',
      '2023-04-05',
      '2023-04-06',
      '2023-04-07',
      '2023-04-08',
    ];

    if (localeOrdering && locale && this.getFirstDayOfWeek(locale) !== WeekDay.Sunday) {
      const first = map.shift();
      map.push(<string>first);
    }

    return new Intl.DateTimeFormat(locale ?? undefined, {
      weekday: format,
    }).format(new Date(map[day]));
  }

  public getWeekdayNames(format: 'short' | 'long' = 'long', localeOrdering: boolean = false, locale: string | null = null): string[] {
    const result: string[] = [];
    for (let i = 0; i < 7; ++i) {
      result.push(this.getWeekDayName(i, format, localeOrdering, locale));
    }

    return result;
  }

  public getFirstDayOfWeek(locale: string): WeekDay {
    return getLocaleFirstDayOfWeek(locale);
  }
}
