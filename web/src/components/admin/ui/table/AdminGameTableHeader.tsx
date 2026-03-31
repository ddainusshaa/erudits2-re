export const AdminGameTableHeader = () => {
  return (
    <div className="flex bg-slate-900 mb-2 rounded-sm justify-between text-slate-200 border border-slate-700">
      <div className="flex gap-6 px-8 p-2">
        <span className="w-80 font-bold font-[Manrope]">Nosaukums</span>
        <div className="w-[1px] bg-slate-700"></div>
        <span className="font-bold font-[Manrope]">Izveidots</span>
      </div>
      <div className="w-80">
        <form className="flex">
          <div className="w-[1px] bg-slate-700 m-2"></div>
          <input
            type="text"
            className="w-full h-10 font-[Manrope] ps-2 text-slate-200 placeholder-slate-500 bg-transparent focus:outline-none"
            placeholder="Meklēt..."
          />
          <button type="submit" className="px-4">
            <i className="fa-solid fa-magnifying-glass text-slate-500 text-xl"></i>
          </button>
        </form>
      </div>
    </div>
  );
};
