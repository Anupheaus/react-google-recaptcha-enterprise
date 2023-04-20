export interface ReCaptchaState {
  execute(): Promise<string>;
  reset(): void;
  getValue(): string | null;
  getWidgetId(): number | null;
  promise: Promise<string>;
  resolve(token: string): void;
  reject(error: Error): void;
  requiresExecution: boolean;
}

export function createState(): ReCaptchaState {
  let resolve: (token: string) => void = () => void 0;
  let reject: (error: Error) => void = () => void 0;
  const promise = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const state: ReCaptchaState = {
    execute: () => {
      state.requiresExecution = true;
      return state.promise;
    },
    reset: () => {
      state.promise = new Promise<string>((res, rej) => {
        state.resolve = res;
        state.reject = rej;
      });
    },
    getValue: () => null,
    getWidgetId: () => null,
    promise,
    resolve,
    reject,
    requiresExecution: false,
  };
  return state;
}