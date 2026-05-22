/**
 * Match type for field validation errors. Mirrors React `FieldErrorMatch`.
 * `true` means "any invalid state"; a string names a `ValidityState` key.
 */
export type FieldErrorMatch =
  | boolean
  | "badInput"
  | "customError"
  | "patternMismatch"
  | "rangeOverflow"
  | "rangeUnderflow"
  | "stepMismatch"
  | "tooLong"
  | "tooShort"
  | "typeMismatch"
  | "valid"
  | "valueMissing";

export type FieldError =
  | string
  | { message: string; match?: FieldErrorMatch };
