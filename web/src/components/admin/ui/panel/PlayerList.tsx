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
import { formatText } from "../../../universal/functions";
import { TiebreakModal } from "./TiebreakModal";

export const PlayerList = () => {
  const [sorting, setSorting] = useState([
    { id: "is_disqualified", desc: false },
  ]);

  const [fetchDisabled, setFetchDisabled] = useState(false);
  const [pointsDisabled, setPointsDisabled] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [openTiebreakModal, setOpenTiebreakModal] = useState(false);

  const { fetchPlayers, players, setPlayers, instanceId } = useAdminPanel();

  const showToast = useToast();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const confirm = useConfirmation();

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
        cell: (info) => {
          const sortedRowIndex = table
            .getRowModel()
            .rows.findIndex((row) => row.id === info.row.id);
          return sortedRowIndex + 1;
        },
      }),
      columnHelper.accessor("player_name", {
        header: "Nosaukums",
        cell: (info) => (
          <p title={info.getValue()}>{formatText(info.getValue(), 10)}</p>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("points", {
        header: "Punkti",
        cell: (info) => {
          return (
            <div className="flex gap-3 place-items-center">
              <button
                disabled={pointsDisabled}
                onClick={() => adjustPoints(info.row.original, 1)}
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
                onClick={() => adjustPoints(info.row.original, -1)}
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
              className={`rounded-full w-4 h-4 mx-auto ${
                info.getValue() ? "bg-red-500" : "bg-emerald-500"
              }`}
            ></div>
          );
        },
      }),
      columnHelper.display({
        header: "Darbības",
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
    [columnHelper, requalifyPlayer, disqualifyPlayer]
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
    <div className="text-center flex flex-col h-full bg-white text-slate-800">
      {openTiebreakModal && (
        <TiebreakModal
          setOpen={setOpenTiebreakModal}
          adjustPoints={tiebreakAdjustPoints}
        />
      )}

      <div className="flex gap-1 place-items-center w-20 mx-auto mb-1 p-2">
        <p className="font-semibold whitespace-nowrap text-slate-800">Spēlētāji</p>
        <button disabled={fetchDisabled} onClick={refresh} className="text-slate-300 hover:text-slate-800 transition-colors">
          {fetchDisabled ? (
            <SpinnerCircularFixed size={12} thickness={230} color="#1e293b" />
          ) : (
            <i className="fa-solid fa-refresh"></i>
          )}
        </button>
      </div>
      <div className="bg-white grow overflow-x-auto text-slate-700">
        <table className="w-full text-sm sm:text-base">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr className="text-center bg-slate-50 text-slate-500" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className="p-4 font-semibold border-b border-slate-200" key={header.id}>
                    {flexRender(
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
                className={`transition-colors border-b border-slate-200/50 ${
                  row.original.is_disqualified
                    ? "bg-red-50 odd:bg-red-100 text-red-700"
                    : "bg-white odd:bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <td className="p-2 sm:p-4 text-center" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedPlayerIds.length > 0 && (
        <div className="w-full h-14 flex justify-between place-items-center px-6 bg-slate-50 font-semibold border-t border-slate-200 text-slate-700 place-self-end shadow-inner rounded-b-2xl">
          <div>Darbības</div>
          <div className="gap-2 flex place-items-center">
            {showDeleteButton() && (
              <button
                onClick={deletePlayer}
                className={`px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-sm`}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            )}
            {showDisqualifyButton() && (
              <button
                onClick={disqualifyPlayer}
                className={`px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-sm`}
              >
                <i className="fa-solid fa-ban pe-2 "></i>Diskvalificēt
              </button>
            )}
            {showRequalifyButton() && (
              <button
                onClick={requalifyPlayer}
                className={`px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded-sm`}
              >
                <i className="fa-solid fa-rotate-left pe-2 "></i>Kvalificēt
              </button>
            )}
            <button
              onClick={handleTiebreak}
              className={`px-4 py-1 ${
                selectedPlayerIds.length < 1
                  ? "bg-slate-500 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600"
              } text-white rounded-sm`}
              disabled={selectedPlayerIds.length < 1}
            >
              <i className="fa-solid fa-scale-balanced pe-2 "></i>Lauzt
            </button>
            <button
              onClick={() => setSelectedPlayerIds([])}
              className={`px-4 py-1 ${"bg-blue-500 hover:bg-blue-600"} text-white rounded-sm`}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>{" "}
          </div>
        </div>
      )}
    </div>
  );
};


