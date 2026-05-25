'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAntiCheat } from '@/hooks/useAntiCheat';
import ViolationWarning from '@/components/exam/ViolationWarning';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [warningData, setWarningData] = useState<{ count: number; remaining: number } | null>(null);
  const [isTerminated, setIsTerminated] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // We only run anti-cheat if the user is on the actual active exam page
  const isExamPage = pathname.startsWith('/exam/') && pathname.split('/').length === 3;
  
  // Extract sessionId from pathname if applicable
  const sessionId = isExamPage ? pathname.split('/')[2] : '';

  useAntiCheat({
    maxViolations: Number(process.env.NEXT_PUBLIC_MAX_VIOLATIONS || 3),
    sessionId,
    onWarning: (count, remaining) => {
      setWarningData({ count, remaining });
      setShowModal(true);
    },
    onTerminate: () => {
      setIsTerminated(true);
      setShowModal(true);
    }
  });

  if (!isExamPage) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {showModal && (
        <ViolationWarning
          count={warningData?.count || 0}
          remaining={warningData?.remaining || 0}
          isTerminated={isTerminated}
          onUnderstand={() => {
            if (!isTerminated) setShowModal(false);
          }}
        />
      )}
    </>
  );
}
