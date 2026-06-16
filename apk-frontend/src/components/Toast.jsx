const Toast = ({ message, isError }) => (
  <div className={`toast ${isError ? 'error' : 'success'}`} role="status" aria-live="polite">
    <i className={`ti ${isError ? 'ti-alert-circle' : 'ti-check'}`} aria-hidden="true" />
    {message}
  </div>
);

export default Toast;