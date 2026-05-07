import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, DollarSign, TrendingUp, Package, AlertTriangle,
  ShoppingCart, Users, ArrowLeft, Wallet, History, Brain,
  Sparkles, Globe, RefreshCw, Bell, Eye, Loader2, Lock, Plug, Truck, ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency, CURRENCIES } from "@/context/CurrencyContext";
import SellerListings from "@/components/seller/SellerListings";
import AIInsightCommand from "@/components/seller/AIInsightCommand";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import SellerOrdersDashboard from "@/components/seller/SellerOrdersDashboard";
import ShippingJobsDashboard from "@/components/shipping/ShippingJobsDashboard";
import IntegrationsPanel from "@/components/integrations/IntegrationsPanel";
import { AIDocumentAnalyzer, AIProductGenerator } from "@/components/seller/AIStudio";

// (currency list now sourced from CurrencyContext.CURRENCIES)
const currencies = CURRENCIES;

const feeStructure = {
  normal: { label: "Standard", listingFee: 0.10 },
  premium: { label: "Premium", listingFee: 10.00 },
  elite: { label: "Elite", listingFee: 15.00 },
  transactionFee: 0.01,
  processingFee: 0.02,
  processingFixed: 0.15,
  aiFee: 0.03,
};

interface SellerMetrics {
  totalRevenue: number;
  netProfit: number;
  conversionRate: number;
  avgOrderValue: number;
  totalOrders: number;
  totalViews: number;
}

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { setCurrency, format } = useCurrency();
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "orders" | "shipping" | "finances" | "ai" | "apis" | "settings">("overview");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showPlans, setShowPlans] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [depositBalance, setDepositBalance] = useState(0);
  const [earningsBalance, setEarningsBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletFilter, setWalletFilter] = useState<"all" | "selling" | "deposit">("all");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string>("buyer");
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const [isVerified, setIsVerified] = useState(false);

  // Mock metrics (in production, these come from real data)
  const [metrics] = useState<SellerMetrics>({
    totalRevenue: 12450.00,
    netProfit: 9876.50,
    conversionRate: 3.2,
    avgOrderValue: 185.00,
    totalOrders: 67,
    totalViews: 2094,
  });

  // Mock inventory
  const [inventory] = useState([
    { id: "1", name: "Oud Royale Perfume", stock: 3, daysRemaining: 12, lastSold: "2 hours ago", status: "low" },
    { id: "2", name: "Casablanca Watch", stock: 15, daysRemaining: 45, lastSold: "Yesterday", status: "good" },
    { id: "3", name: "Argan Spa Kit", stock: 0, daysRemaining: 0, lastSold: "32 days ago", status: "dead" },
    { id: "4", name: "Rose Diffuser", stock: 8, daysRemaining: 24, lastSold: "3 days ago", status: "ok" },
  ]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchSellerData();
  }, [user]);

  const fetchSellerData = async () => {
    if (!user) return;

    // Check account type
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type, subscription_tier, subscription_expires_at, is_verified")
      .eq("user_id", user.id)
      .single();
    
    if (profile) {
      setAccountType(profile.account_type || "buyer");
      const tier = (profile as any).subscription_tier || "free";
      const exp = (profile as any).subscription_expires_at;
      const active = tier !== "free" && (!exp || new Date(exp).getTime() > Date.now());
      setSubscriptionTier(active ? tier : "free");
      setIsVerified(!!(profile as any).is_verified);
    }

    // Fetch wallet
    const { data: walletData } = await supabase
      .from("wallets")
      .select("id, balance")
      .eq("user_id", user.id)
      .single();

    if (walletData) {
      setWalletBalance(walletData.balance);

      const { data: txData } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", walletData.id)
        .order("created_at", { ascending: false });

      if (txData) {
        setTransactions(txData);
        const deposits = txData.filter(t => t.transaction_type === "deposit").reduce((sum, t) => sum + t.amount, 0);
        const earnings = txData.filter(t => t.transaction_type === "earning" || t.transaction_type === "sale").reduce((sum, t) => sum + t.amount, 0);
        setDepositBalance(deposits);
        setEarningsBalance(earnings);
      }
    }

    // Fetch seller profile
    const { data: sellerProfile } = await supabase
      .from("seller_profiles" as any)
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (sellerProfile) {
      setVerificationStatus((sellerProfile as any).verification_status || "pending");
      const preferredCurrency = (sellerProfile as any).preferred_currency || "USD";
      setSelectedCurrency(preferredCurrency);
      setCurrency(preferredCurrency as any);
    }
  };

  const getAIInsight = async (type: string) => {
    if (subscriptionTier === "free") {
      toast({ title: "AI is locked", description: "Upgrade to Vanta Connect Pro to unlock AI features." });
      return;
    }
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("seller-ai", {
        body: { type, metrics, inventory },
      });

      if (error) throw error;
      setAiInsight(data?.insight || "No insight available at this time.");
    } catch (err) {
      toast({ title: "AI Unavailable", description: "Could not generate insight. Try again later.", variant: "destructive" });
    } finally {
      setIsLoadingAI(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (walletFilter === "selling") return tx.transaction_type === "earning" || tx.transaction_type === "sale";
    if (walletFilter === "deposit") return tx.transaction_type === "deposit";
    return true;
  });

  if (!user) return null;

  const aiUnlocked = subscriptionTier !== "free";
  const handleUpgrade = () => setShowPlans(true);

  const isShipping = accountType === "shipping_company";
  const tabs = [
    { id: "overview", label: "Performance", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "orders", label: "Orders", icon: ClipboardList },
    ...(isShipping ? [{ id: "shipping", label: "Shipping", icon: Truck }] : []),
    { id: "finances", label: "Finances", icon: Wallet },
    { id: "ai", label: "AI Command", icon: Brain },
    { id: "apis", label: "APIs", icon: Plug },
    { id: "settings", label: "Settings", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
              <h1 className="font-display text-3xl text-foreground">
                Seller <span className="text-gradient-gold">Command Center</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                verificationStatus === "verified" ? "bg-green-500/10 text-green-500" :
                verificationStatus === "pending" ? "bg-yellow-500/10 text-yellow-500" :
                "bg-red-500/10 text-red-500"
              }`}>
                {verificationStatus === "verified" ? "✓ Verified" : verificationStatus === "pending" ? "⏳ Pending Verification" : "✗ Rejected"}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-gold/10 text-gold border border-gold/30"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Performance Pulse */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: format(metrics.totalRevenue), icon: DollarSign, color: "text-green-500" },
                  { label: "Net Profit", value: format(metrics.netProfit), icon: TrendingUp, color: "text-gold" },
                  { label: "Conversion Rate", value: `${metrics.conversionRate}%`, icon: ShoppingCart, color: "text-blue-500" },
                  { label: "Avg. Order Value", value: format(metrics.avgOrderValue), icon: BarChart3, color: "text-purple-500" },
                ].map((metric, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="hover-lift">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">{metric.label}</span>
                          <metric.icon className={`w-5 h-5 ${metric.color}`} />
                        </div>
                        <p className="font-display text-2xl text-foreground">{metric.value}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Orders Overview</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-muted-foreground">Total Orders</span><span className="font-display">{metrics.totalOrders}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Total Views</span><span className="font-display">{metrics.totalViews}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Fee Structure</span><span className="text-gold text-sm">1% sales fee + 2% + $0.15</span></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Listing Fees</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between"><span className="text-muted-foreground">Standard Listing</span><span>$0.10</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Premium Listing</span><span className="text-gold">$10.00</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Elite Listing</span><span className="text-purple-400">$15.00</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Sales Fee</span><span>1%</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">AI Advertising Fee</span><span>3%</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Inventory Intelligence */}
          {activeTab === "inventory" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="border-yellow-500/30 bg-yellow-500/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-yellow-500 animate-pulse" />
                    <div>
                      <p className="font-display text-lg text-foreground">{inventory.filter(i => i.status === "low").length}</p>
                      <p className="text-sm text-muted-foreground">Low Stock Items</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-red-500/30 bg-red-500/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Package className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="font-display text-lg text-foreground">{inventory.filter(i => i.status === "dead").length}</p>
                      <p className="text-sm text-muted-foreground">Dead Stock (30+ days)</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="p-4 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-display text-lg text-foreground">{inventory.filter(i => i.status === "good").length}</p>
                      <p className="text-sm text-muted-foreground">Healthy Stock</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader><CardTitle>Inventory Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="flex-1">
                          <p className="font-body font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Last sold: {item.lastSold}</p>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div>
                            <p className="font-display text-lg">{item.stock} units</p>
                            {item.daysRemaining > 0 && (
                              <p className="text-xs text-muted-foreground">~{item.daysRemaining} days left</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.status === "low" ? "bg-yellow-500/10 text-yellow-500" :
                            item.status === "dead" ? "bg-red-500/10 text-red-500" :
                            item.status === "good" ? "bg-green-500/10 text-green-500" :
                            "bg-blue-500/10 text-blue-500"
                          }`}>
                            {item.status === "low" ? "⚠ Low" : item.status === "dead" ? "💀 Dead" : item.status === "good" ? "✓ Good" : "OK"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <SellerListings />
            </div>
          )}

          {activeTab === "orders" && <SellerOrdersDashboard />}
          {activeTab === "shipping" && isShipping && <ShippingJobsDashboard />}
          {activeTab === "apis" && <IntegrationsPanel />}


          {/* Financial Logistics */}
          {activeTab === "finances" && (
            <div className="space-y-6">
              {/* Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-gold/20 to-gold/5 border-gold/30">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                    <p className="font-display text-3xl text-foreground">{format(walletBalance)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">From Deposits</p>
                    <p className="font-display text-2xl text-blue-400">{format(depositBalance)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-1">Earnings</p>
                    <p className="font-display text-2xl text-green-500">{format(earningsBalance)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Filter */}
              <div className="flex gap-2">
                {[
                  { id: "all", label: "All History" },
                  { id: "selling", label: "Selling History" },
                  { id: "deposit", label: "Deposit History" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setWalletFilter(f.id as any)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      walletFilter === f.id ? "bg-gold/10 text-gold border border-gold/30" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> Balance History</CardTitle></CardHeader>
                <CardContent>
                  {filteredTransactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No transactions found</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredTransactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                          <div>
                            <p className="font-body text-sm text-foreground capitalize">{tx.transaction_type}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()} • {tx.description || ""}</p>
                          </div>
                          <span className={`font-display text-lg ${tx.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                            {tx.amount > 0 ? "+" : ""}{format(Math.abs(tx.amount))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Command Center */}
          {activeTab === "ai" && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Brain className="w-12 h-12 text-gold mx-auto mb-3" />
                <h2 className="font-display text-2xl text-foreground mb-2">AI Command Center</h2>
                <p className="text-sm text-muted-foreground">Get AI-powered insights to optimize your store</p>
              </div>

              {!aiUnlocked && (
                <Card className="border-gold/40 bg-gold/5">
                  <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-gold" />
                      <div>
                        <p className="font-display text-lg text-foreground">AI Command Center is locked</p>
                        <p className="text-sm text-muted-foreground">Unlock all AI features with Vanta Connect Pro — $20/mo.</p>
                      </div>
                    </div>
                    <Button variant="gold" onClick={handleUpgrade}>
                      <Sparkles className="w-4 h-4 mr-2" /> Upgrade Now
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!aiUnlocked ? "opacity-50 pointer-events-none select-none" : ""}`}>
                {[
                  { type: "price_optimizer", label: "AI Price Optimizer", desc: "Scan market to find the sweet spot price", icon: DollarSign },
                  { type: "revenue_forecast", label: "Revenue Forecast", desc: "Predict next 30 days based on trends", icon: TrendingUp },
                  { type: "sentiment", label: "Sentiment Analysis", desc: "Summarize customer review vibes", icon: Users },
                  { type: "restock", label: "Restock Intelligence", desc: "AI-predicted demand spikes", icon: RefreshCw },
                  { type: "discount_impact", label: "Discount Predictor", desc: "Predict impact of running a sale", icon: Sparkles },
                  { type: "ad_roi", label: "Ad-Spend ROI", desc: "Track returns on featured placement", icon: Eye },
                ].map((tool) => (
                  <Card key={tool.type} className="hover-lift cursor-pointer" onClick={() => aiUnlocked ? getAIInsight(tool.type) : handleUpgrade()}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gold/10">
                          <tool.icon className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <h3 className="font-display text-sm text-foreground">{tool.label}</h3>
                          <p className="text-xs text-muted-foreground">{tool.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Response */}
              {(isLoadingAI || aiInsight) && (
                <Card className="border-gold/30">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-gold" /> AI Insight</CardTitle></CardHeader>
                  <CardContent>
                    {isLoadingAI ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" /> Analyzing your data...
                      </div>
                    ) : (
                      <p className="font-body text-foreground whitespace-pre-wrap">{aiInsight}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Currency Preference</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={async () => {
                          setSelectedCurrency(c.code);
                          setCurrency(c.code as any);
                          await supabase.from("seller_profiles" as any).update({ preferred_currency: c.code } as any).eq("user_id", user.id);
                          toast({ title: "Currency Updated", description: `Display currency set to ${c.name}` });
                        }}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          selectedCurrency === c.code
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border hover:border-gold/50 text-muted-foreground"
                        }`}
                      >
                        <p className="font-display text-lg">{c.symbol}</p>
                        <p className="text-xs">{c.code}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Verification</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upload your National ID or Passport to verify your seller account. Verified sellers get priority listing.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => toast({ title: "Upload", description: "ID upload feature coming soon" })}>
                        Upload National ID
                      </Button>
                      <Button variant="outline" onClick={() => toast({ title: "Upload", description: "Passport upload feature coming soon" })}>
                        Upload Passport
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Status: <span className={verificationStatus === "verified" ? "text-green-500" : "text-yellow-500"}>{verificationStatus}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Fee Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded"><span>Normal Listing Fee</span><span>$0.10 / listing</span></div>
                    <div className="flex justify-between p-2 bg-muted rounded"><span>Premium Listing</span><span>$10.00 / listing</span></div>
                    <div className="flex justify-between p-2 bg-muted rounded"><span>Elite Listing</span><span>$15.00 / listing</span></div>
                    <div className="flex justify-between p-2 bg-muted rounded"><span>Sales Fee</span><span>1% per item sold</span></div>
                    <div className="flex justify-between p-2 bg-muted rounded"><span>Payment Processing</span><span>2% + $0.15</span></div>
                    <div className="flex justify-between p-2 bg-muted rounded"><span>AI-Driven Advertising</span><span>3%</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <AIInsightCommand metrics={metrics} inventory={inventory} unlocked={aiUnlocked} onUpgrade={handleUpgrade} />
      <Dialog open={showPlans} onOpenChange={setShowPlans}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upgrade your plan</DialogTitle>
          </DialogHeader>
          <SubscriptionPlans accountType="seller" onSelected={() => setShowPlans(false)} />
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default SellerDashboard;
