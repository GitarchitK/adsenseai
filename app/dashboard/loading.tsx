// Pure CSS skeleton — no external dependencies, matches dashboard layout exactly

function Bone({ className }: { className: string }) {
  return (
    <div
      className={`rounded-lg bg-muted relative overflow-hidden ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.6s ease-in-out infinite',
      }}
    />
  )
}

export default function DashboardLoading() {
  return (
    <>
      {/* Inject keyframe once */}
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-7">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Bone className="h-8 w-44" />
              <Bone className="h-4 w-56" />
            </div>
            <Bone className="h-10 w-40 rounded-xl" />
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border border-border/60 bg-card space-y-3">
                <div className="flex items-center gap-3">
                  <Bone className="h-9 w-9 rounded-xl flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Bone className="h-3 w-16" />
                    <Bone className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Scan card ── */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xl shadow-primary/5">
            {/* colour bar */}
            <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 opacity-40" />
            <div className="p-7 space-y-5">
              {/* title row */}
              <div className="flex items-start gap-4">
                <Bone className="h-11 w-11 rounded-xl flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Bone className="h-5 w-48" />
                  <Bone className="h-3.5 w-72" />
                </div>
              </div>
              {/* input row */}
              <div className="flex gap-3">
                <Bone className="h-12 flex-1 rounded-xl" />
                <Bone className="h-12 w-28 rounded-xl" />
              </div>
              {/* what you get */}
              <div className="pt-4 border-t border-border/60 space-y-3">
                <Bone className="h-3 w-24" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Bone className="h-4 w-4 rounded-full flex-shrink-0" />
                      <Bone className="h-3.5 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Feature cards ── */}
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border/60 bg-card space-y-3">
                <div className="flex items-start gap-4">
                  <Bone className="h-12 w-12 rounded-xl flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Bone className="h-4 w-36" />
                    <Bone className="h-3 w-full" />
                    <Bone className="h-3 w-4/5" />
                    <Bone className="h-3 w-24 mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Recent scans ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Bone className="h-5 w-32" />
              <Bone className="h-4 w-16" />
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-2xl border border-border/60 bg-card">
                <div className="flex items-center gap-4">
                  <Bone className="h-10 w-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Bone className="h-4 w-48" />
                    <Bone className="h-3 w-28" />
                  </div>
                  <Bone className="h-10 w-10 rounded-full flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>

          {/* ── Quick links ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card space-y-2">
                <div className="flex items-center gap-3">
                  <Bone className="h-9 w-9 rounded-xl flex-shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Bone className="h-4 w-24" />
                    <Bone className="h-3 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}
