import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";

export interface FieldError {
  formGroupName: string;
  fieldName: string;
  errorCode: string;
}

export function getFormErrors(
  control: AbstractControl,
  formGroupName: string = 'form',
  fieldName: string | null = null,
  errors: FieldError[] = [],
): FieldError[] {
  if (control instanceof FormControl) {
    if (fieldName === null) {
      throw new Error("Field name cannot be null for FormControl");
    }
    const controlErrors = control.errors;
    if (controlErrors !== null) {
      for (const key of Object.keys(controlErrors)) {
        errors.push({
          errorCode: key,
          fieldName: fieldName,
          formGroupName: formGroupName,
        });
      }
    }
  }

  if (control instanceof FormGroup) {
    for (const controlName of Object.keys(control.controls)) {
      const formControl = control.controls[controlName];
      const formControlGroupName = `${formGroupName}.${controlName}`;
      getFormErrors(formControl, formControlGroupName, controlName, errors);
    }
  }

  if (control instanceof FormArray) {
    let index = 0;
    for (const formControl of control.controls) {
      const formControlGroupName = `${formGroupName}[${index}]`;
      getFormErrors(formControl, formControlGroupName, 'Array', errors);
      ++index;
    }
  }

  return errors;
}
