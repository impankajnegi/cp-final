'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <Card>
          <CardContent className="p-8 prose max-w-none">
            <p className="text-muted-foreground mb-6">Last updated: January 2025</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Chaarpaisa, you accept and agree to be bound by the terms and 
              provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Accounts</h2>
            <p>When creating an account, you must provide accurate information. You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Roles</h2>
            <h3 className="text-xl font-semibold mt-4 mb-2">Owners</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Must provide accurate information about items</li>
              <li>Responsible for item condition and availability</li>
              <li>Must respond to offers in a timely manner</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">Sellers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Must be verified by admin before listing items</li>
              <li>Responsible for inventory management</li>
              <li>Must honor rental agreements</li>
              <li>Set fair and transparent pricing</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 mb-2">Renters</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Must return items in the condition received</li>
              <li>Responsible for damages during rental period</li>
              <li>Must complete payments on time</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>List illegal or prohibited items</li>
              <li>Engage in fraudulent activities</li>
              <li>Manipulate prices or ratings</li>
              <li>Harass other users</li>
              <li>Violate any applicable laws</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Payments and Fees</h2>
            <p>
              All payments are processed through our secure payment partners. Chaarpaisa may charge 
              service fees on transactions, which will be clearly communicated before completion.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Disputes</h2>
            <p>
              In case of disputes between users, Chaarpaisa will attempt to facilitate resolution but 
              is not responsible for the final outcome. Users are encouraged to resolve disputes amicably.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms or engage 
              in activities harmful to the platform or other users.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
            <p>
              Chaarpaisa is a marketplace platform connecting owners, sellers, and renters. We are not 
              responsible for the quality, safety, or legality of items listed.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of the service after changes 
              constitutes acceptance of the new terms.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
              <br />
              <a href="mailto:legal@chaarpaisa.com" className="text-primary">legal@chaarpaisa.com</a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
