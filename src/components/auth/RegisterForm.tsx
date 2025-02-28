
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isSubmitting: boolean;
}

const RegisterForm = ({ onSubmit, isSubmitting }: RegisterFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "入力エラー",
        description: "メールアドレスとパスワードを入力してください",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "パスワードエラー",
        description: "パスワードは8文字以上で入力してください",
        variant: "destructive",
      });
      return;
    }
    
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          id="email-register"
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Input
          id="password-register"
          type="password"
          placeholder="パスワード (8文字以上)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
          minLength={8}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !email || !password}
      >
        {isSubmitting ? "登録中..." : "新規登録"}
      </Button>
    </form>
  );
};

export default RegisterForm;
