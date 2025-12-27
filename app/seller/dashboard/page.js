'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Store, ArrowLeft, Search, Package, AlertCircle, CheckCircle, Barcode } from 'lucide-react';

export default function SellerDashboard() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [barcode, setBarcode] = useState(null);

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
      // Fetch available items
      const itemsRes = await fetch('/api/items');
      const itemsData = await itemsRes.json();
      if (itemsData.success) setItems(itemsData.items);

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
        fetchData(token);
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

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm">
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Items */}
          <Card>
            <CardHeader>
              <CardTitle>Available Items</CardTitle>
              <CardDescription>Browse and make offers on items</CardDescription>
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
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No items available</p>
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
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
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Offers */}
          <Card>
            <CardHeader>
              <CardTitle>My Offers</CardTitle>
              <CardDescription>Track your offer status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {myOffers.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No offers yet</p>
                  </div>
                ) : (
                  myOffers.map(offer => (
                    <div key={offer.id} className="p-4 border rounded-lg">
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
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

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
      </main>
    </div>
  );
}
