import { redirect } from 'next/navigation';

/** Legacy Ironforge route → Ironsworn */
export default function SoloIronforgeRedirectPage() {
  redirect('/play?system=ironsworn');
}
