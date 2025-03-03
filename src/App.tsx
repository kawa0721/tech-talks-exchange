
// Import the migration utility
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import PostDetail from "./pages/PostDetail";
import AllPosts from "./pages/AllPosts";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import UserProfile from "./pages/UserProfile";
import ProfileRedirect from "./pages/ProfileRedirect";
import NotFound from "./pages/NotFound";
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
            <Route path="/channel/:channelId" element={<AllPosts />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/profile" element={<ProfileRedirect />} />
            <Route path="/settings" element={<ProfileRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
