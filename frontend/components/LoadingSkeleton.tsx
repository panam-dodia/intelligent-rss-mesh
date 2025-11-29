export default function LoadingSkeleton() {
  return (
    <div className="haunted-card animate-pulse">
      <div className="h-6 bg-gray-800 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-800 rounded w-2/3"></div>
    </div>
  );
}