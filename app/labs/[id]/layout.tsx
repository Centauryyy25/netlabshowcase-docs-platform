import type { Metadata } from 'next';

type LabLayoutParams = { id: string };

type LabDetailLayoutProps = {
  children: React.ReactNode;
  params: LabLayoutParams | Promise<LabLayoutParams>;
};

const resolveParams = async (params: LabDetailLayoutProps['params']) =>
  Promise.resolve(params);

export async function generateMetadata(props: {
  params: LabDetailLayoutProps['params'];
}): Promise<Metadata> {
  try {
    const { id } = await resolveParams(props.params);

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
        url: `https://netlabshowcase.com/labs/${id}`,
        images: [
          {
            url: '/api/og/labs/' + id,
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
        images: ['/api/og/labs/' + id],
      },
      alternates: {
        canonical: `https://netlabshowcase.com/labs/${id}`,
      },
    };
  } catch {
    return {
      title: 'Network Lab - NetLabShowcase',
      description: 'Explore networking labs on NetLabShowcase',
    };
  }
}

export default async function LabDetailLayout({
  children,
  params,
}: LabDetailLayoutProps) {
  await resolveParams(params);
  return children;
}
