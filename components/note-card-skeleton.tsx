import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NoteCardSkeleton() {
  return (
    <Card className="animate-pulse flex-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-4 w-28" />
      </CardFooter>
    </Card>
  );
}
