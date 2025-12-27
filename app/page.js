'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Store, ShoppingBag, User, LogOut, Plus, Package, Filter } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Bangalore');
  const [activeTab, setActiveTab] = useState('browse');
  const [groupBy, setGroupBy] = useState('sellers'); // sellers or items

  const categories = ['Electronics', 'Furniture', 'Tools', 'Sports', 'Books', 'Clothing', 'Other'];
  const locations = ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch verified sellers
      const sellersRes = await fetch('/api/sellers/verified');
      const sellersData = await sellersRes.json();
      if (sellersData.success) {
        setSellers(sellersData.sellers);
      }

      // Fetch items from sellers
      const itemsRes = await fetch('/api/items');
      const itemsData = await itemsRes.json();
      if (itemsData.success) {
        setItems(itemsData.items);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  // Filter sellers by location and category
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         seller.store_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !selectedLocation || seller.location?.includes(selectedLocation);
    const matchesCategory = !selectedCategory || seller.categories?.includes(selectedCategory);
    return matchesSearch && matchesLocation && matchesCategory;
  });

  // Group sellers by category
  const sellersByCategory = filteredSellers.reduce((acc, seller) => {
    const cats = seller.categories || ['Uncategorized'];
    cats.forEach(cat => {
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(seller);
    });
    return acc;
  }, {});

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Public view for non-logged users (Focus on Sellers)
  const PublicView = () => (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">Rent from Trusted Sellers</h2>
        <p className="text-xl text-muted-foreground mb-6">Browse verified sellers in your area and rent quality items</p>
        <div className="flex justify-center gap-4">
          <Link href="/signup">
            <Button size="lg">Start Renting</Button>
          </Link>
          <Link href="/seller/register">
            <Button size="lg" variant="outline">
              <Store className="h-4 w-4 mr-2" />
              Become a Seller
            </Button>
          </Link>
        </div>
      </div>

      {/* Location and Filter Bar */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search sellers or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6"
              />
            </div>
          </div>
          <div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-12">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="h-12">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sellers">View by Sellers</SelectItem>
                <SelectItem value="items">View by Items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap mt-4">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('')}
          >
            All Categories
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : groupBy === 'sellers' ? (
        // Display Sellers
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Verified Sellers in {selectedLocation}</h3>
            <p className="text-muted-foreground">{filteredSellers.length} sellers available</p>
          </div>

          {selectedCategory ? (
            // Show sellers for selected category
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSellers.map(seller => (
                <Card key={seller.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/seller-store/${seller.id}`)}>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {seller.store_image ? (
                      <img src={seller.store_image} alt={seller.store_name} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{seller.store_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{seller.store_description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {seller.location}
                      </div>
                      {seller.verified && (
                        <Badge variant="default" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {seller.categories?.slice(0, 3).map(cat => (
                        <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // Group by category
            <div className="space-y-8">
              {Object.entries(sellersByCategory).map(([category, categorySellers]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-semibold">{category}</h4>
                    <Badge variant="secondary">{categorySellers.length} sellers</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categorySellers.slice(0, 4).map(seller => (
                      <Card key={seller.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.push(`/seller-store/${seller.id}`)}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Store className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{seller.store_name}</h4>
                            <p className="text-xs text-muted-foreground">{seller.location}</p>
                          </div>
                        </div>
                        {seller.verified && (
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredSellers.length === 0 && (
            <div className="text-center py-12">
              <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sellers found in {selectedLocation}</p>
              <p className="text-sm text-muted-foreground mt-2">Try selecting a different location</p>
            </div>
          )}
        </div>
      ) : (
        // Display Items
        <div>
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Available Items</h3>
            <p className="text-muted-foreground">{filteredItems.length} items available</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.slice(0, 6).map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/items/${item.id}`)}>
                <div className="aspect-video bg-slate-200 flex items-center justify-center">
                  {item.images && item.images.length > 0 ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <Badge variant="secondary">{item.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {item.location || 'N/A'}
                    </div>
                    <p className="text-lg font-bold text-primary">₹{item.expected_price}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Return appropriate view based on user role
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Store className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">Chaarpaisa</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <PublicView />
        </main>
      </div>
    );
  }

  // Logged in user views (existing code for owner/renter/seller/admin)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Chaarpaisa</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="capitalize">{user.role}</Badge>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {user.role === 'seller' ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Welcome, Seller!</h2>
            <Link href="/seller/dashboard">
              <Button>Go to Seller Dashboard</Button>
            </Link>
          </div>
        ) : user.role === 'admin' ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Welcome, Admin!</h2>
            <Link href="/admin/dashboard">
              <Button>Go to Admin Panel</Button>
            </Link>
          </div>
        ) : user.role === 'owner' ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Welcome, Owner!</h2>
            <Link href="/owner/dashboard">
              <Button>Go to Owner Dashboard</Button>
            </Link>
          </div>
        ) : (
          // Renter view - same as public but with ability to rent
          <PublicView />
        )}
      </main>
    </div>
  );
}
