'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Store, Package, ArrowLeft, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchData(token);
  }, []);

  const fetchData = async (token) => {
    try {
      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);

      // Fetch pending sellers
      const sellersRes = await fetch('/api/admin/sellers/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sellersData = await sellersRes.json();
      if (sellersData.success) setPendingSellers(sellersData.sellers);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/sellers/${sellerId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        alert('Seller approved successfully!');
        fetchData(token);
      } else {
        alert(data.error || 'Failed to approve seller');
      }
    } catch (error) {
      alert('An error occurred');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="sellers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="sellers">
              <Store className="h-4 w-4 mr-2" />
              Pending Sellers
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              All Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sellers">
            <Card>
              <CardHeader>
                <CardTitle>Pending Seller Approvals</CardTitle>
                <CardDescription>Review and approve seller registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingSellers.length === 0 ? (
                  <div className="text-center py-12">
                    <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending sellers</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSellers.map(seller => (
                      <div key={seller.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{seller.store_name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{seller.store_description}</p>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Owner:</span> {seller.name}</p>
                              <p><span className="font-medium">Email:</span> {seller.email}</p>
                              <p><span className="font-medium">Phone:</span> {seller.phone_number}</p>
                              <p><span className="font-medium">Location:</span> {seller.location}</p>
                              {seller.categories && seller.categories.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {seller.categories.map(cat => (
                                    <Badge key={cat} variant="outline">{cat}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleApproveSeller(seller.id)}
                            className="ml-4"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.phone_number}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="mb-2 capitalize">{user.role}</Badge>
                          <p className="text-xs text-muted-foreground">
                            Joined {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
