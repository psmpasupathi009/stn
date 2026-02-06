const LOADING_IMAGE = '/stn loading image.png'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white [contain:paint]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOADING_IMAGE}
        alt="Loading"
        decoding="async"
        fetchPriority="high"
        className="h-36 w-auto sm:h-44 md:h-52 object-contain animate-pulse opacity-90"
      />
    </div>
  )
}
