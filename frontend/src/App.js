import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TrendingUp, Shield, Zap, Clock, Award, CheckCircle2, Activity, BarChart3, DollarSign, Copy, ExternalLink, Loader2 } from "lucide-react";
import AdminDashboard from "./pages/AdminDashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Crypto wallet addresses
const CRYPTO_WALLETS = {
  TRC20_USDT: "TRC20AddressHere123456789",
  BEP20_USDT: "BEP20AddressHere123456789",
  TRX: "TRXAddressHere123456789",
  BTC: "BTCAddressHere123456789",
  ETH: "ETHAddressHere123456789",
  BNB: "BNBAddressHere123456789"
};

const PAYMENT_METHODS = [
  { value: "TRC20_USDT", label: "USDT (TRC20)", network: "Tron Network" },
  { value: "BEP20_USDT", label: "USDT (BEP20)", network: "BSC Network" },
  { value: "TRX", label: "TRX", network: "Tron" },
  { value: "BTC", label: "Bitcoin (BTC)", network: "Bitcoin Network" },
  { value: "ETH", label: "Ethereum (ETH)", network: "Ethereum Network" },
  { value: "BNB", label: "BNB", network: "BSC Network" }
];

function App() {
  const [products, setProducts] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customer_name: "",
    customer_email: "",
    payment_method: "",
    transaction_hash: ""
  });
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, performanceRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/performance`)
      ]);
      setProducts(productsRes.data);
      setPerformance(performanceRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (!orderForm.payment_method) {
      toast.error("Please select a payment method");
      return;
    }

    if (!orderForm.transaction_hash) {
      toast.error("Please enter your transaction hash");
      return;
    }

    try {
      const orderData = {
        product_id: selectedProduct.id,
        customer_name: orderForm.customer_name,
        customer_email: orderForm.customer_email,
        amount: selectedProduct.price,
        payment_method: orderForm.payment_method,
        transaction_hash: orderForm.transaction_hash
      };

      const response = await axios.post(`${API}/orders`, orderData);
      setLicenseKey(response.data.license_key);
      setCurrentOrderId(response.data.id);
      setPurchaseComplete(true);
      toast.success("Order created! You can now verify your payment.");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Order failed. Please try again.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const openPurchaseDialog = (product) => {
    setSelectedProduct(product);
    setPurchaseComplete(false);
    setOrderDialogOpen(true);
  };

  const verifyPayment = async () => {
    if (!currentOrderId) return;
    
    setVerifying(true);
    setVerificationResult(null);
    
    try {
      const response = await axios.post(`${API}/orders/${currentOrderId}/verify`);
      setVerificationResult(response.data);
      
      if (response.data.success) {
        toast.success("Payment verified successfully! ✅");
      } else {
        toast.error(`Verification failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed. Please try again.");
      setVerificationResult({
        success: false,
        message: "Verification request failed"
      });
    } finally {
      setVerifying(false);
    }
  };

  const resetDialog = () => {
    setOrderForm({ customer_name: "", customer_email: "", payment_method: "", transaction_hash: "" });
    setPurchaseComplete(false);
    setLicenseKey("");
    setSelectedProduct(null);
    setShowPaymentDetails(false);
    setCurrentOrderId(null);
    setVerifying(false);
    setVerificationResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <Toaster position="top-right" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639825752750-5061ded5503b?q=85')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center space-y-8">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-4 py-1.5 text-sm" data-testid="hero-badge">
              <Activity className="w-4 h-4 inline mr-2" />
              Crypto Payments Only - Instant Delivery
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight" data-testid="hero-title">
              Professional MT4/MT5
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Scalping Expert Advisors
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed" data-testid="hero-description">
              Choose your risk level and start automated trading with our proven EAs. From conservative growth to aggressive profits - we have the perfect solution for every trader.
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-emerald-500/50 transition-all hover:scale-105"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="get-started-btn"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                View EA Packages
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-3 text-slate-300">
              <span className="text-sm">Need Support?</span>
              <a 
                href="https://t.me/hchdjd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-slate-700/50 transition-all"
                data-testid="telegram-support-link"
              >
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                <span className="font-medium">@hchdjd</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {performance && (
        <section id="performance" className="py-16 px-6" data-testid="performance-section">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Combined Performance Metrics</h3>
              <p className="text-slate-400">Aggregated results across all EA packages</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50 hover:border-emerald-500/50 transition-all" data-testid="stat-card-profit">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">${performance.total_profit.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-1">Total Profit</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50 hover:border-emerald-500/50 transition-all" data-testid="stat-card-return">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{performance.monthly_return}%</p>
                  <p className="text-sm text-slate-400 mt-1">Avg Monthly Return</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50 hover:border-emerald-500/50 transition-all" data-testid="stat-card-winrate">
                <CardContent className="p-6 text-center">
                  <Award className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{performance.win_rate}%</p>
                  <p className="text-sm text-slate-400 mt-1">Win Rate</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50 hover:border-emerald-500/50 transition-all" data-testid="stat-card-trades">
                <CardContent className="p-6 text-center">
                  <Activity className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{performance.total_trades.toLocaleString()}</p>
                  <p className="text-sm text-slate-400 mt-1">Total Trades</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-6" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" data-testid="features-title">Why Choose Our EAs?</h2>
            <p className="text-lg text-slate-400">Professional trading automation for every risk profile</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-platform">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">MT4 & MT5 Compatible</CardTitle>
                <CardDescription className="text-slate-400">
                  Works seamlessly with both MetaTrader platforms. Simple drag-and-drop installation.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-crypto">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Crypto Payments Only</CardTitle>
                <CardDescription className="text-slate-400">
                  Accept USDT (TRC20/BEP20), BTC, ETH, BNB, and TRX for instant, secure transactions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-automation">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Fully Automated</CardTitle>
                <CardDescription className="text-slate-400">
                  24/7 automated trading. No manual intervention required once configured.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-speed">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Risk Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Advanced stop-loss, take-profit, and position sizing tailored to your risk level.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-delivery">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Email Delivery</CardTitle>
                <CardDescription className="text-slate-400">
                  EA files delivered directly to your email within 24 hours after payment verification.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-support">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Telegram Support</CardTitle>
                <CardDescription className="text-slate-400">
                  Direct support via Telegram @hchdjd. Get help with setup and optimization.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-6 bg-slate-900/30" data-testid="products-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" data-testid="products-title">Choose Your Trading Style</h2>
            <p className="text-lg text-slate-400">Three risk levels. Three profit potentials. One powerful solution.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card 
                key={product.id} 
                className={`bg-slate-900/60 backdrop-blur-sm border-slate-700/50 overflow-hidden hover:border-emerald-500/50 transition-all hover:scale-105 ${index === 1 ? 'md:scale-105 border-emerald-500/50' : ''}`}
                data-testid={`product-card-${product.id}`}
              >
                {index === 1 && (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-center py-2 font-semibold text-sm">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mb-4">
                    {index === 0 && <Shield className="w-12 h-12 text-blue-400 mx-auto" />}
                    {index === 1 && <TrendingUp className="w-12 h-12 text-emerald-400 mx-auto" />}
                    {index === 2 && <Zap className="w-12 h-12 text-orange-400 mx-auto" />}
                  </div>
                  <CardTitle className="text-2xl text-white mb-2" data-testid="product-name">{product.name}</CardTitle>
                  <div className="text-center my-4">
                    <p className="text-5xl font-bold text-white" data-testid="product-price">${product.price}</p>
                    <p className="text-sm text-slate-400 mt-1">One-time payment</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mx-auto" data-testid="product-platform">{product.platform}</Badge>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-slate-300 mb-4 text-sm text-center" data-testid="product-description">{product.description}</p>
                  <Separator className="bg-slate-700 my-4" />
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Min Deposit:</span>
                      <span className="text-white font-semibold">${product.min_deposit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Monthly Return:</span>
                      <span className="text-emerald-400 font-semibold">{product.profit_percentage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="text-emerald-400 font-semibold">{product.win_rate}%</span>
                    </div>
                  </div>
                  <Separator className="bg-slate-700 my-4" />
                  <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2" data-testid={`product-feature-${idx}`}>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-full text-lg font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                    onClick={() => openPurchaseDialog(product)}
                    data-testid="buy-now-btn"
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    Buy with Crypto
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6" data-testid="faq-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" data-testid="faq-title">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-400">Everything you need to know about our EAs</p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-1">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">What's the difference between the three EA packages?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                <strong className="text-white">Low Risk EA ($90):</strong> Conservative strategy with 1% risk per trade, 6.5% monthly returns, 89.2% win rate. Best for beginners and capital preservation.<br/><br/>
                <strong className="text-white">Moderate Risk EA ($150):</strong> Balanced approach with 2% risk per trade, 15.2% monthly returns, 85.7% win rate. Ideal for steady growth.<br/><br/>
                <strong className="text-white">High Risk EA ($200):</strong> Aggressive strategy with 3-5% risk per trade, 32.8% monthly returns, 82.4% win rate. For experienced traders seeking maximum profits.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-2">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">What cryptocurrencies do you accept?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                We accept USDT (TRC20), USDT (BEP20), TRX (Tron), BTC (Bitcoin), ETH (Ethereum), and BNB (Binance Coin). After selecting your EA package, choose your preferred cryptocurrency, send payment to the displayed wallet address, and submit your transaction hash.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-3">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">How long does delivery take?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                EA files are delivered to your email within 24 hours after we verify your crypto payment. You'll receive installation instructions, setup guide, and your license key via email. For urgent delivery, contact us on Telegram @hchdjd.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-4">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">Do I need trading experience?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                No experience required! All our EAs are fully automated. Simply install on MT4/MT5, configure your risk settings (we provide recommended settings), and the EA handles everything. We include a detailed setup guide and offer support via Telegram @hchdjd.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-5">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">How do I install the EA?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                Simple 4-step process: 1) Download the EA file from your email, 2) Copy it to your MT4/MT5 'Experts' folder, 3) Restart your trading platform, 4) Drag the EA onto your chart and enable auto-trading. Full video tutorial included with purchase. Support available on Telegram @hchdjd.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-6">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">What if I need help or have issues?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                Contact us directly on Telegram @hchdjd for instant support. We help with installation, configuration, optimization, and any technical issues. Our support team responds quickly and ensures you get the most out of your EA.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-7">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">Can I use one EA on multiple accounts?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                Each license covers one MT4/MT5 account. If you need to use the EA on multiple accounts, contact us on Telegram @hchdjd for multi-license discounts. We offer special pricing for traders managing multiple accounts.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800" data-testid="footer">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-slate-400 mb-2">© 2025 ScalpMaster Pro EA. All rights reserved.</p>
            <p className="text-slate-500 text-sm mb-4">Trading involves risk. Past performance is not indicative of future results.</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-slate-400 text-sm">Product Support:</span>
              <a 
                href="https://t.me/hchdjd" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-slate-700/50 transition-all text-blue-400"
                data-testid="footer-telegram-link"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
                <span className="font-medium">@hchdjd</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Purchase Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={(open) => {
        setOrderDialogOpen(open);
        if (!open) resetDialog();
      }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="purchase-dialog">
          {!purchaseComplete ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl" data-testid="dialog-title">Complete Your Purchase</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {selectedProduct && (
                    <span>You're purchasing <strong>{selectedProduct.name}</strong> for <strong className="text-emerald-400">${selectedProduct.price}</strong></span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePurchase} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_name">Full Name</Label>
                  <Input
                    id="customer_name"
                    placeholder="John Doe"
                    value={orderForm.customer_name}
                    onChange={(e) => setOrderForm({...orderForm, customer_name: e.target.value})}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-customer-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_email">Email Address (for EA delivery)</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    placeholder="john@example.com"
                    value={orderForm.customer_email}
                    onChange={(e) => setOrderForm({...orderForm, customer_email: e.target.value})}
                    required
                    className="bg-slate-800 border-slate-700 text-white"
                    data-testid="input-customer-email"
                  />
                  <p className="text-xs text-slate-500">EA files will be sent to this email within 24 hours after payment verification</p>
                </div>
                
                <Separator className="bg-slate-700" />
                
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Select Crypto Payment Method</Label>
                  <Select 
                    value={orderForm.payment_method} 
                    onValueChange={(value) => {
                      setOrderForm({...orderForm, payment_method: value});
                      setShowPaymentDetails(true);
                    }}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white" data-testid="select-payment-method">
                      <SelectValue placeholder="Choose cryptocurrency..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value} className="text-white hover:bg-slate-700">
                          <div className="flex flex-col">
                            <span className="font-medium">{method.label}</span>
                            <span className="text-xs text-slate-400">{method.network}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {showPaymentDetails && orderForm.payment_method && (
                  <div className="bg-slate-800/50 p-4 rounded-lg space-y-4 border border-slate-700" data-testid="payment-details">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-emerald-400">
                        {PAYMENT_METHODS.find(m => m.value === orderForm.payment_method)?.label} Payment Details
                      </span>
                    </div>
                    
                    {/* QR Code Section */}
                    <div className="flex justify-center py-4">
                      <div className="bg-white p-4 rounded-lg">
                        <QRCodeSVG 
                          value={CRYPTO_WALLETS[orderForm.payment_method]} 
                          size={200}
                          level="H"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-400">Wallet Address</Label>
                      <div className="flex gap-2">
                        <Input
                          value={CRYPTO_WALLETS[orderForm.payment_method]}
                          readOnly
                          className="bg-slate-900 border-slate-600 text-white font-mono text-sm"
                          data-testid="wallet-address"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(CRYPTO_WALLETS[orderForm.payment_method])}
                          className="border-slate-600 hover:bg-slate-700"
                          data-testid="copy-wallet-btn"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-slate-400">Amount to Send</Label>
                      <div className="bg-slate-900 border border-slate-600 rounded-lg p-3">
                        <p className="text-2xl font-bold text-white">${selectedProduct?.price} USD</p>
                        <p className="text-xs text-slate-400 mt-1">Send the equivalent amount in {PAYMENT_METHODS.find(m => m.value === orderForm.payment_method)?.label}</p>
                      </div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <p className="text-xs text-amber-300">
                        ⚠️ <strong>Important:</strong> Send ONLY {PAYMENT_METHODS.find(m => m.value === orderForm.payment_method)?.label} to this address. 
                        Sending other coins may result in permanent loss.
                      </p>
                    </div>
                  </div>
                )}

                {showPaymentDetails && (
                  <div className="space-y-2">
                    <Label htmlFor="transaction_hash">Transaction Hash (TXID)</Label>
                    <Input
                      id="transaction_hash"
                      placeholder="0x... or txid..."
                      value={orderForm.transaction_hash}
                      onChange={(e) => setOrderForm({...orderForm, transaction_hash: e.target.value})}
                      required
                      className="bg-slate-800 border-slate-700 text-white font-mono text-sm"
                      data-testid="input-transaction-hash"
                    />
                    <p className="text-xs text-slate-500">After sending payment, paste your transaction hash here</p>
                  </div>
                )}

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-blue-300 mb-2">
                    <strong>Need help?</strong> Contact us on Telegram:
                  </p>
                  <a 
                    href="https://t.me/hchdjd" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                    <span className="font-medium">@hchdjd</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-full text-lg"
                  data-testid="submit-purchase-btn"
                  disabled={!showPaymentDetails}
                >
                  Submit Order
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6" data-testid="purchase-success">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <DialogTitle className="text-2xl mb-2">Order Submitted Successfully!</DialogTitle>
              <DialogDescription className="text-slate-400 mb-6">
                We've received your order. Your EA will be delivered to <strong className="text-white">{orderForm.customer_email}</strong> within 24 hours after payment verification.
              </DialogDescription>
              <div className="bg-slate-800 p-4 rounded-lg mb-6">
                <p className="text-sm text-slate-400 mb-2">Your Order Reference:</p>
                <p className="text-lg font-mono text-emerald-400 break-all" data-testid="license-key">{licenseKey}</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-300 mb-2">
                  Track your order or get support on Telegram:
                </p>
                <a 
                  href="https://t.me/hchdjd" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  <span className="font-medium">@hchdjd</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <Button 
                onClick={() => setOrderDialogOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-full"
                data-testid="close-dialog-btn"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;