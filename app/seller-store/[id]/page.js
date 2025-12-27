'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Package, Phone, Store, Mail, CheckCircle } from 'lucide-react';

export default function SellerStorePage() {
  const router = useRouter();
  const params = useParams();
  const [seller, setSeller] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (params.id) {
      fetchSellerStore(params.id);
    }
  }, [params.id]);

  const fetchSellerStore = async (sellerId) => {
    try {
      // Fetch seller profile
      const sellerRes = await fetch(`/api/seller-store/${sellerId}`);
      const sellerData = await sellerRes.json();
      
      if (sellerData.success) {
        setSeller(sellerData.seller);
        setItems(sellerData.items || []);
      } else {
        alert('Seller not found');
        router.push('/');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!seller) {
    return <div className="flex items-center justify-center min-h-screen">Seller not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Seller Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                  {seller.store_image ? (
                    <img src={seller.store_image} alt={seller.store_name} className="w-full h-full object-cover" />
                  ) : (
                    <Store className="h-24 w-24 text-primary" />
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{seller.store_name}</h1>
                    <p className="text-muted-foreground mb-4">{seller.store_description}</p>
                  </div>
                  {seller.verified && (
                    <Badge className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{seller.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{seller.email}</span>
                  </div>
                  {seller.phone_number && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{seller.phone_number}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {seller.categories?.map(cat => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Available Items</CardTitle>
            <CardDescription>{items.length} items in stock</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No items available in this store</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
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
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant="secondary">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground capitalize">Condition: {item.condition}</span>
                        <p className="text-xl font-bold text-primary">₹{item.expected_price}</p>
                      </div>
                      {user ? (
                        <Button className="w-full" onClick={() => router.push(`/items/${item.id}`)}>
                          View Details
                        </Button>
                      ) : (
                        <Link href="/signup">
                          <Button className="w-full">Sign up to Rent</Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
