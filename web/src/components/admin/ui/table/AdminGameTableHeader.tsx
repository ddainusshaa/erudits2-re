export const AdminGameTableHeader = () => {
  return (
    <div className="flex bg-white mb-2 rounded-sm justify-between">
      <div className="flex gap-6 px-8 p-2">
        <span className="w-80 font-bold font-[Manrope]">Nosaukums</span>
        <div className="w-[1px] bg-gray-400"></div>
        <span className="font-bold font-[Manrope]">Izveidots</span>
      </div>
      <div className="w-80">
        <form className="flex">
          <div className="w-[1px] bg-gray-400 m-2"></div>
          <input
            type="text"
            className="w-full h-10 font-[Manrope] ps-2 focus:outline-none"
            placeholder="Meklēt..."
          />
          <button type="submit" className="px-4">
            <i className="fa-solid fa-magnifying-glass text-gray-400 text-xl"></i>
          </button>
        </form>
      </div>
    </div>
  );
};
