import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

// Read from the session token on the server, so it is in the HTML response
// rather than filled in after hydration. No call to Clerk's API: the token
// carries the org id and role, which is all anything downstream may rely on.
async function ActiveOrganization() {
  const { orgId, orgRole } = await auth();

  if (!orgId) {
    return <p className="text-muted">No active organization.</p>;
  }

  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
      <dt className="text-muted">organization</dt>
      <dd className="font-mono">{orgId}</dd>
      <dt className="text-muted">role</dt>
      <dd className="font-mono">{orgRole}</dd>
    </dl>
  );
}

export default function WorkspacePage() {
  return (
    <div className="p-3">
      <Suspense>
        <ActiveOrganization />
      </Suspense>
    </div>
  );
}
