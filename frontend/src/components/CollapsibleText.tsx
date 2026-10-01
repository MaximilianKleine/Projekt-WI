import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapsibleTextProps {
  text: string;
  maxLength?: number;
}

export function CollapsibleText({
  text,
  maxLength = 800,
}: CollapsibleTextProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > maxLength;

  return (
    <div className="relative">
      <div className="whitespace-pre-wrap leading-7">
        {expanded || !isLong ? text : text.slice(0, maxLength) + "…"}
      </div>

      {isLong && !expanded && (
        <div className="absolute bottom-10 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      )}

      {isLong && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 flex items-center gap-1"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? (
            <>
              Weniger anzeigen <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Mehr anzeigen <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
