"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

import { StatusBadge } from "@/components/applications/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Application } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ApplicationTable({
  data,
  onEdit,
  onDelete
}: {
  data: Application[];
  onEdit: (application: Application) => void;
  onDelete: (applicationId: string) => void;
}) {
  const columns: ColumnDef<Application>[] = [
    {
      accessorKey: "companyName",
      header: "公司"
    },
    {
      accessorKey: "roleTitle",
      header: "岗位"
    },
    {
      accessorKey: "appliedAt",
      header: "投递时间",
      cell: ({ row }) => formatDate(row.original.appliedAt)
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    {
      accessorKey: "trackingUrl",
      header: "进度查询",
      cell: ({ row }) =>
        row.original.trackingUrl ? (
          <a className="inline-flex items-center gap-1 text-primary hover:text-primary-hover hover:underline" href={row.original.trackingUrl} target="_blank">
            查看 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="text-mutedText">-</span>
        )
    },
    {
      accessorKey: "notes",
      header: "备注",
      cell: ({ row }) => <span className="line-clamp-2 max-w-[260px] text-mutedText">{row.original.notes || "-"}</span>
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-coral-soft" onClick={() => onDelete(row.original.id)}>
            <Trash2 className="h-4 w-4 text-coral" />
          </Button>
        </div>
      )
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>投递记录列表</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-mutedText">
                  当前筛选条件下暂无投递记录。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
