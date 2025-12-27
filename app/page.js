'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Filter, Store, ShoppingBag, User, LogOut, Plus, Package } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState('browse');

  const categories = ['Electronics', 'Furniture', 'Tools', 'Sports', 'Books', 'Clothing', 'Other'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
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

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Chaarpaisa</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {user && (user.role === 'owner' || user.role === 'renter') ? (
          // Owner/Renter Tabs
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="browse">
                <ShoppingBag className="h-4 w-4 mr-2" />
                {user.role === 'owner' ? 'Browse as Renter' : 'Browse Items'}
              </TabsTrigger>
              {user.role === 'owner' && (
                <TabsTrigger value="owner">
                  <Package className="h-4 w-4 mr-2" />
                  My Items
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="browse">
              {/* Search and Filter */}
              <div className="mb-8 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
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
              </div>

              {/* Items Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
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
                            {item.location || 'Location not specified'}
                          </div>
                          <p className="text-lg font-bold text-primary">₹{item.expected_price}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {user.role === 'owner' && (
              <TabsContent value="owner">
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">My Items</h2>
                  <Link href="/owner/add-item">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Item
                    </Button>
                  </Link>
                </div>
                <Link href="/owner/dashboard">
                  <Button variant="outline" className="mb-4">View Full Dashboard</Button>
                </Link>
              </TabsContent>
            )}
          </Tabs>
        ) : user && user.role === 'seller' ? (
          // Redirect to seller dashboard
          <div className="text-center py-12">
            <Store className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Welcome, Seller!</h2>
            <Link href="/seller/dashboard">
              <Button>Go to Seller Dashboard</Button>
            </Link>
          </div>
        ) : user && user.role === 'admin' ? (
          // Redirect to admin panel
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Welcome, Admin!</h2>
            <Link href="/admin/dashboard">
              <Button>Go to Admin Panel</Button>
            </Link>
          </div>
        ) : (
          // Public view for non-logged users
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Welcome to Chaarpaisa</h2>
              <p className="text-xl text-muted-foreground mb-8">Buy, Sell, and Rent items in your neighborhood</p>
              <div className="flex justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/seller/register">
                  <Button size="lg" variant="outline">
                    <Store className="h-4 w-4 mr-2" />
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search */}
            <div className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-lg"
                />
              </div>
            </div>

            {/* Items Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No items available</p>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation for Mobile (Owner/Renter) */}
      {user && (user.role === 'owner' || user.role === 'renter') && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg md:hidden">
          <div className="flex justify-around p-4">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex flex-col items-center ${activeTab === 'browse' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <ShoppingBag className="h-6 w-6" />
              <span className="text-xs mt-1">Browse</span>
            </button>
            {user.role === 'owner' && (
              <button
                onClick={() => setActiveTab('owner')}
                className={`flex flex-col items-center ${activeTab === 'owner' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Package className="h-6 w-6" />
                <span className="text-xs mt-1">My Items</span>
              </button>
            )}
            <button
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center text-muted-foreground"
            >
              <User className="h-6 w-6" />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
