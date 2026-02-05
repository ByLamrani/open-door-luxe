 import { motion } from "framer-motion";
 import { ArrowLeft } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import Navbar from "@/components/Navbar";
 import Footer from "@/components/Footer";
 
 const PrivacyPage = () => {
   const navigate = useNavigate();
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar />
 
       <main className="pt-24 pb-20">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-8"
           >
             <button
               onClick={() => navigate(-1)}
               className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors font-body"
             >
               <ArrowLeft className="w-4 h-4" />
               Back
             </button>
           </motion.div>
 
           <motion.h1
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="font-display text-3xl md:text-4xl text-foreground mb-8"
           >
             Privacy <span className="text-gradient-gold">Policy</span>
           </motion.h1>
 
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="prose prose-invert max-w-none space-y-8"
           >
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">1. Information We Collect</h2>
               <p className="font-body text-muted-foreground leading-relaxed mb-4">
                 We collect information you provide directly to us when you:
               </p>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body">
                 <li>Create an account on our platform</li>
                 <li>Make a purchase or add items to your cart</li>
                 <li>Contact us for support</li>
                 <li>Subscribe to our newsletter</li>
                 <li>Use our E-Wallet feature</li>
               </ul>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">2. Personal Information</h2>
               <p className="font-body text-muted-foreground leading-relaxed mb-4">
                 The personal information we may collect includes:
               </p>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body">
                 <li>Name, email address, and phone number</li>
                 <li>Shipping and billing addresses</li>
                 <li>Payment information (securely processed)</li>
                 <li>Order history and preferences</li>
                 <li>Account credentials</li>
               </ul>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">3. How We Use Your Information</h2>
               <p className="font-body text-muted-foreground leading-relaxed mb-4">
                 We use the information we collect to:
               </p>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body">
                 <li>Process and fulfill your orders</li>
                 <li>Send order confirmations and updates</li>
                 <li>Provide customer support</li>
                 <li>Send promotional emails (with your consent)</li>
                 <li>Improve our products and services</li>
                 <li>Detect and prevent fraud</li>
               </ul>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">4. Data Security</h2>
               <p className="font-body text-muted-foreground leading-relaxed">
                 We implement appropriate security measures to protect your personal information 
                 against unauthorized access, alteration, disclosure, or destruction. All payment 
                 information is encrypted using industry-standard SSL technology. We do not store 
                 complete credit card numbers on our servers.
               </p>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">5. Cookies</h2>
               <p className="font-body text-muted-foreground leading-relaxed">
                 We use cookies and similar technologies to enhance your browsing experience, 
                 analyze site traffic, and personalize content. You can control cookie settings 
                 through your browser preferences. Disabling cookies may affect certain features 
                 of our website.
               </p>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">6. Third-Party Services</h2>
               <p className="font-body text-muted-foreground leading-relaxed">
                 We may share your information with trusted third-party service providers who 
                 assist us in operating our website, processing payments, and delivering orders. 
                 These parties are obligated to keep your information confidential and use it 
                 only for the services they provide to us.
               </p>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">7. Your Rights</h2>
               <p className="font-body text-muted-foreground leading-relaxed mb-4">
                 You have the right to:
               </p>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body">
                 <li>Access your personal information</li>
                 <li>Correct inaccurate information</li>
                 <li>Request deletion of your data</li>
                 <li>Opt-out of marketing communications</li>
                 <li>Export your data in a portable format</li>
               </ul>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">8. Contact Us</h2>
               <p className="font-body text-muted-foreground leading-relaxed">
                 If you have any questions about this Privacy Policy, please contact us at 
                 privacy@alelifestyle.com or through our Contact page.
               </p>
             </section>
 
             <p className="text-sm text-muted-foreground text-center">
               Last updated: February 2025
             </p>
           </motion.div>
         </div>
       </main>
 
       <Footer />
     </div>
   );
 };
 
 export default PrivacyPage;