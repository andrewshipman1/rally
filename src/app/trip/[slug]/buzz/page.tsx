import { redirect } from 'next/navigation';

// Session 5: buzz is now an inline section on the trip page.
// This redirect handles bookmarked/cached links to the old route.
type Props = { params: Promise<{ slug: string }> };

export default async function BuzzPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/trip/${slug}`);
}
