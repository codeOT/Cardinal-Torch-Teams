interface LoadingSpinnerProps {
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  label = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function PageLoading({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner label={label} />
    </div>
  );
}
