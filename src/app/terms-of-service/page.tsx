
// src/app/terms-of-service/page.tsx
import { PageHeader } from '@/components/shared/PageHeader';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
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
          title="Terms of Service"
          description="Last updated: October 26, 2023"
        />
        <div className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none text-muted-foreground">
          <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the AgriAssist application (the "Service") operated by AgriAssist Team ("us", "we", or "our").</p>
          
          <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>

          <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

          <h2>1. Accounts</h2>
          <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
          <p>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

          <h2>2. Use of AI-Powered Features</h2>
          <p>AgriAssist utilizes generative AI tools for features such as yield prediction, crop recommendation, disease diagnosis, and price prediction. While we strive to provide accurate and helpful information, these predictions and recommendations are based on AI models and available data, and they should not be considered as definitive advice or a substitute for professional agricultural consultation.</p>
          <p>You acknowledge that:</p>
          <ul>
            <li>AI-generated information is for informational purposes only.</li>
            <li>Actual outcomes (yields, prices, disease presence, etc.) can be influenced by numerous factors beyond the scope of the AI models.</li>
            <li>We are not liable for any decisions made or actions taken based on the information provided by the AI features. Always use your judgment and consult with local experts.</li>
            <li>For features like crop disease detection, the quality of the uploaded image significantly impacts the diagnosis.</li>
          </ul>

          <h2>3. Intellectual Property</h2>
          <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of AgriAssist Team and its licensors. The Service is protected by copyright, trademark, and other laws of both the India and foreign countries.</p>

          <h2>4. User Content</h2>
          <p>Our Service may allow you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
          <p>By posting Content to the Service, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service. You retain any and all of your rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights.</p>

          <h2>5. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.</p>

          <h2>6. Limitation Of Liability</h2>
          <p>In no event shall AgriAssist Team, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.</p>
          
          <h2>7. Disclaimer</h2>
          <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
          <p>AgriAssist Team its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your requirements.</p>

          <h2>8. Governing Law</h2>
          <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>

          <h2>9. Changes</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

          <h2>10. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at: [Placeholder Email: terms@agriassist.example.com]</p>
        </div>
      </main>
    </div>
  );
}
