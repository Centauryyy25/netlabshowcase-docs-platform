import { Metadata } from 'next';

interface LabDetailLayoutProps {
  children: React.ReactNode;
  params: {
    id: string;
  };
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    // In a real implementation, you'd fetch the lab data here
    // For now, we'll return generic metadata
    return {
      title: `Network Lab - NetLabShowcase`,
      description: `Explore this networking lab on NetLabShowcase. Learn about network configurations, topologies, and hands-on exercises.`,
      keywords: ['networking', 'labs', 'topology', 'cisco', 'packet tracer', 'network engineering'],
      openGraph: {
        title: `Network Lab - NetLabShowcase`,
        description: `Explore this networking lab on NetLabShowcase. Learn about network configurations, topologies, and hands-on exercises.`,
        type: 'article',
        url: `https://netlabshowcase.com/labs/${params.id}`,
        images: [
          {
            url: '/api/og/labs/' + params.id,
            width: 1200,
            height: 630,
            alt: 'Network Lab Topology',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `Network Lab - NetLabShowcase`,
        description: `Explore this networking lab on NetLabShowcase. Learn about network configurations, topologies, and hands-on exercises.`,
        images: ['/api/og/labs/' + params.id],
      },
      alternates: {
        canonical: `https://netlabshowcase.com/labs/${params.id}`,
      },
    };
  } catch (error) {
    return {
      title: 'Network Lab - NetLabShowcase',
      description: 'Explore networking labs on NetLabShowcase',
    };
  }
}

export default function LabDetailLayout({ children }: LabDetailLayoutProps) {
  return children;
}