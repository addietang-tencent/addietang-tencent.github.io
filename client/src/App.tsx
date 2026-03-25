import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserRoleProvider } from "./contexts/UserRoleContext";

// Landing
import LandingPage from "./pages/LandingPage";

// Tenant
import MyOpenClaw from "./pages/tenant/MyOpenClaw";
import OpenClawDetail from "./pages/tenant/OpenClawDetail";
import ModelQuota from "./pages/tenant/ModelQuota";
import HelpDocs from "./pages/tenant/HelpDocs";
import ResetPassword from "./pages/tenant/ResetPassword";

// Admin
import AdminLayout from "./components/AdminLayout";
import BasicInfo from "./pages/admin/BasicInfo";
import MemberManagement from "./pages/admin/MemberManagement";
import ModelConfig from "./pages/admin/ModelConfig";
import ChannelConfig from "./pages/admin/ChannelConfig";
import SkillConfig from "./pages/admin/SkillConfig";
import ImageManagement from "./pages/admin/ImageManagement";
import SecurityGroupManagement from "./pages/admin/SecurityGroupManagement";
import OpenClawMonitor from "./pages/admin/OpenClawMonitor";
import TokensMonitor from "./pages/admin/TokensMonitor";
import AuditLog from "./pages/admin/AuditLog";
import SecurityManagement from "./pages/admin/SecurityManagement";
import SessionManagement from "./pages/admin/SessionManagement";
import SessionDetail from "./pages/admin/SessionDetail";
import OpsObservation from "./pages/admin/OpsObservation";
import MemoryManagement from "./pages/admin/MemoryManagement";
import FileManagement from "./pages/admin/FileManagement";

function Router() {
  return (
    <Switch>
      {/* Landing Page */}
      <Route path="/" component={LandingPage} />

      {/* Tenant Routes */}
      <Route path="/my-openclaw" component={MyOpenClaw} />
      <Route path="/openclaw/:id" component={OpenClawDetail} />
      <Route path="/model-quota" component={ModelQuota} />
      <Route path="/help-docs" component={HelpDocs} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Admin Routes - 使用顶层路由避免 wouter 嵌套路由匹配问题 */}
      <Route path="/admin/basic-info" component={() => <AdminLayout><BasicInfo /></AdminLayout>} />
      <Route path="/admin/members" component={() => <AdminLayout><MemberManagement /></AdminLayout>} />
      <Route path="/admin/model-config" component={() => <AdminLayout><ModelConfig /></AdminLayout>} />
      <Route path="/admin/channel-config" component={() => <AdminLayout><ChannelConfig /></AdminLayout>} />
      <Route path="/admin/skill-config" component={() => <AdminLayout><SkillConfig /></AdminLayout>} />
      <Route path="/admin/image-management" component={() => <AdminLayout><ImageManagement /></AdminLayout>} />
      <Route path="/admin/security-group" component={() => <AdminLayout><SecurityGroupManagement /></AdminLayout>} />
      <Route path="/admin/openclaw-monitor" component={() => <AdminLayout><OpenClawMonitor /></AdminLayout>} />
      <Route path="/admin/tokens-monitor" component={() => <AdminLayout><TokensMonitor /></AdminLayout>} />
      <Route path="/admin/security-management" component={() => <AdminLayout><SecurityManagement /></AdminLayout>} />
      <Route path="/admin/session/:id" component={({ params }) => <AdminLayout><SessionDetail params={params} /></AdminLayout>} />
      <Route path="/admin/session-management" component={() => <AdminLayout><SessionManagement /></AdminLayout>} />
      <Route path="/admin/ops-observation" component={() => <AdminLayout><OpsObservation /></AdminLayout>} />
      <Route path="/admin/audit-log" component={() => <AdminLayout><AuditLog /></AdminLayout>} />
      <Route path="/admin/memory-management" component={() => <AdminLayout><MemoryManagement /></AdminLayout>} />
      <Route path="/admin/file-management" component={() => <AdminLayout><FileManagement /></AdminLayout>} />

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
