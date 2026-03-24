import { SpinnerCircularFixed } from "spinners-react";
import { IGame } from "../../interface/IGame";
import { AdminGameTableHeader } from "./AdminGameTableHeader";
import { AdminGameTableItem } from "./AdminGameTableItem";
import { AdminSidebarProvider } from "../../../universal/AdminGameSidebarContext";

export const AdminGameTable = ({
  games,
  onActivationModalOpen,
}: {
  games?: IGame[] | null;
  onActivationModalOpen: (game: IGame) => void;
}) => {
  return (
    <AdminSidebarProvider>
      <ul className="w-full gap-2 flex flex-col pb-4">
        <li>
          <AdminGameTableHeader />
        </li>
        {!games && (
          <div className="mx-auto">
            <SpinnerCircularFixed color="#ffffff" size={40} thickness={150} />
          </div>
        )}
        {games &&
          games.map((game) => {
            return (
              <AdminGameTableItem
                key={game.id}
                game={game}
                onActivationModalOpen={onActivationModalOpen}
              />
            );
          })}
      </ul>
    </AdminSidebarProvider>
  );
};
