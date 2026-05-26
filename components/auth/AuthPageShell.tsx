interface AuthPageShellProps {
  children: React.ReactNode;
}

/** Full-viewport scrollable wrapper for login/signup (body uses overflow-hidden for the app shell). */
export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="h-dvh min-h-screen overflow-y-auto overscroll-y-contain bg-slate-50">
      <div className="flex min-h-full items-center justify-center px-4 py-8 sm:py-12">
        {children}
      </div>
    </div>
  );
}
