import { redirect } from 'next/navigation';

export default function SoloGenericPage() {
  redirect('/play?system=generic');
}
