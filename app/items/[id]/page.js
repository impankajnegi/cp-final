'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Package, Phone, User } from 'lucide-react';

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    if (params.id) {
      fetchItem(params.id);
    }
  }, [params.id]);

  const fetchItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`/api/items/${id}`, { headers });
      const data = await response.json();
      
      if (data.success) {
        setItem(data.item);
      } else {
        alert('Item not found');
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

  if (!item) {
    return <div className="flex items-center justify-center min-h-screen">Item not found</div>;
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

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <div className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={item.images[0]} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-24 w-24 text-muted-foreground" />
              )}
            </div>
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {item.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-slate-200 rounded overflow-hidden">
                    <img src={img} alt={`${item.name} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
                <Badge variant="secondary" className="text-sm">{item.category}</Badge>
              </div>
              <Badge 
                variant={item.status === 'listed' ? 'default' : 'outline'}
                className="capitalize"
              >
                {item.status}
              </Badge>
            </div>

            <div className="text-4xl font-bold text-primary mb-6">
              ₹{item.expected_price}
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {item.description || 'No description provided'}
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium capitalize">{item.condition || 'N/A'}</span>
                </div>
                {item.age && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium">{item.age} years</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location || 'Not specified'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Owner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Name
                  </span>
                  <span className="font-medium">{item.owner_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </span>
                  <span className="font-medium">{item.owner_phone || 'Not available'}</span>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 space-y-3">
              {user && user.role === 'seller' && item.status === 'listed' && (
                <Button className="w-full" size="lg">
                  Make an Offer
                </Button>
              )}
              {user && user.role === 'renter' && item.status === 'listed' && (
                <Button className="w-full" size="lg">
                  Request to Rent
                </Button>
              )}
              {!user && (
                <div className="space-y-2">
                  <Link href="/login">
                    <Button className="w-full" size="lg">Login to Contact Owner</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" className="w-full" size="lg">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
