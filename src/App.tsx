import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
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
import SellerDashboard from "./pages/SellerDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
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
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/new" element={<CategoryPage category="New Arrivals" />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/why-us" element={<WhyUsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/collections" element={<CollectionsPage />} />
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
