import {Component, effect, EventEmitter, forwardRef, Input, OnInit, Output, signal} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {OnChange, OnTouched} from "../../helper/form-types";
import {Resolvable} from "../../helper/resolvable";
import {ToObservablePipe} from "../../pipes/to-observable.pipe";
import {AsyncPipe} from "@angular/common";
import {Observable} from "rxjs";

export enum Color {
  Success,
  Danger,
  Warning,
  Primary,
  Info,
  Secondary,
}

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [
    ToObservablePipe,
    AsyncPipe
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true},
  ]
})
export class CheckboxComponent implements ControlValueAccessor, OnInit {
  protected readonly Color = Color;
  protected value = signal(false);

  private changedEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  private onChange: OnChange<boolean> | null = null;
  private onTouched: OnTouched | null = null;

  @Input() onColor: Color | null = null;
  @Input() offColor: Color | null = null;
  @Input() label: Resolvable<string> = '';
  @Input() disabled: boolean = false;

  @Output() get valueChanged(): Observable<boolean> {
    return this.changedEmitter;
  }

  public controlId = `checkbox${Math.random()}`;

  constructor() {
    effect(() => {
      const value = this.value();
      if (this.onChange !== null) {
        this.onChange(value);
      }
      if (this.onTouched !== null) {
        this.onTouched();
      }
      this.changedEmitter.next(value);
    });
  }

  public ngOnInit(): void {
  }

  public writeValue(value: boolean): void {
    this.value.set(value);
  }

  public registerOnChange(fn: OnChange<boolean>): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: OnTouched): void {
    this.onTouched = fn;
  }

  public setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}
