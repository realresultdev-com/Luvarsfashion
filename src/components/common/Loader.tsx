export default function Loader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-amazon-btnOrange animate-spin" />
      </div>
      <span className="text-xs font-semibold text-gray-600 animate-pulse">{text}</span>
    </div>
  );
}
