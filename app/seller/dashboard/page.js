'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, Plus, TrendingUp, ShoppingBag, AlertTriangle, 
  Edit, Trash2, Eye, Download, Search, Filter, 
  BarChart3, Calendar, DollarSign, Users, Box,
  ArrowUp, ArrowDown, RefreshCw, CheckCircle, XCircle
} from 'lucide-react';
import { MAIN_CATEGORIES, ITEM_STATUS } from '@/lib/categories';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    activeRentals: 0,
    lowStock: 0,
    monthlyRevenue: 0
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch seller's items
      const response = await fetch('/api/my-items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setItems(data.items || []);
        calculateStats(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (itemsList) => {
    const totalItems = itemsList.length;
    const lowStock = itemsList.filter(item => item.available_quantity <= 2).length;
    const activeRentals = itemsList.filter(item => item.status === 'rented').length;
    
    // Calculate monthly revenue (mock for now)
    const monthlyRevenue = itemsList.reduce((sum, item) => {
      return sum + (item.rental_price_per_day || 0) * 30; // Estimate
    }, 0);

    setStats({ totalItems, activeRentals, lowStock, monthlyRevenue });
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedItems.length === 0) {
      alert('Please select items first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        selectedItems.map(itemId =>
          fetch(`/api/items/${itemId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
          })
        )
      );

      setSelectedItems([]);
      fetchDashboardData();
      alert('Items updated successfully!');
    } catch (error) {
      console.error('Error updating items:', error);
      alert('Error updating items');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Stock', 'Available', 'Price', 'Rental/Day', 'Status'];
    const rows = filteredItems.map(item => [
      item.name,
      item.category,
      item.stock_quantity || 1,
      item.available_quantity || 1,
      `₹${item.expected_price}`,
      `₹${item.rental_price_per_day || 0}`,
      item.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredItems = items
    .filter(item => {
      if (filterCategory !== 'all' && item.category !== filterCategory) return false;
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const lowStockItems = items.filter(item => item.available_quantity <= 2);
  const topPerformingItems = items
    .filter(item => item.rental_price_per_day)
    .sort((a, b) => b.rental_price_per_day - a.rental_price_per_day)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Seller Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your inventory and track performance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Link href="/seller/add-item">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-3xl font-bold">{stats.totalItems}</p>
                </div>
                <Package className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Rentals</p>
                  <p className="text-3xl font-bold">{stats.activeRentals}</p>
                </div>
                <ShoppingBag className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-3xl font-bold text-orange-500">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Est. Monthly Revenue</p>
                  <p className="text-3xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">
              <Box className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="bulk">
              <RefreshCw className="h-4 w-4 mr-2" />
              Bulk Actions
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {MAIN_CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="listed">Listed</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date Added</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="rental_price_per_day">Rental Price</SelectItem>
                        <SelectItem value="available_quantity">Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Badge variant="secondary">
                    {filteredItems.length} of {items.length} items
                  </Badge>
                  {(filterCategory || filterStatus || searchQuery) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterCategory('');
                        setFilterStatus('');
                        setSearchQuery('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(filteredItems.map(item => item.id));
                              } else {
                                setSelectedItems([]);
                              }
                            }}
                          />
                        </th>
                        <th className="text-left p-3 font-semibold">Item</th>
                        <th className="text-left p-3 font-semibold">Category</th>
                        <th className="text-left p-3 font-semibold">Stock</th>
                        <th className="text-left p-3 font-semibold">Price</th>
                        <th className="text-left p-3 font-semibold">Rental/Day</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems([...selectedItems, item.id]);
                                } else {
                                  setSelectedItems(selectedItems.filter(id => id !== item.id));
                                }
                              }}
                            />
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.subcategory}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={item.available_quantity <= 2 ? 'text-orange-500 font-semibold' : ''}>
                                {item.available_quantity || 1}/{item.stock_quantity || 1}
                              </span>
                              {item.available_quantity <= 2 && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                          </td>
                          <td className="p-3">₹{item.expected_price?.toLocaleString()}</td>
                          <td className="p-3">₹{item.rental_price_per_day?.toLocaleString() || 'N/A'}</td>
                          <td className="p-3">
                            <Badge
                              variant={item.status === 'listed' ? 'default' : item.status === 'rented' ? 'secondary' : 'destructive'}
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Link href={`/seller/edit-item/${item.id}`}>
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No items found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Top Performing Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topPerformingItems.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{item.rental_price_per_day}/day</p>
                          <p className="text-sm text-muted-foreground">Stock: {item.stock_quantity}</p>
                        </div>
                      </div>
                    ))}
                    {topPerformingItems.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No rental items yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {MAIN_CATEGORIES.map(category => {
                      const count = items.filter(item => item.category === category).length;
                      const percentage = items.length > 0 ? (count / items.length * 100).toFixed(1) : 0;
                      return (
                        <div key={category}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{category}</span>
                            <span className="text-sm text-muted-foreground">{count} items ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Daily Potential</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{items.reduce((sum, item) => sum + (item.rental_price_per_day || 0), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Weekly Potential</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(items.reduce((sum, item) => sum + (item.rental_price_per_day || 0), 0) * 7).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly Potential</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{(items.reduce((sum, item) => sum + (item.rental_price_per_day || 0), 0) * 30).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockItems.length > 0 ? (
                  <div className="space-y-3">
                    {lowStockItems.map(item => (
                      <Alert key={item.id} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong>{item.name}</strong>
                              <p className="text-sm">Only {item.available_quantity} units left in stock</p>
                            </div>
                            <Link href={`/seller/edit-item/${item.id}`}>
                              <Button size="sm" variant="outline">Update Stock</Button>
                            </Link>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p>All items have sufficient stock</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Actions Tab */}
          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    {selectedItems.length > 0 ? (
                      <span>{selectedItems.length} items selected</span>
                    ) : (
                      <span>Select items from the Inventory tab to perform bulk operations</span>
                    )}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Update Status</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleBulkStatusUpdate('listed')}
                        disabled={selectedItems.length === 0}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Listed
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleBulkStatusUpdate('maintenance')}
                        disabled={selectedItems.length === 0}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Maintenance
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Other Actions</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleBulkStatusUpdate('unavailable')}
                        disabled={selectedItems.length === 0}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Unavailable
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        disabled={selectedItems.length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Selected
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
