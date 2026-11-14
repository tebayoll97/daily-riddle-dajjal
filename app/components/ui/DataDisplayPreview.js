"use client";

import { useState } from "react";
import { Avatar, EmptyState, ErrorState, Pagination, Skeleton, Table } from "./index";

export function DataDisplayPreview() {
  const [page, setPage] = useState(2);
  const rows = [
    { id: "1", name: "Prisma", type: "Knowledge", status: "Active" },
    { id: "2", name: "Dajjal Family", type: "Community", status: "Draft" },
  ];
  const columns = [
    { key: "name", header: "Name" },
    { key: "type", header: "Category" },
    { key: "status", header: "Status" },
  ];
  return (
    <div className="ui-stack">
      <p className="ui-eyebrow">SKELETON</p>
      <div className="ui-cluster"><Skeleton variant="circle" /><div className="ui-stack-sm" style={{ flex: 1 }}><Skeleton width="42%" /><Skeleton width="76%" /></div></div>
      <p className="ui-eyebrow">EMPTY & ERROR</p>
      <div className="ui-grid-2">
        <EmptyState title="No activity yet" description="New activity will appear here." />
        <ErrorState title="Unable to load" description="Check your connection and retry." onRetry={() => {}} />
      </div>
      <p className="ui-eyebrow">AVATARS</p>
      <div className="ui-cluster"><Avatar name="Prisma" size="sm" /><Avatar name="Dajjal Family" size="md" /><Avatar name="Gaming Universe" size="lg" /><Avatar name="Knowledge" size="xl" /></div>
      <p className="ui-eyebrow">TABLE & PAGINATION</p>
      <Table columns={columns} rows={rows} caption="Example content inventory" />
      <Pagination page={page} totalPages={8} onPageChange={setPage} />
    </div>
  );
}
