import Logo from '../../components/common/Logo'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-6 bg-white">
      <Logo size="lg" />
      <div className="w-40 h-1 rounded-full bg-ash-200 overflow-hidden">
        <div className="h-full w-1/3 bg-rescue-500 rounded-full animate-[dashMove_1s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}
