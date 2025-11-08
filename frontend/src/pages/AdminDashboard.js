import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Copy
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/orders?limit=100`)
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId) => {
    setVerifying(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await axios.post(`${API}/orders/${orderId}/verify`);
      
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
      
      // Refresh orders
      await fetchData();
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed");
    } finally {
      setVerifying(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API}/orders/${orderId}/status?status=${newStatus}`);
      toast.success("Order status updated");
      await fetchData();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      verified: "bg-green-500/20 text-green-300 border-green-500/40",
      completed: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      failed: "bg-red-500/20 text-red-300 border-red-500/40"
    };
    return <Badge className={styles[status] || ""}>{status}</Badge>;
  };

  const getVerificationBadge = (verificationStatus) => {
    const styles = {
      not_verified: "bg-slate-500/20 text-slate-300 border-slate-500/40",
      verifying: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      verified: "bg-green-500/20 text-green-300 border-green-500/40",
      failed: "bg-red-500/20 text-red-300 border-red-500/40"
    };
    return <Badge className={styles[verificationStatus] || ""}>{verificationStatus}</Badge>;
  };

  const filterOrders = (status) => {
    if (status === "all") return orders;
    return orders.filter(order => order.status === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const displayOrders = filterOrders(activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage orders and monitor payments</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Orders</p>
                    <p className="text-3xl font-bold text-white">{stats.total_orders}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-slate-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Pending</p>
                    <p className="text-3xl font-bold text-yellow-400">{stats.pending_orders}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Verified</p>
                    <p className="text-3xl font-bold text-green-400">{stats.verified_orders}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Completed</p>
                    <p className="text-3xl font-bold text-blue-400">{stats.completed_orders}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur-lg border-emerald-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Revenue</p>
                    <p className="text-3xl font-bold text-emerald-400">${stats.total_revenue}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Table */}
        <Card className="bg-slate-900/50 backdrop-blur-lg border-slate-700/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Orders Management</CardTitle>
                <CardDescription>View and manage all customer orders</CardDescription>
              </div>
              <Button 
                onClick={fetchData}
                variant="outline" 
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-slate-800/50 mb-4">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Order ID</TableHead>
                      <TableHead className="text-slate-400">Customer</TableHead>
                      <TableHead className="text-slate-400">Amount</TableHead>
                      <TableHead className="text-slate-400">Payment Method</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Verification</TableHead>
                      <TableHead className="text-slate-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayOrders.map((order) => (
                        <TableRow key={order.id} className="border-slate-700">
                          <TableCell className="text-white font-mono text-sm">
                            <div className="flex items-center gap-2">
                              {order.id.substring(0, 8)}...
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(order.id)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-xs text-slate-400">{order.customer_email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-emerald-400 font-semibold">
                            ${order.amount}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-slate-700 text-slate-200">
                              {order.payment_method}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>
                            {getVerificationBadge(order.verification_status)}
                            {order.verification_message && (
                              <p className="text-xs text-slate-400 mt-1">
                                {order.verification_message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {order.transaction_hash && order.verification_status === "not_verified" && (
                                <Button
                                  size="sm"
                                  onClick={() => verifyPayment(order.id)}
                                  disabled={verifying[order.id]}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {verifying[order.id] ? "Verifying..." : "Verify"}
                                </Button>
                              )}
                              {order.status === "verified" && (
                                <Button
                                  size="sm"
                                  onClick={() => updateOrderStatus(order.id, "completed")}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Complete
                                </Button>
                              )}
                              {order.transaction_hash && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-600"
                                  onClick={() => copyToClipboard(order.transaction_hash)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
