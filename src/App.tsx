
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import AllPosts from "@/pages/AllPosts";
import PostDetail from "@/pages/PostDetail";
import NotFound from "@/pages/NotFound";
import UserProfile from "@/pages/UserProfile";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <div className="flex min-h-screen flex-col">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/channel/:channelId" element={<AllPosts />} />
              <Route path="/post/:postId" element={<PostDetail />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
