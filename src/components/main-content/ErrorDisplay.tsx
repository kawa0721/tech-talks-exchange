
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
