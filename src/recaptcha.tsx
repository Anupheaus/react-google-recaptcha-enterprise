/* eslint-disable prettier/prettier */
import { useMemo, memo, useRef, useCallback, useEffect } from 'react';
import { ReCaptchaState } from './recaptchaState';

export interface ReCaptchaProps {
  className?: string;
  sitekey: string;
  theme?: 'dark' | 'light';
  type?: 'image' | 'audio';
  tabindex?: number;
  size?: 'compact' | 'normal' | 'invisible';
  stoken?: string;
  hl?: string;
  badge?: 'bottomright' | 'bottomleft' | 'inline';
  isolated?: boolean;
  onChange?(token: string | undefined): void;
  onErrored?(): void;
  onExpired?(): void;
}

interface Props extends ReCaptchaProps {
  grecaptcha: any;
  state: ReCaptchaState;
}

export const ReCaptcha = memo(({
  className,
  sitekey,
  theme = 'light',
  type = 'image',
  tabindex = 0,
  size = 'normal',
  stoken,
  grecaptcha,
  badge = 'bottomright',
  hl,
  isolated,
  state,
  onChange,
  onExpired,
  onErrored,
}: Props) => {
  const renderCaptcha = useRef<(element: HTMLDivElement) => void>(() => void 0);
  const handleChange = useRef<(token: string) => void>(() => void 0);
  const handleExpired = useRef<() => void>(() => void 0);
  const handleErrored = useRef<() => void>(() => void 0);
  const widgetId = useRef<number | null>(null);

  useMemo(() => {
    state.execute = () => {
      if (grecaptcha == null) return Promise.reject(new Error('grecaptcha not loaded yet.'));
      if (widgetId.current == null) { state.requiresExecution = true; return state.promise; }
      grecaptcha.enterprise.execute(widgetId.current);
      return state.promise;
    };
    state.getValue = () => {
      if (grecaptcha == null) return null;
      if (widgetId.current == null) return null;
      return grecaptcha.enterprise.getResponse(widgetId.current);
    };
    state.getWidgetId = () => widgetId.current;
  }, [grecaptcha]);

  handleChange.current = (token: string) => {
    onChange?.(token);
    state.resolve(token);
  };
  handleExpired.current = () => {
    onExpired?.();
    onChange?.(undefined);
    state.reject(new Error('Token expired.'));
  };
  handleErrored.current = () => {
    onErrored?.();
    state.reject(new Error('Token errored.'));
  };

  renderCaptcha.current = (element: HTMLDivElement) => {
    if (element.children.length > 0) return;
    const wrapper = document.createElement("div");
    element.appendChild(wrapper);
    widgetId.current = grecaptcha.enterprise.render(wrapper, {
      sitekey,
      callback: (token: string) => handleChange.current(token),
      theme,
      type,
      tabindex,
      'expired-callback': () => handleExpired.current(),
      'error-callback': () => handleErrored.current(),
      size,
      stoken,
      hl,
      badge,
      isolated,
    });
  };

  const saveCaptchaElement = useCallback((element: HTMLDivElement | null) => {
    if (element == null) return;
    renderCaptcha.current(element);
  }, []);

  useEffect(() => {
    if (state.requiresExecution) state.execute();
  }, []);

  return (
    <div ref={saveCaptchaElement} className={className} />
  );
});

// export class ReCAPTCHA2 extends React.Component {
//   constructor() {
//     super();
//     this.handleExpired = this.handleExpired.bind(this);
//     this.handleErrored = this.handleErrored.bind(this);
//     this.handleChange = this.handleChange.bind(this);
//     this.handleRecaptchaRef = this.handleRecaptchaRef.bind(this);
//   }

//   getValue() {
//     if (this.props.grecaptcha && this._widgetId !== undefined) {
//       return this.props.grecaptcha.enterprise.getResponse(this._widgetId);
//     }
//     return null;
//   }

//   getWidgetId() {
//     if (this.props.grecaptcha && this._widgetId !== undefined) {
//       return this._widgetId;
//     }
//     return null;
//   }

//   execute() {
//     const { grecaptcha } = this.props;

//     if (grecaptcha && this._widgetId !== undefined) {
//       return grecaptcha.enterprise.execute(this._widgetId);
//     } else {
//       this._executeRequested = true;
//     }
//   }

//   executeAsync() {
//     return new Promise((resolve, reject) => {
//       this.executionResolve = resolve;
//       this.executionReject = reject;
//       this.execute();
//     });
//   }

//   reset() {
//     if (this.props.grecaptcha && this._widgetId !== undefined) {
//       this.props.grecaptcha.enterprise.reset(this._widgetId);
//     }
//   }

//   forceReset() {
//     if (this.props.grecaptcha) {
//       this.props.grecaptcha.enterprise.reset();
//     }
//   }

//   handleExpired() {
//     if (this.props.onExpired) {
//       this.props.onExpired();
//     } else {
//       this.handleChange(null);
//     }
//   }

//   handleErrored() {
//     if (this.props.onErrored) {
//       this.props.onErrored();
//     }
//     if (this.executionReject) {
//       this.executionReject();
//       delete this.executionResolve;
//       delete this.executionReject;
//     }
//   }

//   handleChange(token) {
//     if (this.props.onChange) {
//       this.props.onChange(token);
//     }
//     if (this.executionResolve) {
//       this.executionResolve(token);
//       delete this.executionReject;
//       delete this.executionResolve;
//     }
//   }

//   explicitRender() {
//     // eslint-disable-next-line prettier/prettier
//     if (this.props.grecaptcha && this.props.grecaptcha.enterprise && this.props.grecaptcha.enterprise.render && this._widgetId === undefined) {
//       const wrapper = document.createElement("div");
//       this._widgetId = this.props.grecaptcha.enterprise.render(wrapper, {
//         sitekey: this.props.sitekey,
//         callback: this.handleChange,
//         theme: this.props.theme,
//         type: this.props.type,
//         tabindex: this.props.tabindex,
//         "expired-callback": this.handleExpired,
//         "error-callback": this.handleErrored,
//         size: this.props.size,
//         stoken: this.props.stoken,
//         hl: this.props.hl,
//         badge: this.props.badge,
//         isolated: this.props.isolated,
//       });
//       this.captcha.appendChild(wrapper);
//     }
//     if (this._executeRequested && this.props.grecaptcha && this._widgetId !== undefined) {
//       this._executeRequested = false;
//       this.execute();
//     }
//   }

//   componentDidMount() {
//     this.explicitRender();
//   }

//   componentDidUpdate() {
//     this.explicitRender();
//   }

//   handleRecaptchaRef(elem) {
//     this.captcha = elem;
//   }

//   render() {
//     // consume properties owned by the reCATPCHA, pass the rest to the div so the user can style it.
//     /* eslint-disable no-unused-vars */
//     const {
//       sitekey,
//       onChange,
//       theme,
//       type,
//       tabindex,
//       onExpired,
//       onErrored,
//       size,
//       stoken,
//       grecaptcha,
//       badge,
//       hl,
//       isolated,
//       ...childProps
//     } = this.props;
//     /* eslint-enable no-unused-vars */
//     return <div {...childProps} ref={this.handleRecaptchaRef} />;
//   }
// }

// ReCAPTCHA.displayName = "ReCAPTCHA";
// ReCAPTCHA.propTypes = {
//   sitekey: PropTypes.string.isRequired,
//   onChange: PropTypes.func,
//   grecaptcha: PropTypes.object,
//   theme: PropTypes.oneOf(["dark", "light"]),
//   type: PropTypes.oneOf(["image", "audio"]),
//   tabindex: PropTypes.number,
//   onExpired: PropTypes.func,
//   onErrored: PropTypes.func,
//   size: PropTypes.oneOf(["compact", "normal", "invisible"]),
//   stoken: PropTypes.string,
//   hl: PropTypes.string,
//   badge: PropTypes.oneOf(["bottomright", "bottomleft", "inline"]),
//   isolated: PropTypes.bool,
// };
// ReCAPTCHA.defaultProps = {
//   onChange: () => { },
//   theme: "light",
//   type: "image",
//   tabindex: 0,
//   size: "normal",
//   badge: "bottomright",
// };
