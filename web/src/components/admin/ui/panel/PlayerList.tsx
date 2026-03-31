import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { constants } from "../../../../constants";
import { useConfirmation } from "../../../universal/ConfirmationWindowContext";
import { IPlayer } from "../../interface/IPlayer";
import { SpinnerCircularFixed } from "spinners-react";
import { useAdminPanel } from "../../../universal/AdminPanelContext";
import { useToast } from "../../../universal/Toast";
import { TiebreakModal } from "./TiebreakModal";

export const PlayerList = () => {
  const [sorting, setSorting] = useState([
    { id: "is_disqualified", desc: false },
  ]);

  const [fetchDisabled, setFetchDisabled] = useState(false);
  const [pointsDisabled, setPointsDisabled] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [openTiebreakModal, setOpenTiebreakModal] = useState(false);
  const [connectionNow, setConnectionNow] = useState(Date.now());

  const { fetchPlayers, players, setPlayers, instanceId, devtoolsSignals } =
    useAdminPanel();

  const showToast = useToast();

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (!instanceId) return;
    const interval = setInterval(() => {
      setConnectionNow(Date.now());
      fetchPlayers();
    }, 5000);

    return () => clearInterval(interval);
  }, [instanceId]);

  const confirm = useConfirmation();

  const isConnected = (player: IPlayer) => {
    if (!player.updated_at) return false;
    const lastSeen = Date.parse(player.updated_at);
    if (!Number.isFinite(lastSeen)) return false;
    return connectionNow - lastSeen <= 20000;
  };

  const isDevtoolsOpen = (player: IPlayer) => {
    const signal = devtoolsSignals[player.id];
    if (!signal) return false;
    const lastSeen = Date.parse(signal.detectedAt);
    if (!Number.isFinite(lastSeen)) return signal.isOpen;
    return signal.isOpen && connectionNow - lastSeen <= 20000;
  };

  const disqualifyPlayer = async () => {
    if (selectedPlayerIds.length < 1) {
      return;
    }
    if (await confirm(`Vai tiešām vēlaties diskvalificēt šos spēlētājus?`)) {
      const response = await fetch(
        `${constants.baseApiUrl}/disqualify-player`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              constants.localStorage.TOKEN
            )}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player_ids: selectedPlayerIds.join(","),
          }),
        }
      );

      if (response.ok) {
        fetchPlayers();
      }
    }
  };

  const deletePlayer = async () => {
    if (selectedPlayerIds.length < 1) {
      return;
    }
    if (await confirm(`Vai tiešām vēlaties dzēst šos spēlētājus?`)) {
      const response = await fetch(
        `${constants.baseApiUrl}/players/${selectedPlayerIds.join(",")}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              constants.localStorage.TOKEN
            )}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        fetchPlayers();
      }
    }
  };

  const requalifyPlayer = async () => {
    if (selectedPlayerIds.length < 1) {
      return;
    }
    if (await confirm(`Vai tiešām vēlaties kvalificēt šos spēlētājus?`)) {
      const response = await fetch(`${constants.baseApiUrl}/requalify-player`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            constants.localStorage.TOKEN
          )}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_ids: selectedPlayerIds.join(","),
        }),
      });

      if (response.ok) {
        fetchPlayers();
      }
    }
  };

  const tiebreakAdjustPoints = async (playerId: string, amount: number) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    await adjustPoints(player, amount);
  };

  const promptPointsAmount = (mode: "add" | "remove") => {
    const raw = window.prompt(
      mode === "add" ? "Cik punktus pievienot?" : "Cik punktus noņemt?",
      "1"
    );

    if (raw === null) {
      return null;
    }

    const value = raw.trim();
    if (!/^\d+$/.test(value)) {
      showToast(false, "Ievadiet veselu skaitli");
      return null;
    }

    const amount = Number(value);
    if (amount < 1) {
      showToast(false, "Skaitlim jābūt lielākam par 0");
      return null;
    }

    return amount;
  };

  const adjustPoints = async (player: IPlayer, amount: number) => {
    if (!pointsDisabled) {
      setPointsDisabled(true);
      const response = await fetch(`${constants.baseApiUrl}/adjust-points`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            constants.localStorage.TOKEN
          )}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: player.id,
          amount,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const updatedPlayers = players.map((p) =>
          p.id === player.id ? { ...p, points: data.points } : p
        );
        setPlayers(updatedPlayers);

        setPointsDisabled(false);
      }
    }
  };

  const handleTiebreak = async () => {
    if (selectedPlayerIds.length < 1) {
      return;
    }

    const response = await fetch(`${constants.baseApiUrl}/tiebreak`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(
          constants.localStorage.TOKEN
        )}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_ids: selectedPlayerIds,
        instance_id: instanceId,
      }),
    });

    if (response.ok) {
      showToast(true, "Spēlētājiem uzdoti papildus jautājumi");
      setOpenTiebreakModal(true);
    }
  };

  const columnHelper = createColumnHelper<IPlayer>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        header: "Pozīcija",
        meta: {
          className: "w-[9%] text-center",
        } as { className?: string },
        cell: (info) => {
          const sortedRowIndex = table
            .getRowModel()
            .rows.findIndex((row) => row.id === info.row.id);
          return sortedRowIndex + 1;
        },
      }),
      columnHelper.accessor("player_name", {
        header: "Nosaukums",
        meta: {
          className: "w-[28%] text-left",
        } as { className?: string },
        cell: (info) => (
          <p className="text-left whitespace-normal break-words leading-tight">
            {info.getValue()}
          </p>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("points", {
        header: "Punkti",
        meta: {
          className: "w-[24%] text-center",
        } as { className?: string },
        cell: (info) => {
          return (
            <div className="flex gap-3 place-items-center justify-center">
              <button
                disabled={pointsDisabled}
                onClick={() => {
                  const amount = promptPointsAmount("add");
                  if (!amount) return;
                  adjustPoints(info.row.original, amount);
                }}
                className={`font-bold ${
                  pointsDisabled
                    ? "bg-slate-400"
                    : "bg-red-500 hover:bg-red-400"
                } text-white h-6 w-6 rounded-full transition-all`}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
              <p>{info.getValue()}</p>
              <button
                disabled={pointsDisabled}
                onClick={() => {
                  const amount = promptPointsAmount("remove");
                  if (!amount) return;
                  adjustPoints(info.row.original, -amount);
                }}
                className={`font-bold ${
                  pointsDisabled
                    ? "bg-slate-400"
                    : "bg-red-500 hover:bg-red-400"
                } text-white h-6 w-6 rounded-full transition-all`}
              >
                <i className="fa-solid fa-minus"></i>
              </button>
            </div>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor("is_disqualified", {
        header: "Statuss",
        meta: {
          className: "w-[9%] text-center align-middle",
        } as { className?: string },
        sortingFn: (rowA, rowB, columnId) => {
          const aIsDisqualified = rowA.getValue(columnId);
          const bIsDisqualified = rowB.getValue(columnId);

          // Group qualified players first
          if (aIsDisqualified !== bIsDisqualified) {
            return aIsDisqualified ? 1 : -1; // `false` (qualified) before `true` (disqualified)
          }

          // If both are in the same group, sort by points descending
          const aPoints: number = rowA.getValue("points");
          const bPoints: number = rowB.getValue("points");
          return bPoints - aPoints; // Higher points first
        },
        cell: (info) => {
          return (
            <div
              className={`flex items-center justify-center w-full ${
                info.getValue() ? "text-red-500" : "text-emerald-500"
              }`}
            >
              <span
                className={`rounded-full w-4 h-4 ${
                info.getValue() ? "bg-red-500" : "bg-emerald-500"
              }`}
              ></span>
            </div>
          );
        },
      }),
      columnHelper.display({
        header: "Tiešsaistē",
        meta: {
          className: "w-[10%] text-center align-middle",
        } as { className?: string },
        cell: (info) => {
          const connected = isConnected(info.row.original);
          return (
            <div
              className={`flex items-center justify-center w-full ${
                connected ? "text-emerald-500" : "text-slate-400"
              }`}
              title={connected ? "Tiešsaistē" : "Nav savienots"}
            >
              <span
                className={`rounded-full w-3 h-3 ${
                  connected ? "bg-emerald-500" : "bg-slate-400"
                }`}
              ></span>
            </div>
          );
        },
      }),
      columnHelper.display({
        header: "DevTools",
        meta: {
          className: "w-[10%] text-center align-middle",
        } as { className?: string },
        cell: (info) => {
          const open = isDevtoolsOpen(info.row.original);
          return (
            <div
              className={`flex items-center justify-center w-full ${
                open ? "text-amber-400" : "text-slate-500"
              }`}
              title={open ? "DevTools atverts" : "DevTools nav atverts"}
            >
              <span
                className={`rounded-full w-3 h-3 ${
                  open ? "bg-amber-400" : "bg-slate-500"
                }`}
              ></span>
            </div>
          );
        },
      }),
      columnHelper.display({
        header: "Darbības",
        meta: {
          className: "w-[10%] text-center",
        } as { className?: string },
        enableSorting: false,
        cell: (info) => {
          return (
            <input
              onChange={() => toggleSelectedPlayerId(info.row.original.id)}
              type="checkbox"
              className="accent-[#E63946] w-4 h-4"
              checked={selectedPlayerIds.includes(info.row.original.id)}
            ></input>
          );
        },
      }),
    ],
    [
      columnHelper,
      connectionNow,
      devtoolsSignals,
      requalifyPlayer,
      disqualifyPlayer,
    ]
  );

  const toggleSelectedPlayerId = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      if (prev.includes(playerId)) {
        return prev.filter((id) => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const refresh = () => {
    if (!fetchDisabled) {
      fetchPlayers();
      setFetchDisabled(true);
      setTimeout(() => setFetchDisabled(false), 1000);
    }
  };

  const showDeleteButton = () => {
    const selectedPlayers = players.filter((player) =>
      selectedPlayerIds.includes(player.id)
    );

    if (selectedPlayers.every((player) => player.is_disqualified)) {
      return true;
    }
    return false;
  };

  const showDisqualifyButton = () => {
    const selectedPlayers = players.filter((player) =>
      selectedPlayerIds.includes(player.id)
    );

    if (selectedPlayers.every((player) => !player.is_disqualified)) {
      return true;
    }
    return false;
  };

  const showRequalifyButton = () => {
    const selectedPlayers = players.filter((player) =>
      selectedPlayerIds.includes(player.id)
    );

    if (selectedPlayers.every((player) => player.is_disqualified)) {
      return true;
    }
    return false;
  };

  const table = useReactTable({
    data: players,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <div className="text-center flex flex-col h-full min-h-0 bg-slate-900 text-slate-100">
      {openTiebreakModal && (
        <TiebreakModal
          setOpen={setOpenTiebreakModal}
          adjustPoints={tiebreakAdjustPoints}
        />
      )}

      <div className="flex gap-1 place-items-center w-20 mx-auto mb-1 p-2">
        <p className="font-semibold whitespace-nowrap text-slate-100">Spēlētāji</p>
        <button disabled={fetchDisabled} onClick={refresh} className="text-slate-500 hover:text-slate-100 transition-colors">
          {fetchDisabled ? (
            <SpinnerCircularFixed size={12} thickness={230} color="#f1f5f9" />
          ) : (
            <i className="fa-solid fa-refresh"></i>
          )}
        </button>
      </div>
      <div className="bg-slate-900 grow min-h-0 overflow-auto admin-scrollbar text-slate-200 pr-1">
        <table className="w-full min-w-[720px] table-fixed text-sm sm:text-base">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="text-center bg-slate-800 text-slate-300 sticky top-0 z-10" key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as {
                    className?: string;
                  };

                  return (
                  <th
                    className={`px-2 py-3 sm:px-3 sm:py-3 font-semibold border-b border-slate-700 whitespace-nowrap truncate ${meta?.className ?? ""}`}
                    key={header.id}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                )})}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                className={`transition-colors border-b border-slate-700/60 ${
                  row.original.is_disqualified
                    ? "bg-red-950/40 odd:bg-red-900/40 text-red-300"
                    : "bg-slate-900 odd:bg-slate-800/60 hover:bg-slate-800 text-slate-200"
                }`}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as {
                    className?: string;
                  };

                  return (
                  <td className={`px-2 py-2 sm:px-3 sm:py-3 align-top ${meta?.className ?? ""}`} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )})}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedPlayerIds.length > 0 && (
        <div className="w-full min-h-14 py-2 flex justify-between place-items-center px-4 sm:px-6 bg-slate-800 font-semibold border-t border-slate-700 text-slate-200 place-self-end shadow-inner rounded-b-2xl sticky bottom-0">
          <div className="text-slate-300">Darbības</div>
          <div className="gap-2 flex flex-wrap place-items-center justify-end">
            {showDeleteButton() && (
              <button
                onClick={deletePlayer}
                className={`px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors`}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            )}
            {showDisqualifyButton() && (
              <button
                onClick={disqualifyPlayer}
                className={`px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm transition-colors`}
              >
                <i className="fa-solid fa-ban pe-2 "></i>Diskvalificēt
              </button>
            )}
            {showRequalifyButton() && (
              <button
                onClick={requalifyPlayer}
                className={`px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm transition-colors`}
              >
                <i className="fa-solid fa-rotate-left pe-2 "></i>Kvalificēt
              </button>
            )}
            <button
              onClick={handleTiebreak}
              className={`px-3 py-1.5 text-sm ${
                selectedPlayerIds.length < 1
                  ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950"
              } rounded-md transition-colors`}
              disabled={selectedPlayerIds.length < 1}
            >
              <i className="fa-solid fa-scale-balanced pe-2 "></i>Lauzt
            </button>
            <button
              onClick={() => setSelectedPlayerIds([])}
              className={`px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors`}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>{" "}
          </div>
        </div>
      )}
    </div>
  );
};


