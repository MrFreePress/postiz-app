export const dynamic = 'force-dynamic';
import { Activate } from '@gitroom/frontend/components/auth/activate';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Activate your account',
  description: '',
};
export default async function Auth() {
  return <Activate />;
}
