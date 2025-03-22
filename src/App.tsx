// Import the migration utility
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import PostDetail from "./pages/PostDetail";
import AllPosts from "./pages/AllPosts";
import AllPostsPage from "./pages/AllPostsPage";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import UserProfile from "./pages/UserProfile";
import ProfileRedirect from "./pages/ProfileRedirect";
import NotFound from "./pages/NotFound";
import CreatePost from "./pages/CreatePost";
import { migrateChannelsData } from "./utils/migrateChannelsData";
import "./App.css";

function App() {
  // Call the migration function when the app starts
  useEffect(() => {
    migrateChannelsData();
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/posts" element={<AllPostsPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<ProfileRedirect />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/channels/:channelId/:type?" element={<AllPosts />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
