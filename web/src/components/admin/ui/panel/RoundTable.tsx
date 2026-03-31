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
          className: "sticky left-0 bg-slate-800 z-10 border-r border-slate-700",
        } as { className?: string },
        cell: ({ getValue }: { getValue: () => any }) => getValue(),
      },
      {
        accessorKey: "submitted_current_question",
        header: "Iesniegts",
        cell: ({ getValue }: { getValue: () => boolean }) => {
          const isSubmitted = getValue();

          return (
            <span
              className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold border ${
                isSubmitted
                  ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-300"
                  : "bg-rose-500/20 border-rose-400/50 text-rose-300"
              }`}
            >
              {isSubmitted ? "Jā" : "Nē"}
            </span>
          );
        },
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
    const currentQuestionId = instance_info?.current_question_id;

    return player_answers.map((player) => {
      const playerData: Record<string, any> = {
        player_name: player.player_name,
        round_finished: player.round_finished,
        submitted_current_question: false,
      };

      if (currentQuestionId) {
        const currentAnswer = player.questions.find(
          (q) => q.id === currentQuestionId
        );
        playerData.submitted_current_question =
          !!currentAnswer && `${currentAnswer.answer ?? ""}`.trim().length > 0;
      }

      tableQuestions.forEach((question) => {
        const answerObj = player.questions.find((q) => q.id === question.id);
        playerData[question.id] = answerObj || null;
      });
      return playerData;
    });
  }, [instance_info?.current_question_id, player_answers, tableQuestions]);

  const submittedNowCount = useMemo(() => {
    return data.filter((row) => row.submitted_current_question).length;
  }, [data]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-auto w-full h-full min-h-0 admin-scrollbar">
      <div className="sticky top-0 z-20 bg-slate-900/95 border-b border-slate-700 px-3 py-2 text-sm text-slate-200">
        Iesnieguši: {submittedNowCount}/{player_answers.length}
      </div>
      <table className="table-auto text-center text-sm w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-slate-800 text-slate-200" key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as {
                  className?: string;
                };
                return (
                  <th
                    className={`px-2 py-2 border-b border-slate-700 ${meta?.className ?? ""}`}
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
                  ? "bg-blue-950/40 text-blue-200"
                  : "odd:bg-slate-900 even:bg-slate-800/60 text-slate-200"
              }`}
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as {
                  className?: string;
                };
                return (
                  <td
                    className={`px-2 py-2 border-b border-slate-700 ${meta?.className ?? ""}`}
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
