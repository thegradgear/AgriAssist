
// src/app/privacy-policy/page.tsx
import { PageHeader } from '@/components/shared/PageHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto">
           <Button variant="outline" asChild size="sm">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <PageHeader
          title="Privacy Policy"
          description="Last updated: October 26, 2023"
        />
        <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none text-muted-foreground">
          <p>Welcome to AgriAssist! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
          
          <h2>1. Information We Collect</h2>
          <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
          <ul>
            <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and contact number, that you voluntarily give to us when you register with the Application.</li>
            <li><strong>Farm Data:</strong> Information you provide related to your farming activities, such as crop types, field area, soil details, weather preferences, and images of crops for disease detection. This data is used to provide you with the core functionalities of AgriAssist.</li>
            <li><strong>Usage Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Application.</li>
          </ul>

          <h2>2. Use of Your Information</h2>
          <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Provide you with personalized services such as yield prediction, crop recommendations, and disease diagnosis.</li>
            <li>Communicate with you about your account or our services.</li>
            <li>Improve the Application and our services.</li>
            <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
          </ul>

          <h2>3. Disclosure of Your Information</h2>
          <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
          <ul>
            <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
            <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, customer service, and marketing assistance. For AI-powered features, anonymized or necessary data may be processed by our AI service providers (e.g., Google AI) solely for the purpose of providing the requested feature.</li>
          </ul>

          <h2>4. Security of Your Information</h2>
          <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

          <h2>5. Policy for Children</h2>
          <p>We do not knowingly solicit information from or market to children under the age of 13. If we learn that we have collected personal information from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible.</p>

          <h2>6. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

          <h2>7. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at: [Placeholder Email: privacy@agriassist.example.com]</p>
        </div>
      </main>
    </div>
  );
}
