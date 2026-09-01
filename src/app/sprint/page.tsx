import { Layout } from '@/components/layout/Layout';
import { SprintTimerProvider } from '@/context/SprintTimerContext';
import { SprintView } from '@/components/sprint/SprintView';

export default function SprintPage() {
  return (
    <SprintTimerProvider>
      <Layout>
        <SprintView />
      </Layout>
    </SprintTimerProvider>
  );
}