"use client";
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { useState } from 'react';

export const SignIn = () => {
  const [verified, setVerified] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleSuccess = (result: any) => {
    console.log('Verification success:', result);
    setVerified(true);
    setUserId(result.nullifier_hash); // Unique identifier
  };

  if (verified) {
    return (
      <>
        Signed in as {userId?.slice(0, 10)} <br />
        <button onClick={() => { setVerified(false); setUserId(null); }}>Sign out</button>
      </>
    );
  } else {
    return (
      <>
        Not signed in <br />
        <IDKitWidget
          app_id={process.env.NEXT_PUBLIC_APP_ID || ''}
          action="sign-in"
          onSuccess={handleSuccess}
          verification_level={VerificationLevel.Orb}
        >
          {({ open }: { open: () => void }) => <button onClick={open}>Sign in</button>}
        </IDKitWidget>
      </>
    );
  }
};
