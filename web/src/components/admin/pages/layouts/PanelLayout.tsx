import { Outlet } from "react-router-dom";
import { AdminPanelProvider } from "../../../universal/AdminPanelContext";
import { BuzzerProvider } from "../../../universal/BuzzerContext";

export const PanelLayout = () => {
  return (
    <AdminPanelProvider>
      <BuzzerProvider>
        <Outlet />
      </BuzzerProvider>
    </AdminPanelProvider>
  );
};
