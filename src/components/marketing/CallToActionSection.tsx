import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CallToActionSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-6">
          Ready to Transform Your Farm?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Sign up for AgriAssist today and unlock the future of agriculture. Experience intelligent farming with AI-powered insights and tools designed for the modern Indian farmer.
        </p>
        <Button size="lg" asChild className="shadow-lg hover:shadow-primary/50 transition-shadow">
          <Link href="/signup">Sign Up Now and Grow Smarter</Link>
        </Button>
      </div>
    </section>
  );
}
