 import { motion } from "framer-motion";
 import { ArrowLeft } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import Navbar from "@/components/Navbar";
 import Footer from "@/components/Footer";
 
 const TermsPage = () => {
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
             Terms of <span className="text-gradient-gold">Service</span>
           </motion.h1>
 
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="prose prose-invert max-w-none space-y-8"
           >
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">1. Introduction</h2>
               <p className="font-body text-muted-foreground leading-relaxed">
                 Welcome to ale LifeStyle. These Terms of Service govern your use of our website and services. 
                 By accessing or using our platform, you agree to be bound by these terms. If you disagree 
                 with any part of these terms, you may not access our services.
               </p>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">2. Products and Services</h2>
               <p className="font-body text-muted-foreground leading-relaxed mb-4">
                 All products displayed on our website are subject to availability. We reserve the right to 
                 discontinue any product at any time. Prices for our products are subject to change without notice.
               </p>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body">
                 <li>Product images are for illustration purposes only</li>
                 <li>We strive to display colors accurately but cannot guarantee exact representation</li>
                 <li>All products are authentic and sourced from verified suppliers</li>
               </ul>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">3. Payment Terms</h2>
               <p className="font-body text-muted-foreground leading-relaxed mb-4">
                 We accept multiple payment methods including credit cards, PayPal, E-Wallet, and Cash on Delivery 
                 (available only in Morocco). Online payments receive discounts as displayed during checkout.
               </p>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body">
                 <li>5% discount on all online payments</li>
                 <li>8% discount on orders over $700</li>
                 <li>Cash on Delivery is only available for Morocco addresses</li>
                 <li>International orders require online payment</li>
               </ul>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">4. Shipping and Delivery</h2>
               <p className="font-body text-muted-foreground leading-relaxed mb-4">
                 We ship to multiple countries worldwide. Delivery times vary based on your location:
               </p>
               <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body">
                 <li>Morocco: 2-5 business days</li>
                 <li>International: 7-21 business days</li>
                 <li>Tracking information provided for all orders</li>
                 <li>Shipping costs calculated at checkout</li>
               </ul>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">5. Returns and Refunds</h2>
               <p className="font-body text-muted-foreground leading-relaxed">
                 We offer a 14-day return policy for unused products in their original packaging. 
                 Refunds will be processed within 5-7 business days after we receive the returned item. 
                 Shipping costs for returns are the responsibility of the customer unless the item is defective.
               </p>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">6. Account Responsibilities</h2>
               <p className="font-body text-muted-foreground leading-relaxed">
                 You are responsible for maintaining the confidentiality of your account and password. 
                 You agree to accept responsibility for all activities that occur under your account. 
                 We reserve the right to terminate accounts at our discretion.
               </p>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">7. E-Wallet Terms</h2>
               <p className="font-body text-muted-foreground leading-relaxed">
                 The E-Wallet feature allows you to store funds for future purchases. Funds deposited 
                 are non-transferable to other users. Withdrawal requests are processed within 3-5 business days.
                 E-Wallet balance earns the same discount benefits as online payments.
               </p>
             </section>
 
             <section className="bg-card rounded-lg border border-border p-6">
               <h2 className="font-display text-xl text-foreground mb-4">8. Contact Information</h2>
               <p className="font-body text-muted-foreground leading-relaxed">
                 For any questions regarding these Terms of Service, please contact us through our 
                 Contact page or email us at support@alelifestyle.com.
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
 
 export default TermsPage;