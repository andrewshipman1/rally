import { redirect } from 'next/navigation';

// Session 5: /create is dead. Dashboard creates trips directly via
// server action. This redirect handles bookmarked/cached links.
export default function CreatePage() {
  redirect('/');
}
