interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = 'Finding the top-rated products for you…',
}: LoadingStateProps) {
  return (
    <div className="feedback-panel loading-panel" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
