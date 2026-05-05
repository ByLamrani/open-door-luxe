import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Wallet, Heart, ShoppingBag, History, Edit2, Save, ArrowLeft, Plus, Minus, Camera, CreditCard, Loader2, Link2, Gift, Bell, Trash2, Store, Sparkles, BadgeCheck } from "lucide-react";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { useNavigate, Link, useLocation } from "react-router-dom";
import WearTimePredictor from "@/components/WearTimePredictor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DepositModal from "@/components/DepositModal";
import SavedCardSection from "@/components/SavedCardSection";
import { getProductById } from "@/data/products";
import WalletTopUp from "@/components/wallet/WalletTopUp";
import VerificationUpload from "@/components/verification/VerificationUpload";

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  home_address: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  account_type: string;
  subscription_tier?: string;
  subscription_expires_at?: string | null;
  is_verified?: boolean;
}

interface WalletData {
  id: string;
  balance: number;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

interface Order {
  id: string;
  order_id: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
}

interface Favorite {
  id: string;
  product_id: string;
  created_at: string;
}

interface Reminder {
  id: string;
  occasion_name: string;
  occasion_date: string;
  product_name: string;
  recipient_name: string | null;
  created_at: string;
}

const countries = [
  "Morocco", "United States", "United Kingdom", "France", "Spain", "Germany", 
  "Italy", "Canada", "Australia", "UAE", "Saudi Arabia", "Qatar", "Other"
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  // Get initial tab from URL state or default to profile
  const initialTab = (location.state as any)?.tab || "profile";
  const [activeTab, setActiveTab] = useState<"profile" | "wallet" | "verification" | "purchases" | "favorites" | "media" | "reminders" | "dashboard">(initialTab);
  const [previousTab, setPreviousTab] = useState<"profile" | "wallet" | "verification" | "purchases" | "favorites" | "media" | "reminders" | "dashboard">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingMedia, setIsEditingMedia] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    phone: "",
    home_address: "",
    city: "",
    country: "Morocco",
    avatar_url: null,
    instagram_url: null,
    facebook_url: null,
    twitter_url: null,
    account_type: "buyer",
    subscription_tier: "free",
    subscription_expires_at: null,
  });
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeBusinessName, setUpgradeBusinessName] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchProfile();
    fetchWallet();
    fetchOrders();
    fetchFavorites();
    fetchReminders();
  }, [user, navigate]);

  const fetchReminders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("reminders" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("occasion_date", { ascending: true });
    if (data) setReminders(data as any);
  };

  const handleDeleteReminder = async (id: string) => {
    await supabase.from("reminders" as any).delete().eq("id", id);
    toast({ title: "Reminder Deleted" });
    fetchReminders();
  };

  // Track tab changes for back navigation
  const handleTabChange = (tab: "profile" | "wallet" | "verification" | "purchases" | "favorites" | "media" | "reminders" | "dashboard") => {
    if (tab === "dashboard") { navigate("/seller/dashboard"); return; }
    setPreviousTab(activeTab);
    setActiveTab(tab);
  };

  const handleBackClick = () => {
    // If we're on favorites and came from another tab, go back to that tab
    if (activeTab !== "profile") {
      setActiveTab(previousTab !== activeTab ? previousTab : "profile");
    } else {
      navigate("/");
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (data) {
      setProfile({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || "",
        home_address: data.home_address || "",
        city: data.city || "",
        country: data.country || "Morocco",
        avatar_url: data.avatar_url || null,
        instagram_url: data.instagram_url || null,
        facebook_url: data.facebook_url || null,
        twitter_url: data.twitter_url || null,
        account_type: (data as any).account_type || "buyer",
        subscription_tier: (data as any).subscription_tier || "free",
        subscription_expires_at: (data as any).subscription_expires_at || null,
        is_verified: (data as any).is_verified || false,
      });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ title: "Invalid file", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image smaller than 5MB", variant: "destructive" });
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: "Photo Updated", description: "Your profile photo has been updated" });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: "Upload Failed", description: error.message || "Failed to upload photo", variant: "destructive" });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const fetchWallet = async () => {
    if (!user) return;
    const { data: walletData } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (walletData) {
      setWallet(walletData);
      
      const { data: txData } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", walletData.id)
        .order("created_at", { ascending: false });
      
      if (txData) setTransactions(txData);
    }
  };

  const fetchOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data as Order[]);
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) setFavorites(data);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
        home_address: profile.home_address,
        city: profile.city,
        country: profile.country,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully" });
      setIsEditing(false);
    }
  };

  const handleSaveMedia = async () => {
    if (!user) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({
        instagram_url: profile.instagram_url || null,
        facebook_url: profile.facebook_url || null,
        twitter_url: profile.twitter_url || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Social Links Updated", description: "Your linked media has been saved" });
      setIsEditingMedia(false);
    }
  };

  const handleDeposit = async (amount: number) => {
    if (!wallet) return;

    const { error } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount: amount,
      transaction_type: "deposit",
      description: "Wallet deposit via card",
    });

    if (!error) {
      await supabase
        .from("wallets")
        .update({ balance: wallet.balance + amount })
        .eq("id", wallet.id);
      
      fetchWallet();
    } else {
      throw error;
    }
  };

  const handleWithdraw = async (amount: number) => {
    if (!wallet) return;

    const { error } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount: -amount,
      transaction_type: "withdrawal",
      description: "Wallet withdrawal to card",
    });

    if (!error) {
      await supabase
        .from("wallets")
        .update({ balance: wallet.balance - amount })
        .eq("id", wallet.id);
      
      fetchWallet();
    } else {
      throw error;
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    await supabase.from("favorites").delete().eq("id", favoriteId);
    toast({ title: "Removed from Favorites" });
    fetchFavorites();
  };

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Account", icon: User },
    ...(profile.account_type === "seller" || profile.account_type === "shipping_company"
      ? [{ id: "dashboard", label: "Dashboard", icon: BarChart3 }]
      : []),
    { id: "wallet", label: "E-Wallet", icon: Wallet },
    { id: "verification", label: "Verification", icon: BadgeCheck },
    { id: "purchases", label: "Purchases", icon: ShoppingBag },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "media", label: "Linked Media", icon: Link2 },
    { id: "reminders", label: "Gift Reminders", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors font-body"
            >
              <ArrowLeft className="w-4 h-4" />
              {activeTab === "profile" ? "Back to Home" : "Back"}
            </button>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-4xl text-foreground mb-8"
          >
            My <span className="text-gradient-gold">Profile</span>
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-lg border border-border p-4"
              >
                {/* Profile Photo */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-3xl font-display text-primary-foreground">
                        {profile.full_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="absolute bottom-0 right-0 p-2 bg-card border border-border rounded-full hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <h3 className="font-display text-lg text-foreground">{profile.full_name}</h3>
                    {profile.is_verified && (
                      <span
                        title="Verified account"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
                      >
                        <BadgeCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-muted-foreground">{profile.email}</p>
                  {!profile.is_verified && (
                    <Button
                      variant="gold"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => handleTabChange("verification")}
                    >
                      <BadgeCheck className="w-4 h-4 mr-2" /> Verify Now
                    </Button>
                  )}
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? "bg-gold/10 text-gold"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-body">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-lg border border-border p-6"
              >
                {activeTab === "profile" && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl text-foreground">Account Information</h2>
                      <Button
                        variant={isEditing ? "gold" : "outline"}
                        size="sm"
                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      >
                        {isEditing ? (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        ) : (
                          <>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={profile.full_name}
                          onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={profile.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={profile.phone || ""}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                          placeholder="+212 6XX XXX XXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={profile.city || ""}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Home Address</Label>
                        <Input
                          value={profile.home_address || ""}
                          onChange={(e) => setProfile({ ...profile, home_address: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <select
                          value={profile.country || "Morocco"}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                          disabled={!isEditing}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm disabled:opacity-50"
                        >
                          {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Account Type & Subscription */}
                    <div className="border border-border rounded-xl p-5 mb-6 bg-muted/30">
                      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Account Type</p>
                          <p className="font-display text-lg capitalize text-gold">{profile.account_type.replace("_", " ")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Plan</p>
                          <p className="font-display text-lg capitalize">
                            {profile.subscription_tier === "free" ? "Free" : profile.subscription_tier === "seller_pro" ? "Vanta Connect Pro" : "Vanta Connect"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.account_type === "buyer" && (
                          <Button variant="gold" size="sm" onClick={() => setShowUpgrade(!showUpgrade)}>
                            <Store className="w-4 h-4 mr-2" /> Become a Seller
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setShowPlans(!showPlans)}>
                          <Sparkles className="w-4 h-4 mr-2" /> {profile.subscription_tier === "free" ? "Upgrade Plan" : "Manage Plan"}
                        </Button>
                      </div>

                      {showUpgrade && profile.account_type === "buyer" && (
                        <div className="mt-4 space-y-2">
                          <Label>Business Name (optional)</Label>
                          <Input value={upgradeBusinessName} onChange={(e) => setUpgradeBusinessName(e.target.value)} placeholder="Your brand or business" />
                          <Button
                            variant="gold"
                            size="sm"
                            disabled={upgrading}
                            onClick={async () => {
                              setUpgrading(true);
                              const { error } = await supabase.rpc("upgrade_to_seller" as any, { _business_name: upgradeBusinessName || null });
                              setUpgrading(false);
                              if (error) {
                                toast({ title: "Upgrade failed", description: error.message, variant: "destructive" });
                              } else {
                                toast({ title: "You're now a Seller 🎉", description: "Your dashboard is unlocked." });
                                setShowUpgrade(false);
                                fetchProfile();
                              }
                            }}
                          >
                            {upgrading ? "Upgrading..." : "Confirm Upgrade"}
                          </Button>
                        </div>
                      )}

                      {showPlans && (
                        <div className="mt-4">
                          <SubscriptionPlans
                            accountType={profile.account_type as any}
                            onSelected={() => { setShowPlans(false); fetchProfile(); }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Saved Card Section */}
                    <SavedCardSection />
                  </>
                )}

                {activeTab === "wallet" && (
                  <>
                    <h2 className="font-display text-xl text-foreground mb-6">My E-Wallet</h2>

                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-gold-light to-gold rounded-xl p-6 text-primary-foreground mb-6">
                      <p className="text-sm opacity-90 mb-1">Current Balance</p>
                      <p className="font-display text-4xl">${wallet?.balance.toFixed(2) || "0.00"}</p>
                    </div>

                    {/* PayPal Top-up + Verification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <WalletTopUp />
                      <VerificationUpload accountType="seller" />
                    </div>

                    {/* Deposit / Withdraw Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <Button
                        variant="gold"
                        size="lg"
                        className="w-full"
                        onClick={() => setShowDepositModal(true)}
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Deposit Funds
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => setShowWithdrawModal(true)}
                      >
                        <Minus className="w-5 h-5 mr-2" />
                        Withdraw Funds
                      </Button>
                    </div>

                    {/* Transactions History */}
                    <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Transaction History
                    </h3>
                    {transactions.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No transactions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-body text-sm text-foreground capitalize">{tx.transaction_type}</p>
                              <p className="font-body text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleDateString()} • {tx.description || ""}
                              </p>
                            </div>
                            <span className={`font-display text-lg ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                              {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "purchases" && (
                  <>
                    <h2 className="font-display text-xl text-foreground mb-6">Purchase History</h2>
                    
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No purchases yet</p>
                        <Button variant="gold" asChild>
                          <Link to="/">Start Shopping</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-display text-lg text-gold">{order.order_id}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-display text-lg">${order.total.toFixed(2)}</p>
                                <span className={`text-xs px-2 py-1 rounded capitalize ${
                                  order.status === "delivered" ? "bg-green-500/10 text-green-500" :
                                  order.status === "shipped" ? "bg-blue-500/10 text-blue-500" :
                                  "bg-gold/10 text-gold"
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                              {Array.isArray(order.items) && order.items.slice(0, 4).map((item: any, i: number) => (
                                <img
                                  key={i}
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "favorites" && (
                  <>
                    <h2 className="font-display text-xl text-foreground mb-6">My Favorites</h2>
                    
                    {favorites.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No favorites yet</p>
                        <Button variant="gold" asChild>
                          <Link to="/">Explore Products</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {favorites.map((fav) => {
                          const product = getProductById(fav.product_id);
                          return (
                            <div key={fav.id} className="border border-border rounded-lg overflow-hidden relative group">
                              <button
                                onClick={() => handleRemoveFavorite(fav.id)}
                                className="absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Heart className="w-3 h-3 fill-current" />
                              </button>
                              <Link to={`/product/${fav.product_id}`}>
                                {product ? (
                                  <>
                                    <div className="aspect-square overflow-hidden">
                                      <img 
                                        src={product.image} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="p-3">
                                      <p className="font-body text-sm text-foreground truncate">{product.name}</p>
                                      <p className="text-gold font-display">${(product.price * 0.95).toFixed(2)}</p>
                                    </div>
                                  </>
                                ) : (
                                  <div className="p-3">
                                    <p className="font-body text-sm text-foreground">Product #{fav.product_id}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Added {new Date(fav.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                )}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {activeTab === "media" && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl text-foreground">My Linked Media</h2>
                      <Button
                        variant={isEditingMedia ? "gold" : "outline"}
                        size="sm"
                        onClick={() => isEditingMedia ? handleSaveMedia() : setIsEditingMedia(true)}
                      >
                        {isEditingMedia ? (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        ) : (
                          <>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram
                        </Label>
                        <Input
                          value={profile.instagram_url || ""}
                          onChange={(e) => setProfile({ ...profile, instagram_url: e.target.value })}
                          disabled={!isEditingMedia}
                          placeholder="https://instagram.com/yourusername"
                        />
                        {profile.instagram_url && !isEditingMedia && (
                          <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline">
                            Visit Profile →
                          </a>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </Label>
                        <Input
                          value={profile.facebook_url || ""}
                          onChange={(e) => setProfile({ ...profile, facebook_url: e.target.value })}
                          disabled={!isEditingMedia}
                          placeholder="https://facebook.com/yourusername"
                        />
                        {profile.facebook_url && !isEditingMedia && (
                          <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline">
                            Visit Profile →
                          </a>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          X (Twitter)
                        </Label>
                        <Input
                          value={profile.twitter_url || ""}
                          onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                          disabled={!isEditingMedia}
                          placeholder="https://x.com/yourusername"
                        />
                        {profile.twitter_url && !isEditingMedia && (
                          <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gold hover:underline">
                            Visit Profile →
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "reminders" && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-xl text-foreground">Gift Reminders</h2>
                      <Gift className="w-5 h-5 text-gold" />
                    </div>

                    <p className="text-sm text-muted-foreground font-body mb-6">
                      We remember your special occasions and suggest the perfect complementary gifts one month before the date.
                    </p>

                    {reminders.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">No reminders set yet</p>
                        <p className="text-sm text-muted-foreground">When you make a purchase, we'll ask if it's a gift so we can remind you next year!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reminders.map((reminder) => {
                          const occasionDate = new Date(reminder.occasion_date);
                          const today = new Date();
                          const daysUntil = Math.ceil((occasionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                          const isUpcoming = daysUntil > 0 && daysUntil <= 30;

                          return (
                            <div key={reminder.id} className={`flex items-center justify-between p-4 rounded-lg border ${isUpcoming ? "border-gold/50 bg-gold/5" : "border-border"}`}>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-display text-sm text-foreground">{reminder.occasion_name}</span>
                                  {isUpcoming && (
                                    <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">Coming up!</span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground font-body mt-1">
                                  {occasionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                                  {reminder.recipient_name && ` • For ${reminder.recipient_name}`}
                                </p>
                                <p className="text-xs text-muted-foreground font-body">
                                  Last gift: {reminder.product_name}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteReminder(reminder.id)}
                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={handleDeposit}
        type="deposit"
      />

      {/* Withdraw Modal */}
      <DepositModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={handleWithdraw}
        type="withdraw"
        currentBalance={wallet?.balance || 0}
      />
    </div>
  );
};

export default ProfilePage;
