import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Wallet, Heart, ShoppingBag, History, Edit2, Save, ArrowLeft, Plus, Minus, Camera } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  home_address: string | null;
  city: string | null;
  country: string | null;
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

const countries = [
  "Morocco", "United States", "United Kingdom", "France", "Spain", "Germany", 
  "Italy", "Canada", "Australia", "UAE", "Saudi Arabia", "Qatar", "Other"
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "wallet" | "purchases" | "favorites">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    phone: "",
    home_address: "",
    city: "",
    country: "Morocco",
  });

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchProfile();
    fetchWallet();
    fetchOrders();
    fetchFavorites();
  }, [user, navigate]);

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
      });
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

  const handleDeposit = async () => {
    if (!wallet || !depositAmount) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount: amount,
      transaction_type: "deposit",
      description: "Wallet deposit",
    });

    if (!error) {
      await supabase
        .from("wallets")
        .update({ balance: wallet.balance + amount })
        .eq("id", wallet.id);
      
      toast({ title: "Deposit Successful", description: `$${amount.toFixed(2)} added to your wallet` });
      setDepositAmount("");
      fetchWallet();
    }
  };

  const handleWithdraw = async () => {
    if (!wallet || !withdrawAmount) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    if (amount > wallet.balance) {
      toast({ title: "Insufficient Balance", description: "You don't have enough funds", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount: -amount,
      transaction_type: "withdrawal",
      description: "Wallet withdrawal",
    });

    if (!error) {
      await supabase
        .from("wallets")
        .update({ balance: wallet.balance - amount })
        .eq("id", wallet.id);
      
      toast({ title: "Withdrawal Successful", description: `$${amount.toFixed(2)} withdrawn from your wallet` });
      setWithdrawAmount("");
      fetchWallet();
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
    { id: "wallet", label: "E-Wallet", icon: Wallet },
    { id: "purchases", label: "Purchases", icon: ShoppingBag },
    { id: "favorites", label: "Favorites", icon: Heart },
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
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors font-body"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
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
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center text-3xl font-display text-primary-foreground">
                      {profile.full_name.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-card border border-border rounded-full hover:bg-muted transition-colors">
                      <Camera className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <h3 className="font-display text-lg text-foreground mt-3">{profile.full_name}</h3>
                  <p className="font-body text-sm text-muted-foreground">{profile.email}</p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    {/* Deposit / Withdraw */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="p-4 border border-border rounded-lg">
                        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                          <Plus className="w-5 h-5 text-green-500" />
                          Deposit
                        </h3>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                          />
                          <Button variant="gold" onClick={handleDeposit}>Add</Button>
                        </div>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                          <Minus className="w-5 h-5 text-red-500" />
                          Withdraw
                        </h3>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                          <Button variant="outline" onClick={handleWithdraw}>Withdraw</Button>
                        </div>
                      </div>
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
                                {new Date(tx.created_at).toLocaleDateString()}
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
                        {favorites.map((fav) => (
                          <div key={fav.id} className="border border-border rounded-lg p-3 relative group">
                            <button
                              onClick={() => handleRemoveFavorite(fav.id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Heart className="w-3 h-3 fill-current" />
                            </button>
                            <Link to={`/product/${fav.product_id}`}>
                              <p className="font-body text-sm text-foreground">Product #{fav.product_id}</p>
                              <p className="text-xs text-muted-foreground">
                                Added {new Date(fav.created_at).toLocaleDateString()}
                              </p>
                            </Link>
                          </div>
                        ))}
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
    </div>
  );
};

export default ProfilePage;
