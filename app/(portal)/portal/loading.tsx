export default function PortalLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-8 w-2/3 rounded bg-white/10" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 rounded-xl bg-white/5" />
        <div className="h-28 rounded-xl bg-white/5" />
      </div>
      <div className="space-y-2">
        <div className="h-14 rounded-lg bg-white/5" />
        <div className="h-14 rounded-lg bg-white/5" />
        <div className="h-14 rounded-lg bg-white/5" />
      </div>
    </div>
  );
}
