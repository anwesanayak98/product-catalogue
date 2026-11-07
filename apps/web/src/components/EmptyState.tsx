interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'New favourites are on the way',
  message = 'There aren’t any featured products to show right now. Please check back soon.',
}: EmptyStateProps) {
  return (
    <div className="feedback-panel empty-panel">
      <span className="empty-sparkle" aria-hidden="true">
        ✳
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
