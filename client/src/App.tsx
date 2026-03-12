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

      {/* Admin Routes */}
      <Route path="/admin/basic-info" component={BasicInfo} />
      <Route path="/admin/members" component={MemberManagement} />
      <Route path="/admin/model-config" component={ModelConfig} />
      <Route path="/admin/channel-config" component={ChannelConfig} />
      <Route path="/admin/skill-config" component={SkillConfig} />
      <Route path="/admin/image-management" component={ImageManagement} />
      <Route path="/admin/security-group" component={SecurityGroupManagement} />
      <Route path="/admin/openclaw-monitor" component={OpenClawMonitor} />
      <Route path="/admin/tokens-monitor" component={TokensMonitor} />
      <Route path="/admin/audit-log" component={AuditLog} />

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
