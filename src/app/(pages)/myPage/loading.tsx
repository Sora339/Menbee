export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-spin"></div>
          <div className="absolute inset-1  rounded-full bg-slate-900"></div>
        </div>
        <p className="mt-4 text-gray-600">カレンダーイベントを読み込み中...</p>
      </div>
    </div>
  );
}