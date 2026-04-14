import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Globe, Building, ArrowLeft, Store, Truck as TruckIcon } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable/index";
import logo from "@/assets/vanta-logo.png";

const countries = [
  "Morocco", "United States", "United Kingdom", "France", "Spain", "Germany", 
  "Italy", "Canada", "Australia", "UAE", "Saudi Arabia", "Qatar", "Other"
];

type AccountType = "buyer" | "seller" | "shipping_company";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaCode, setCaptchaCode] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  
  // Account type selection
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Morocco");

  // Seller fields
  const [businessName, setBusinessName] = useState("");

  // Shipping company fields
  const [companyName, setCompanyName] = useState("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("Morocco");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [legalAddress, setLegalAddress] = useState("");
  const [siegeSocial, setSiegeSocial] = useState("");

  useEffect(() => {
    generateCaptcha();
  }, [isLogin]);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(result);
    setCaptchaCode("");
    setCaptchaVerified(false);
  };

  const verifyCaptcha = () => {
    if (captchaCode.toUpperCase() === generatedCaptcha) {
      setCaptchaVerified(true);
      toast({ title: "Captcha Verified ✓", description: "You can now proceed" });
    } else {
      toast({ title: "Invalid Captcha", description: "Please try again", variant: "destructive" });
      generateCaptcha();
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setIsLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const getMoroccoLegalLabel = () => countryOfOrigin === "Morocco" ? "RC (Registre de Commerce)" : "Business Registration Number";
  const showSiegeSocial = countryOfOrigin === "Morocco" || countryOfOrigin === "France";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "Sign In Failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!", description: "You have successfully signed in." });
          navigate("/");
        }
      } else {
        if (!accountType) {
          toast({ title: "Select Account Type", description: "Please choose Buyer, Seller, or Shipping Company", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (!fullName.trim()) {
          toast({ title: "Missing Information", description: "Please enter your full name", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (!acceptedTerms) {
          toast({ title: "Terms Required", description: "Please accept the Terms & Conditions", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (!captchaVerified) {
          toast({ title: "Captcha Required", description: "Please verify the captcha", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast({ title: "Password Mismatch", description: "Passwords do not match", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          toast({ title: "Weak Password", description: "Password must be at least 6 characters", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        const metadata: Record<string, string> = {
          full_name: fullName,
          phone,
          home_address: homeAddress,
          city,
          country,
          account_type: accountType,
        };

        if (accountType === "seller") {
          metadata.business_name = businessName;
        }
        if (accountType === "shipping_company") {
          metadata.company_name = companyName;
          metadata.country_of_origin = countryOfOrigin;
        }

        const { error } = await signUp(email, password, metadata as any);

        if (error) {
          if (error.message.includes("already registered")) {
            toast({ title: "Account Exists", description: "This email is already registered. Please sign in instead.", variant: "destructive" });
          } else {
            toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
          }
        } else {
          toast({ title: "Account Created! 🎉", description: "Please check your email to verify your account before signing in." });
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-8 shadow-xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/">
              <img src={logo} alt="VANTA by Lamrani" className="h-12 w-auto mx-auto mb-4 rounded-md" />
            </Link>
            <h1 className="font-display text-2xl text-foreground mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {isLogin ? "Sign in to access your account" : "Join VANTA for exclusive offers"}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => handleSocialLogin("google")} disabled={isLoading}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => handleSocialLogin("apple")} disabled={isLoading}>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Account Type Selection */}
                <div className="space-y-2">
                  <Label>Account Type *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: "buyer" as AccountType, label: "Buyer", icon: User, desc: "Shop & buy" },
                      { type: "seller" as AccountType, label: "Seller", icon: Store, desc: "Sell products" },
                      { type: "shipping_company" as AccountType, label: "Shipping", icon: TruckIcon, desc: "Deliver orders" },
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => setAccountType(opt.type)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          accountType === opt.type
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-border hover:border-gold/50 text-muted-foreground"
                        }`}
                      >
                        <opt.icon className="w-5 h-5 mx-auto mb-1" />
                        <p className="text-xs font-medium">{opt.label}</p>
                        <p className="text-[10px] opacity-70">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="pl-10" required />
                  </div>
                </div>

                {/* Seller: Business Name */}
                {accountType === "seller" && (
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Brand Name" className="pl-10" />
                    </div>
                  </div>
                )}

                {/* Shipping Company: Country-specific legal fields */}
                {accountType === "shipping_company" && (
                  <>
                    <div className="space-y-2">
                      <Label>Company Name *</Label>
                      <div className="relative">
                        <TruckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Shipping Co." className="pl-10" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Country of Origin *</Label>
                      <select
                        value={countryOfOrigin}
                        onChange={(e) => setCountryOfOrigin(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{getMoroccoLegalLabel()} *</Label>
                      <Input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder={countryOfOrigin === "Morocco" ? "RC-XXXXX" : "REG-XXXXX"} />
                    </div>
                    {showSiegeSocial && (
                      <div className="space-y-2">
                        <Label>Siège Social *</Label>
                        <Input value={siegeSocial} onChange={(e) => setSiegeSocial(e.target.value)} placeholder="Company headquarters address" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Legal Address</Label>
                      <Input value={legalAddress} onChange={(e) => setLegalAddress(e.target.value)} placeholder="Legal business address" />
                    </div>
                  </>
                )}

                {/* Common fields for buyer */}
                {accountType !== "shipping_company" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 6XX XXX XXX" className="pl-10" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="homeAddress">Home Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="homeAddress" value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} placeholder="123 Street Name" className="pl-10" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Casablanca" className="pl-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label>Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-10" required />
                  </div>
                </div>

                {/* Captcha */}
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  <Label>Verify you're human *</Label>
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-gold/20 to-gold/10 px-4 py-2 rounded font-mono text-xl tracking-widest text-foreground select-none border border-gold/30">
                      {generatedCaptcha}
                    </div>
                    <button type="button" onClick={generateCaptcha} className="text-sm text-gold hover:underline">Refresh</button>
                  </div>
                  <div className="flex gap-2">
                    <Input value={captchaCode} onChange={(e) => setCaptchaCode(e.target.value)} placeholder="Enter code above" className="flex-1" />
                    <Button type="button" variant={captchaVerified ? "default" : "outline"} onClick={verifyCaptcha} disabled={captchaVerified}>
                      {captchaVerified ? "✓ Verified" : "Verify"}
                    </Button>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)} />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    I accept the <Link to="/terms" className="text-gold hover:underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-gold hover:underline">Privacy Policy</Link>
                  </label>
                </div>
              </>
            )}

            <Button variant="gold" size="lg" className="w-full mt-6" type="submit" disabled={isLoading}>
              {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setAccountType(null); }} className="ml-2 text-gold hover:underline font-medium">
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
