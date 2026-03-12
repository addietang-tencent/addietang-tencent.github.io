import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserRoleProvider } from "./contexts/UserRoleContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Landing
import LandingPage from "./pages/LandingPage";

// Tenant
import MyOpenClaw from "./pages/tenant/MyOpenClaw";
import OpenClawDetail from "./pages/tenant/OpenClawDetail";
import ModelQuota from "./pages/tenant/ModelQuota";
import HelpDocs from "./pages/tenant/HelpDocs";
import ResetPassword from "./pages/tenant/ResetPassword";

// Admin
import BasicInfo from "./pages/admin/BasicInfo";
import MemberManagement from "./pages/admin/MemberManagement";
import ModelConfig from "./pages/admin/ModelConfig";
import ChannelConfig from "./pages/admin/ChannelConfig";
import SkillConfig from "./pages/admin/SkillConfig";
import DocManagement from "./pages/admin/DocManagement";
import ImageManagement from "./pages/admin/ImageManagement";
import SecurityGroupManagement from "./pages/admin/SecurityGroupManagement";
import OpenClawMonitor from "./pages/admin/OpenClawMonitor";
import TokensMonitor from "./pages/admin/TokensMonitor";
import AuditLog from "./pages/admin/AuditLog";

function Router() {
  return (
    <Switch>
      {/* Landing Page - 公开访问 */}
      <Route path="/" component={LandingPage} />

      {/* Tenant Routes - 需要登录 */}
      <Route path="/my-openclaw">
        <ProtectedRoute><MyOpenClaw /></ProtectedRoute>
      </Route>
      <Route path="/openclaw/:id">
        {(params) => (
          <ProtectedRoute><OpenClawDetail /></ProtectedRoute>
        )}
      </Route>
      <Route path="/model-quota">
        <ProtectedRoute><ModelQuota /></ProtectedRoute>
      </Route>
      <Route path="/help-docs">
        <ProtectedRoute><HelpDocs /></ProtectedRoute>
      </Route>
      <Route path="/reset-password">
        <ProtectedRoute><ResetPassword /></ProtectedRoute>
      </Route>

      {/* Admin Routes - 需要登录且为管理员 */}
      <Route path="/admin/basic-info">
        <ProtectedRoute requireAdmin><BasicInfo /></ProtectedRoute>
      </Route>
      <Route path="/admin/members">
        <ProtectedRoute requireAdmin><MemberManagement /></ProtectedRoute>
      </Route>
      <Route path="/admin/model-config">
        <ProtectedRoute requireAdmin><ModelConfig /></ProtectedRoute>
      </Route>
      <Route path="/admin/channel-config">
        <ProtectedRoute requireAdmin><ChannelConfig /></ProtectedRoute>
      </Route>
      <Route path="/admin/skill-config">
        <ProtectedRoute requireAdmin><SkillConfig /></ProtectedRoute>
      </Route>
      <Route path="/admin/doc-management">
        <ProtectedRoute requireAdmin><DocManagement /></ProtectedRoute>
      </Route>
      <Route path="/admin/image-management">
        <ProtectedRoute requireAdmin><ImageManagement /></ProtectedRoute>
      </Route>
      <Route path="/admin/security-group">
        <ProtectedRoute requireAdmin><SecurityGroupManagement /></ProtectedRoute>
      </Route>
      <Route path="/admin/openclaw-monitor">
        <ProtectedRoute requireAdmin><OpenClawMonitor /></ProtectedRoute>
      </Route>
      <Route path="/admin/tokens-monitor">
        <ProtectedRoute requireAdmin><TokensMonitor /></ProtectedRoute>
      </Route>
      <Route path="/admin/audit-log">
        <ProtectedRoute requireAdmin><AuditLog /></ProtectedRoute>
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <UserRoleProvider>
          <TooltipProvider>
            <Toaster position="top-right" />
            <Router />
          </TooltipProvider>
        </UserRoleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
