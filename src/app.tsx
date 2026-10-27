import { Navigate, Route, Routes } from "react-router-dom";
import { AboutPage } from "./pages/about-page";
import { DonatePage } from "./pages/donate-page";
import { FriendsPage } from "./pages/friends-page";
import { DeleteAccountPage } from "./pages/legal/delete-account-page";
import { PrivacyPage } from "./pages/legal/privacy-page";
import { TermsPage } from "./pages/legal/terms-page";
import { LoginPage } from "./pages/login-page";
import { HomePage } from "./pages/home-page";
import { LearnPage } from "./pages/learn-page";
import { ProfilePage } from "./pages/profile-page";
import { ReviewPage } from "./pages/review-page";
import { AdminDashboard } from "./features/admin/admin-dashboard";
import { AdminRoute } from "./routes/admin-route";
import { ProtectedRoute } from "./routes/protected-route";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/delete-account" element={<DeleteAccountPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/donate" element={<DonatePage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/learn/:collectionSlug" element={<LearnPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
