export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-black" />
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    </div>
  )
}