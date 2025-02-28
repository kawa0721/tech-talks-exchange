
import { MessageSquare } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AuthHeader = () => {
  return (
    <CardHeader className="space-y-1">
      <div className="flex justify-center mb-4">
        <div className="rounded-md bg-primary p-2">
          <MessageSquare className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>
      <CardTitle className="text-2xl text-center">テックトーク</CardTitle>
      <CardDescription className="text-center">
        テクノロジーコミュニティへようこそ
      </CardDescription>
    </CardHeader>
  );
};

export default AuthHeader;
