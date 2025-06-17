import { PageHeader } from '@/components/shared/PageHeader';
import { PracticeCard, type Practice } from '@/components/best-practices/PracticeCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const practices: Practice[] = [
  {
    id: '1',
    title: 'Effective Water Management for Rice Cultivation',
    category: 'Water Management',
    summary: 'Learn techniques for optimizing water usage in rice fields, including SRI methods and alternate wetting and drying (AWD).',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'rice paddy',
    link: '#', // Placeholder link
    type: 'Article',
  },
  {
    id: '2',
    title: 'Integrated Pest Management (IPM) for Cotton Crops',
    category: 'Pest Control',
    summary: 'A comprehensive guide to IPM strategies that minimize chemical use while effectively controlling pests in cotton.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'cotton crop',
    link: '#',
    type: 'Case Study',
  },
  {
    id: '3',
    title: 'Soil Health Improvement with Cover Cropping',
    category: 'Soil Health',
    summary: 'Discover the benefits of cover crops for soil fertility, structure, and water retention. Includes a video demonstration.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'cover crops',
    link: '#',
    type: 'Video Tutorial',
  },
  {
    id: '4',
    title: 'Precision Fertilization for Wheat',
    category: 'Fertilization',
    summary: 'Techniques for applying the right amount of fertilizer at the right time to maximize wheat yield and minimize environmental impact.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'wheat field',
    link: '#',
    type: 'Article',
  },
  {
    id: '5',
    title: 'Organic Farming Techniques for Vegetables',
    category: 'Organic Farming',
    summary: 'A practical guide to transitioning to organic vegetable farming, covering composting, natural pest control, and certification.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'organic vegetables',
    link: '#',
    type: 'Video Tutorial',
  },
  {
    id: '6',
    title: 'Post-Harvest Management of Maize to Reduce Losses',
    category: 'Post-Harvest',
    summary: 'Best practices for drying, storing, and transporting maize to minimize spoilage and maintain quality.',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'maize harvest',
    link: '#',
    type: 'Case Study',
  },
];

// This would ideally be a client component if search/filter state is managed locally
export default function BestPracticesPage() {
  // TODO: Implement search and filter functionality if needed as a client component
  // For now, this is a server component displaying all practices.
  const allCategories = ['All', ...new Set(practices.map(p => p.category))];


  return (
    <div className="container mx-auto">
      <PageHeader
        title="Best Practices Library"
        description="Explore curated farming techniques, case studies, and video tutorials to enhance your agricultural practices."
      />
      
      {/* Search and Filter Section - Future Enhancement */}
      {/* <div className="mb-8 flex flex-col md:flex-row gap-4">
        <Input placeholder="Search practices..." className="max-w-sm" />
      </div> */}

      <Tabs defaultValue="All" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:flex xl:flex-wrap xl:w-auto mb-6">
          {allCategories.map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>
        
        {allCategories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {practices
                .filter(p => category === 'All' || p.category === category)
                .map((practice) => (
                  <PracticeCard key={practice.id} practice={practice} />
              ))}
              {practices.filter(p => category === 'All' || p.category === category).length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-10">No practices found for this category.</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
