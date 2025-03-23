import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ContentTogglerProps {
  showFullContent: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

const ContentToggler = ({ showFullContent, onToggle }: ContentTogglerProps) => {
  return (
    <div className="px-6 pb-2 relative z-20">
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full text-muted-foreground relative z-20" 
        onClick={onToggle}
      >
        {showFullContent ? (
          <span className="flex items-center gap-1">
            <ChevronUp className="h-4 w-4" /> 折りたたむ
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <ChevronDown className="h-4 w-4" /> 全文を表示
          </span>
        )}
      </Button>
    </div>
  );
};

export default ContentToggler;
