'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">User not found</div>;
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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <Badge className="capitalize" variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </div>
                <span className="font-medium">{user.email}</span>
              </div>

              {user.phone_number && (
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-5 w-5" />
                    <span>Phone</span>
                  </div>
                  <span className="font-medium">{user.phone_number}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Shield className="h-5 w-5" />
                  <span>Role</span>
                </div>
                <span className="font-medium capitalize">{user.role}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>Member Since</span>
                </div>
                <span className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <User className="h-5 w-5" />
                  <span>Account Status</span>
                </div>
                <Badge variant={user.verified ? 'default' : 'secondary'}>
                  {user.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              {user.role === 'owner' && (
                <Link href="/owner/dashboard">
                  <Button className="w-full" variant="outline">
                    Go to Owner Dashboard
                  </Button>
                </Link>
              )}
              {user.role === 'seller' && (
                <Link href="/seller/dashboard">
                  <Button className="w-full" variant="outline">
                    Go to Seller Dashboard
                  </Button>
                </Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button className="w-full" variant="outline">
                    Go to Admin Panel
                  </Button>
                </Link>
              )}
              {(user.role === 'renter' || user.role === 'owner') && (
                <Link href="/">
                  <Button className="w-full" variant="outline">
                    Browse Marketplace
                  </Button>
                </Link>
              )}
              {user.role !== 'seller' && user.role !== 'admin' && (
                <Link href="/seller/register">
                  <Button className="w-full" variant="outline">
                    Become a Seller
                  </Button>
                </Link>
              )}
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
