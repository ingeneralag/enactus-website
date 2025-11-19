import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import JoinForm from "./pages/JoinForm";
import ProjectSupportForm from "./pages/ProjectSupportForm";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import GroupsView from "./pages/GroupsView";
import ProjectSupportAdmin from "./pages/ProjectSupportAdmin";
import AllGroups from "./pages/AllGroups";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/join" element={<JoinForm />} />
            <Route path="/project-support/register" element={<ProjectSupportForm />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/groups" element={<GroupsView />} />
            <Route path="/admin/project-applications" element={<ProjectSupportAdmin />} />
            <Route path="/all-groups" element={<AllGroups />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
