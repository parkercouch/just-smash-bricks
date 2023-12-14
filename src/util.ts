export function isNullOrUndefined(obj: unknown): obj is null | undefined {
  return obj === null || obj === undefined;
}
