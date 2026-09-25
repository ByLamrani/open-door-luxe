import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import ReferralCapture from "@/components/ReferralCapture";
import AIChatbot from "@/components/AIChatbot";

import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import WhyUsPage from "./pages/WhyUsPage";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import TrackOrderPage from "./pages/TrackOrderPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CollectionsPage from "./pages/CollectionsPage";
import AdminPanel from "./pages/AdminPanel";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

/** backoffice.yoursite.com serves only the back office. */
const isBackofficeHost = typeof window !== "undefined" && window.location.hostname.startsWith("backoffice.");

const BackofficeRoutes = () => (
  <Routes>
    <Route path="/login" element={<AdminLogin />} />
    <Route path="*" element={<ProtectedRoute requiredRole="admin" redirectTo="/login"><AdminPanel /></ProtectedRoute>} />
  </Routes>
);

/** The back office runs as a standalone console — no storefront widgets. */
const StorefrontWidgets = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return null;
  return <AIChatbot />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AuthProvider>
        <CurrencyProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {isBackofficeHost ? <BackofficeRoutes /> : (<>
              <ReferralCapture />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/self-care" element={<CategoryPage category="Self-Care" />} />
                <Route path="/self-care/tondeuse" element={<CategoryPage category="Self-Care" subcategory="Tondeuse" />} />
                <Route path="/self-care/spa" element={<CategoryPage category="Self-Care" subcategory="Pack de Soin/SPA" />} />
                <Route path="/self-care/massage" element={<CategoryPage category="Self-Care" subcategory="Articles de Massage" />} />
                <Route path="/fragrances" element={<CategoryPage category="Fragrances" />} />
                <Route path="/fragrances/men" element={<CategoryPage category="Fragrances" subcategory="For Men" />} />
                <Route path="/fragrances/women" element={<CategoryPage category="Fragrances" subcategory="For Women" />} />
                <Route path="/air-diffusers" element={<CategoryPage category="Air Diffusers" />} />
                <Route path="/watches" element={<CategoryPage category="Watches" />} />
                <Route path="/watches/men" element={<CategoryPage category="Watches" subcategory="For Men" />} />
                <Route path="/watches/women" element={<CategoryPage category="Watches" subcategory="For Women" />} />
                {/* Explore clusters */}
                <Route path="/luxury-lifestyle" element={<CategoryPage clusterPath="/luxury-lifestyle" />} />
                <Route path="/tech-gear" element={<CategoryPage clusterPath="/tech-gear" />} />
                <Route path="/wellness-beauty" element={<CategoryPage clusterPath="/wellness-beauty" />} />
                <Route path="/art-living" element={<CategoryPage clusterPath="/art-living" />} />
                <Route path="/home-living" element={<CategoryPage clusterPath="/home-living" />} />
                <Route path="/fashion-accessories" element={<CategoryPage clusterPath="/fashion-accessories" />} />
                {/* Leaf categories */}
                <Route path="/jewelry" element={<CategoryPage category="Jewelry" />} />
                <Route path="/bags" element={<CategoryPage category="Bags" />} />
                <Route path="/eyewear" element={<CategoryPage category="Eyewear" />} />
                <Route path="/home-electronics" element={<CategoryPage category="Home Electronics" />} />
                <Route path="/home-decor" element={<CategoryPage category="Home Decor" />} />
                <Route path="/lighting" element={<CategoryPage category="Lighting" />} />
                <Route path="/housing-furniture" element={<CategoryPage category="Housing Furniture" />} />
                <Route path="/kitchen-tools" element={<CategoryPage category="Kitchen Tools" />} />
                <Route path="/bedroom" element={<CategoryPage category="Bedroom" />} />
                <Route path="/bath-linen" element={<CategoryPage category="Bath & Linen" />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/new" element={<CategoryPage category="New Arrivals" />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/why-us" element={<WhyUsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <StorefrontWidgets />
              </>)}
            </BrowserRouter>

          </TooltipProvider>
        </CartProvider>
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
