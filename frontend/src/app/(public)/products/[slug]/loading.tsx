import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="bg-base-200/30 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-4 w-16" />
          <span className="text-base-content/20">/</span>
          <Skeleton className="h-4 w-16" />
          <span className="text-base-content/20">/</span>
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Image Skeleton */}
          <div className="lg:col-span-7">
            <Skeleton className="w-full aspect-square rounded-2xl" />
            <div className="flex mt-4 space-x-4 overflow-hidden">
                <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
                <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
                <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
            </div>
          </div>

          {/* Right Column: Content Skeleton */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200">
              <Skeleton className="h-10 w-3/4 mb-4" />
              
              <div className="flex items-center space-x-4 mt-4 border-b border-base-200 pb-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="py-6">
                <Skeleton className="h-12 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>

              <div className=" rounded-xl p-4 mb-6">
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>

              <div className="bg-base-200/50 rounded-xl p-5 border border-base-200">
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="mt-12 bg-base-100 rounded-2xl p-6 md:p-8 shadow-sm border border-base-200">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

      </div>
    </div>
  );
}
