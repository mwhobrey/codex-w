import { redirect } from 'next/navigation';

export default function SoloLonerPage() {
  redirect('/play?system=loner');
}
