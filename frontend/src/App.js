import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TrendingUp, Shield, Zap, Clock, Award, CheckCircle2, Activity, BarChart3, DollarSign } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [products, setProducts] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    customer_name: "",
    customer_email: ""
  });
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");

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

    try {
      const orderData = {
        product_id: selectedProduct.id,
        customer_name: orderForm.customer_name,
        customer_email: orderForm.customer_email,
        amount: selectedProduct.price
      };

      const response = await axios.post(`${API}/orders`, orderData);
      setLicenseKey(response.data.license_key);
      setPurchaseComplete(true);
      toast.success("Purchase successful! Check your email for details.");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Purchase failed. Please try again.");
    }
  };

  const openPurchaseDialog = (product) => {
    setSelectedProduct(product);
    setPurchaseComplete(false);
    setOrderDialogOpen(true);
  };

  const resetDialog = () => {
    setOrderForm({ customer_name: "", customer_email: "" });
    setPurchaseComplete(false);
    setLicenseKey("");
    setSelectedProduct(null);
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
              Fully Automated Trading System
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight" data-testid="hero-title">
              High-Performance
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Scalping EA Bot
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed" data-testid="hero-description">
              Professional-grade Expert Advisor for MT4 & MT5. Start with just $50 and leverage advanced algorithms to capture micro-movements in the market with exceptional precision.
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg rounded-full shadow-lg shadow-emerald-500/50 transition-all hover:scale-105"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="get-started-btn"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-slate-200 hover:bg-slate-800 px-8 py-6 text-lg rounded-full"
                onClick={() => document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="view-performance-btn"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Performance
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {performance && (
        <section id="performance" className="py-16 px-6" data-testid="performance-section">
          <div className="max-w-7xl mx-auto">
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
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" data-testid="features-title">Why Choose ScalpMaster Pro?</h2>
            <p className="text-lg text-slate-400">Advanced technology meets proven trading strategies</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-platform">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">MT4 & MT5 Compatible</CardTitle>
                <CardDescription className="text-slate-400">
                  Seamlessly integrates with both MetaTrader 4 and MetaTrader 5 platforms. One-click installation, no technical expertise required.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-deposit">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Low Entry Barrier</CardTitle>
                <CardDescription className="text-slate-400">
                  Start trading with as little as $50. Our optimized risk management makes professional trading accessible to everyone.
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
                  Set it and forget it. Our EA runs 24/7, analyzing markets and executing trades while you sleep or focus on other things.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-speed">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Lightning Fast Execution</CardTitle>
                <CardDescription className="text-slate-400">
                  Average trade duration of 3.2 minutes. Captures rapid price movements with millisecond-precision entry and exit timing.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-risk">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Advanced Risk Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Built-in stop-loss, take-profit, and trailing stops. Maximum drawdown kept under 12.4% with intelligent position sizing.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 hover:border-emerald-500/50 transition-all hover:scale-105" data-testid="feature-card-support">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-emerald-400" />
                </div>
                <CardTitle className="text-white">Premium Support</CardTitle>
                <CardDescription className="text-slate-400">
                  24/7 customer support, lifetime updates, and access to exclusive trading community. We're here when you need us.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-6" data-testid="products-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" data-testid="products-title">Get Started Today</h2>
            <p className="text-lg text-slate-400">One-time purchase. Lifetime access. No recurring fees.</p>
          </div>
          <div className="grid gap-8">
            {products.map((product) => (
              <Card key={product.id} className="bg-slate-900/60 backdrop-blur-sm border-slate-700/50 overflow-hidden" data-testid={`product-card-${product.id}`}>
                <div className="grid md:grid-cols-2">
                  <div className="relative h-64 md:h-auto">
                    <img 
                      src="https://images.unsplash.com/photo-1639825752750-5061ded5503b?q=85" 
                      alt="Trading charts" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2" data-testid="product-name">{product.name}</h3>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40" data-testid="product-platform">{product.platform}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-emerald-400" data-testid="product-price">${product.price}</p>
                        <p className="text-sm text-slate-400">One-time</p>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-6" data-testid="product-description">{product.description}</p>
                    <Separator className="bg-slate-700 mb-6" />
                    <div className="space-y-3 mb-6">
                      {product.features.slice(0, 5).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2" data-testid={`product-feature-${idx}`}>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-full text-lg font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
                      onClick={() => openPurchaseDialog(product)}
                      data-testid="buy-now-btn"
                    >
                      <DollarSign className="w-5 h-5 mr-2" />
                      Purchase Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-slate-900/30" data-testid="faq-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4" data-testid="faq-title">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-400">Everything you need to know about ScalpMaster Pro EA</p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-1">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">What is a Scalping EA?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                A Scalping Expert Advisor (EA) is an automated trading robot that executes rapid trades to profit from small price movements. Our EA uses advanced algorithms to identify high-probability trading opportunities and execute trades with precision timing.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-2">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">Do I need trading experience?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                No trading experience required! The EA is fully automated and handles all trading decisions. Simply install it on your MT4/MT5 platform, configure your risk parameters, and let it trade for you. We provide detailed setup instructions and 24/7 support.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-3">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">What's the minimum deposit required?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                You can start with as little as $50. However, we recommend $200-500 for optimal performance and better risk management. The EA automatically adjusts position sizes based on your account balance.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-4">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">How do I install the EA?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                Installation is simple: 1) Download the EA file after purchase, 2) Copy it to your MT4/MT5 'Experts' folder, 3) Restart your trading platform, 4) Drag the EA onto your chart. We provide a detailed installation guide and video tutorial with your purchase.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-5">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">What's your refund policy?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                We offer a 30-day money-back guarantee. If you're not satisfied with the EA's performance or encounter any issues, contact our support team for a full refund. No questions asked.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6" className="bg-slate-900/50 backdrop-blur-sm border-slate-700/50 rounded-lg px-6" data-testid="faq-item-6">
              <AccordionTrigger className="text-white hover:text-emerald-400 text-left">Are updates included?</AccordionTrigger>
              <AccordionContent className="text-slate-400">
                Yes! All future updates are included with your one-time purchase. We continuously improve the EA's algorithms and add new features. You'll receive lifetime access to all updates at no additional cost.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800" data-testid="footer">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400 mb-2">© 2025 ScalpMaster Pro EA. All rights reserved.</p>
          <p className="text-slate-500 text-sm">Trading involves risk. Past performance is not indicative of future results.</p>
        </div>
      </footer>

      {/* Purchase Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={(open) => {
        setOrderDialogOpen(open);
        if (!open) resetDialog();
      }}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white" data-testid="purchase-dialog">
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
                  <Label htmlFor="customer_email">Email Address</Label>
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
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-full text-lg"
                  data-testid="submit-purchase-btn"
                >
                  Complete Purchase
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6" data-testid="purchase-success">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <DialogTitle className="text-2xl mb-2">Purchase Successful!</DialogTitle>
              <DialogDescription className="text-slate-400 mb-6">
                Thank you for your purchase. Your license key has been sent to your email.
              </DialogDescription>
              <div className="bg-slate-800 p-4 rounded-lg mb-6">
                <p className="text-sm text-slate-400 mb-2">Your License Key:</p>
                <p className="text-lg font-mono text-emerald-400 break-all" data-testid="license-key">{licenseKey}</p>
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