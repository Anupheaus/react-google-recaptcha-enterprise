import { memo, useCallback, useMemo, useRef } from 'react';
import { ReCaptcha as ReCaptchaComponent } from './recaptcha-wrapper';
import { ReCaptchaProps } from './recaptcha';
import { ReCaptchaState, createState } from './recaptchaState';

export function useRecaptcha() {
  const state = useRef<ReCaptchaState>(useMemo(() => createState(), []));

  const execute = useCallback(() => state.current.execute(), []);
  const reset = useCallback(() => state.current.reset(), []);
  const getValue = useCallback(() => state.current.getValue(), []);
  const getWidgetId = useCallback(() => state.current.getWidgetId(), []);

  const ReCaptcha = useMemo(() => memo((props: ReCaptchaProps) => <ReCaptchaComponent {...props as any} state={state} />), []);

  return {
    execute,
    reset,
    getValue,
    getWidgetId,
    ReCaptcha,
  };
}