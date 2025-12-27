'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function SellerRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    store_name: '',
    store_description: '',
    location: '',
    categories: []
  });
  const [storeImage, setStoreImage] = useState(null);
  const [storeVideo, setStoreVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['Electronics', 'Furniture', 'Tools', 'Sports', 'Books', 'Clothing', 'Other'];

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('store_name', formData.store_name);
      formDataToSend.append('store_description', formData.store_description);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('categories', formData.categories.join(','));
      if (storeImage) formDataToSend.append('store_image', storeImage);
      if (storeVideo) formDataToSend.append('store_video', storeVideo);

      const response = await fetch('/api/seller/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Update user role in localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        user.role = 'seller';
        localStorage.setItem('user', JSON.stringify(user));
        
        setTimeout(() => {
          router.push('/seller/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Store className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Become a Seller</CardTitle>
            <CardDescription>
              Register your store and start selling on Chaarpaisa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Seller profile created successfully! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="store_name">Store Name *</Label>
                  <Input
                    id="store_name"
                    placeholder="My Awesome Store"
                    value={formData.store_name}
                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us about your store..."
                    value={formData.store_description}
                    onChange={(e) => setFormData({ ...formData, store_description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categories You Deal In *</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <Badge
                        key={cat}
                        variant={formData.categories.includes(cat) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleCategory(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_image">Store Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="store_image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setStoreImage(e.target.files[0])}
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {storeImage && (
                    <p className="text-sm text-muted-foreground">Selected: {storeImage.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="store_video">Store Video (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="store_video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setStoreVideo(e.target.files[0])}
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {storeVideo && (
                    <p className="text-sm text-muted-foreground">Selected: {storeVideo.name}</p>
                  )}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your store will be reviewed by our admin team before activation.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Register Store'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
