
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import PostDetail from "./pages/PostDetail";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import AllPosts from "./pages/AllPosts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="tech-talk-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/posts/:type" element={<AllPosts />} />
            <Route path="/posts" element={<AllPosts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
