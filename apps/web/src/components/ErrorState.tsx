interface ErrorStateProps {
  onRetry: () => void;
  isRetrying: boolean;
  title?: string;
  message?: string;
}

export function ErrorState({
  onRetry,
  isRetrying,
  title = 'We couldn’t load the featured products',
  message = 'Please check your connection and confirm VITE_API_URL points to the backend.',
}: ErrorStateProps) {
  return (
    <div className="feedback-panel error-panel" role="alert">
      <span className="feedback-icon" aria-hidden="true">
        !
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      <button className="retry-button" type="button" onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? 'Trying again…' : 'Try again'}
      </button>
    </div>
  );
}
