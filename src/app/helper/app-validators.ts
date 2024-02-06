import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from "@angular/forms";

export class AppValidators {
  public static requiredIf(callback: (group: FormGroup) => boolean, ...controlNames: string[]): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!callback(<FormGroup>group)) {
        return null;
      }

      let hasErrors = false;
      const errors: {required: {[key: string]: true}} = {
        required: {},
      };
      for (const controlName of controlNames) {
        const control = (<FormGroup>group).controls[controlName];
        if (control === undefined) {
          errors.required[controlName] = true;
          hasErrors = true;
          continue;
        }

        if (Array.isArray(control.value) && !control.value.length) {
          errors.required[controlName] = true;
          hasErrors = true;
        }

        if (!control.value && control.value !== 0) {
          errors.required[controlName] = true;
          hasErrors = true;
        }
      }

      return hasErrors ? errors : null;
    }
  }

  public static fieldsSame(fieldNames: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormGroup)) {
        return null
      }
      let value: any = null;
      const errors: {fieldsSame: {[name: string]: string}} = {fieldsSame: {}};
      let hasErrors = false;
      for (const fieldName of fieldNames) {
        const field = control.controls[fieldName];
        if (field === undefined) {
          errors.fieldsSame[fieldName] = 'nonexistent';
          hasErrors = true;
          continue;
        }
        value ??= field.value;
        if (field.value !== value) {
          errors.fieldsSame[fieldName] = 'not_same';
          hasErrors = true;
        }
      }

      return hasErrors ? errors : null;
    };
  }
}
