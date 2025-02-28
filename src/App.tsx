
import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import ChannelList from "@/components/ChannelList";
import { Separator } from "@/components/ui/separator";
import Index from "@/pages/Index";
import AllPosts from "@/pages/AllPosts";
import PostDetail from "@/pages/PostDetail";
import NotFound from "@/pages/NotFound";
import UserProfile from "@/pages/UserProfile";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/AuthCallback";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import "./App.css";

function App() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <div className="flex min-h-screen flex-col">
            <Navbar onToggleSidebar={toggleSidebar} />
            <div className="flex flex-1">
              <div
                className={`border-r w-64 lg:w-80 shrink-0 lg:block ${
                  sidebarOpen ? "fixed inset-y-0 mt-16 z-30 bg-background w-64 lg:static" : "hidden"
                }`}
              >
                <ChannelList
                  selectedChannel={selectedChannel}
                  onSelectChannel={setSelectedChannel}
                />
              </div>
              <div className="flex-1">
                <Separator orientation="vertical" />
                <div className="container py-4">
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
              </div>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
