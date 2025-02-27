
import { useState, ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreatePostFormProps {
  channelId: string | null;
  onPostCreated: () => void;
}

const CreatePostForm = ({ channelId, onPostCreated }: CreatePostFormProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = [...images];
      for (let i = 0; i < e.target.files.length; i++) {
        if (newImages.length < 3) {
          const file = e.target.files[i];
          newImages.push(URL.createObjectURL(file));
        }
      }
      setImages(newImages);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("タイトルを入力してください");
      return;
    }

    if (!content.trim()) {
      toast.error("内容を入力してください");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      toast.success("投稿が作成されました！");
      setTitle("");
      setContent("");
      setImages([]);
      setIsSubmitting(false);
      onPostCreated();
    }, 1000);
  };

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Input
              placeholder="タイトル"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium"
            />
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
            <TabsList className="mb-2">
              <TabsTrigger value="write">書く</TabsTrigger>
              <TabsTrigger value="preview">プレビュー</TabsTrigger>
            </TabsList>
            <TabsContent value="write">
              <Textarea
                placeholder="マークダウン形式で書くことができます..."
                className="min-h-[100px] resize-none font-mono"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="preview" className="min-h-[100px]">
              <div className="rounded-md border p-4 prose prose-sm dark:prose-invert max-w-none">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">プレビューする内容がありません</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {images.map((src, index) => (
                <div key={index} className="relative rounded-md overflow-hidden">
                  <img src={src} alt="アップロードプレビュー" className="h-24 w-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t p-3">
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex gap-1"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <Upload className="h-4 w-4" />
              <span>アップロード</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </Button>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "投稿中..." : "投稿"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostForm;
