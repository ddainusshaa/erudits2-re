import {
  CellContext,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  TiebreakAnswer,
  useAdminPanel,
} from "../../../universal/AdminPanelContext";
import { SpinnerCircularFixed } from "spinners-react";
import { useMemo, useState } from "react";

export const TiebreakModal = ({
  setOpen,
  adjustPoints,
}: {
  setOpen: (open: boolean) => void;
  adjustPoints: (playerId: string, amount: number) => void;
}) => {
  const { tiebreakAnswers, setTiebreakAnswers } = useAdminPanel();
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: false },
  ]);

  const columns = useMemo<ColumnDef<TiebreakAnswer>[]>(
    () => [
      {
        id: "place",
        header: "Nr",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "player_name",
        header: "Nosaukums",
      },
      {
        accessorKey: "answer",
        header: "Atbilde",
      },
      {
        accessorKey: "is_correct",
        header: "Pareiza?",
        cell: ({ getValue }: CellContext<TiebreakAnswer, unknown>) =>
          (getValue() as boolean) ? "✅" : "❌",
      },
      {
        accessorKey: "timestamp",
        header: "Laiks",
      },
      {
        id: "actions",
        header: "Darbības",
        cell: ({ row }: { row: Row<TiebreakAnswer> }) => (
          <div className="flex gap-2 justify-center">
            <button
              className="bg-green-500 text-white w-6 h-6 rounded-full flex place-items-center justify-center hover:bg-green-400"
              onClick={() => adjustPoints(row.original.player_id, 1)}
            >
              <i className="fa-solid fa-plus text-xs"></i>
            </button>
            <button
              className="bg-red-500 text-white w-6 h-6 flex place-items-center justify-center rounded-full hover:bg-red-400"
              onClick={() => adjustPoints(row.original.player_id, -1)}
            >
              <i className="fa-solid fa-minus text-xs"></i>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: tiebreakAnswers ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const handleClose = () => {
    setOpen(false);
    setTiebreakAnswers([]);
  };

  return (
    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-effect w-full h-full z-40">
      <div className="absolute inset-0 flex place-items-center justify-center gap-4 bg-black/40 backdrop-blur-sm z-50 p-4">
        <div className="flex gap-4 place-items-center flex-col bg-slate-900/95 border border-slate-700 shadow-lg rounded-xl w-full max-w-4xl max-h-[85dvh] overflow-hidden">
          <div className="flex justify-between place-items-center w-full px-5 py-3 border-b border-slate-700">
            <h1 className="font-bold text-slate-100">Laušanas rezultāti</h1>
            <button
              onClick={handleClose}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          {tiebreakAnswers?.length === 0 && (
            <div className="w-full px-6 pb-6 pt-4 flex flex-col items-center gap-4">
              <p className="text-slate-200">Gaida spēlētāju atbildes...</p>
              <SpinnerCircularFixed color="#fff" size={35} thickness={180} />
            </div>
          )}
          {tiebreakAnswers?.length > 0 && (
            <div className="w-full px-6 pb-6 pt-4 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-2 text-slate-100">
                <p className="font-semibold text-lg break-words break-all whitespace-normal">
                  {tiebreakAnswers[0].question}
                </p>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    Pareizā atbilde
                  </p>
                  <p className="text-sm text-slate-200 break-words break-all whitespace-normal">
                    {tiebreakAnswers[0].correct_answer}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="min-w-[640px] w-full table-fixed border border-slate-700 text-sm">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr className="bg-slate-800 text-slate-200" key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="px-3 py-2 text-left font-semibold">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        className="bg-slate-900/60 odd:bg-slate-800/60 text-slate-100"
                        key={row.id}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-3 py-2 align-top break-words break-all whitespace-normal"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
