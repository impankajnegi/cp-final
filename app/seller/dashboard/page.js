'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Store, ArrowLeft, Search, Package, AlertCircle, CheckCircle, Barcode, 
  Plus, Grid, List, TrendingUp, ShoppingCart, Eye, EyeOff, Ban 
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function SellerDashboard() {
  const router = useRouter();
  const [availableItems, setAvailableItems] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [barcode, setBarcode] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [groupBy, setGroupBy] = useState('none'); // none or category
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData(token);
  }, []);

  const fetchData = async (token) => {
    try {
      // Fetch available items to browse
      const itemsRes = await fetch('/api/items');
      const itemsData = await itemsRes.json();
      if (itemsData.success) setAvailableItems(itemsData.items);

      // Fetch seller's own items
      const myItemsRes = await fetch('/api/my-items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const myItemsData = await myItemsRes.json();
      if (myItemsData.success) setMyItems(myItemsData.items);

      // Fetch my offers
      const offersRes = await fetch('/api/my-offers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const offersData = await offersRes.json();
      if (offersData.success) setMyOffers(offersData.offers);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_id: selectedItem.id,
          offer_price: offerPrice,
          message: offerMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Offer sent successfully!');
        setSelectedItem(null);
        setOfferPrice('');
        setOfferMessage('');
        fetchData(localStorage.getItem('token'));
      } else {
        alert(data.error || 'Failed to send offer');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLockDeal = async (offerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/offers/${offerId}/lock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setBarcode(data.barcode);
        alert('Deal locked! Barcode generated.');
        fetchData(token);
      } else {
        alert(data.error || 'Failed to lock deal');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/items/${itemId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Item marked as ${newStatus}`);
        fetchData(token);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  const filteredAvailableItems = availableItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group items by category
  const groupedItems = myItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Calculate stats
  const stats = {
    total: myItems.length,
    listed: myItems.filter(i => i.status === 'listed').length,
    rented: myItems.filter(i => i.status === 'rented').length,
    sold: myItems.filter(i => i.status === 'sold').length,
  };

  const renderItemCard = (item, showActions = true) => (
    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-slate-200 flex items-center justify-center">
        {item.images && item.images.length > 0 ? (
          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
            <Badge variant={item.status === 'listed' ? 'default' : item.status === 'rented' ? 'secondary' : 'outline'}>
              {item.status}
            </Badge>
          </div>
          <p className="text-lg font-bold text-primary ml-2">₹{item.expected_price}</p>
        </div>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
        <div className="text-xs text-muted-foreground mb-3">
          <span className="font-medium">Category:</span> {item.category}
        </div>
        {showActions && (
          <div className="flex gap-2">
            {item.status === 'listed' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange(item.id, 'sold')}
                  className="flex-1"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark Sold
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStatusChange(item.id, 'unavailable')}
                  className="flex-1"
                >
                  <Ban className="h-3 w-3 mr-1" />
                  Unavailable
                </Button>
              </>
            )}
            {(item.status === 'sold' || item.status === 'unavailable') && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStatusChange(item.id, 'listed')}
                className="w-full"
              >
                <Eye className="h-3 w-3 mr-1" />
                Mark Available
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <Store className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            </div>
            <Link href="/seller/add-item">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="inventory">
              <Package className="h-4 w-4 mr-2" />
              My Inventory ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="browse">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Browse Items
            </TabsTrigger>
            <TabsTrigger value="offers">
              <TrendingUp className="h-4 w-4 mr-2" />
              My Offers ({myOffers.length})
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">Total Items</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.listed}</div>
                  <p className="text-xs text-muted-foreground">Available</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.rented}</div>
                  <p className="text-xs text-muted-foreground">On Rent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-600">{stats.sold}</div>
                  <p className="text-xs text-muted-foreground">Sold</p>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Label>Group By:</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Items Display */}
            {myItems.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No items in your store yet</p>
                  <Link href="/seller/add-item">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Item
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : groupBy === 'category' ? (
              <Accordion type="multiple" className="space-y-4">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <AccordionItem key={category} value={category} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-semibold text-lg">{category}</span>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">{items.length} items</Badge>
                          <Badge variant="secondary">
                            {items.filter(i => i.status === 'listed').length} available
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4' : 'space-y-4 pt-4'}>
                        {items.map(item => renderItemCard(item))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {myItems.map(item => renderItemCard(item))}
              </div>
            )}
          </TabsContent>

          {/* Browse Items Tab */}
          <TabsContent value="browse">
            <Card>
              <CardHeader>
                <CardTitle>Available Items to Purchase</CardTitle>
                <CardDescription>Browse and make offers on items from other sellers</CardDescription>
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAvailableItems.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No items available</p>
                    </div>
                  ) : (
                    filteredAvailableItems.map(item => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="aspect-video bg-slate-200 flex items-center justify-center">
                          {item.images && item.images.length > 0 ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                            </div>
                            <Badge>{item.category}</Badge>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold text-primary">₹{item.expected_price}</span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" onClick={() => { setSelectedItem(item); setOfferPrice(item.expected_price); }}>
                                  Make Offer
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Send Offer for {item.name}</DialogTitle>
                                  <DialogDescription>
                                    Expected price: ₹{item.expected_price}
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSendOffer} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="offerPrice">Your Offer (₹)</Label>
                                    <Input
                                      id="offerPrice"
                                      type="number"
                                      value={offerPrice}
                                      onChange={(e) => setOfferPrice(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="message">Message (Optional)</Label>
                                    <Input
                                      id="message"
                                      value={offerMessage}
                                      onChange={(e) => setOfferMessage(e.target.value)}
                                      placeholder="Add a message..."
                                    />
                                  </div>
                                  <Button type="submit" className="w-full" disabled={submitting}>
                                    {submitting ? 'Sending...' : 'Send Offer'}
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers">
            <Card>
              <CardHeader>
                <CardTitle>My Offers</CardTitle>
                <CardDescription>Track your offer status and negotiations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myOffers.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No offers yet</p>
                    </div>
                  ) : (
                    myOffers.map(offer => (
                      <Card key={offer.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">{offer.item_name}</h3>
                              <p className="text-sm text-muted-foreground">Owner: {offer.owner_name}</p>
                            </div>
                            <Badge variant={
                              offer.status === 'accepted' ? 'default' :
                              offer.status === 'countered' ? 'secondary' :
                              offer.status === 'locked' ? 'outline' :
                              offer.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {offer.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p>Your offer: <span className="font-semibold">₹{offer.offer_price}</span></p>
                            {offer.counter_price && (
                              <p>Counter offer: <span className="font-semibold">₹{offer.counter_price}</span></p>
                            )}
                            {offer.expected_price && (
                              <p className="text-muted-foreground">Expected: ₹{offer.expected_price}</p>
                            )}
                          </div>
                          {offer.status === 'accepted' && (
                            <Button 
                              size="sm" 
                              className="w-full mt-3"
                              onClick={() => handleLockDeal(offer.id)}
                            >
                              <Barcode className="h-4 w-4 mr-2" />
                              Lock Deal & Generate Barcode
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Barcode Modal */}
      {barcode && (
        <Dialog open={!!barcode} onOpenChange={() => setBarcode(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deal Locked Successfully!</DialogTitle>
              <DialogDescription>Your barcode has been generated</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-6">
              <img src={barcode} alt="Barcode" className="max-w-full" />
              <p className="text-sm text-muted-foreground mt-4">Show this barcode for item verification</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
