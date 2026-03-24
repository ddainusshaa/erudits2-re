import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { IGameController } from "../../../universal/AdminPanelContext";

export const RoundTable = ({
  gameController,
}: {
  gameController: IGameController;
}) => {
  const { instance_info, player_answers } = gameController;

  const tableQuestions = useMemo(() => {
    return instance_info?.round_questions ?? [];
  }, [instance_info?.round_questions]);

  const columns = useMemo(() => {
    return [
      {
        accessorKey: "player_name",
        header: "Spēlētājs",
        meta: {
          className: "sticky left-0 bg-slate-100 z-10 border-r border-slate-200",
        } as { className?: string },
        cell: ({ getValue }: { getValue: () => any }) => getValue(),
      },
      ...tableQuestions.map((question) => ({
        accessorKey: question.id,
        header: () => {
          return (
            <div className="p-2" title={question.title}>
              {question.title.length > 15
                ? question.title.slice(0, 15) + "..."
                : question.title}
            </div>
          );
        },
        cell: ({ getValue }: { getValue: any }) => {
          const answer = getValue();
          if (!answer) return "";
          return (
            <span
              title={answer.answer}
              className={answer.is_correct ? "text-green-800" : "text-red-800"}
            >
              {answer.answer?.length > 15
                ? answer.answer.slice(0, 15) + "..."
                : answer.answer ?? "-"}
            </span>
          );
        },
      })),
    ];
  }, [tableQuestions]);

  const data = useMemo(() => {
    return player_answers.map((player) => {
      const playerData: Record<string, any> = {
        player_name: player.player_name,
        round_finished: player.round_finished,
      };
      tableQuestions.forEach((question) => {
        const answerObj = player.questions.find((q) => q.id === question.id);
        playerData[question.id] = answerObj || null;
      });
      return playerData;
    });
  }, [player_answers, tableQuestions]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto w-full h-full">
      <table className="table-auto text-center text-sm w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-slate-100 text-slate-600" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as {
                  className?: string;
                };
                return (
                  <th
                    className={`px-2 py-2 border-b border-slate-200 ${meta?.className ?? ""}`}
                    key={header.id}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              className={` ${
                row.original.round_finished
                  ? "bg-blue-50 text-blue-900"
                  : "odd:bg-white even:bg-slate-50 text-slate-700"
              }`}
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as {
                  className?: string;
                };
                return (
                  <td
                    className={`px-2 py-2 border-b border-slate-100 ${meta?.className ?? ""}`}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
