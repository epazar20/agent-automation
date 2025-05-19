import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  className?: string;
}

export function LoadingOverlay({ className }: LoadingOverlayProps) {
  return (
    <div className={cn(
      "absolute inset-0 bg-background/50 backdrop-blur-[2px] rounded-lg z-50",
      "flex items-center justify-center",
      className
    )}>
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-muted-foreground/20" />
        
        {/* Spinning inner ring */}
        <div className="w-8 h-8 rounded-full border-4 border-primary/80 border-t-transparent animate-spin" />
      </div>
    </div>
  );
} 