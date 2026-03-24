import { SpinnerCircularFixed } from "spinners-react";

export const SubmitSaveButton = ({
  onSave,
  showSpinner = false,
  hideSaveButton = false,
  hideContinueButton = false,
}: {
  onSave?: (e: { preventDefault: () => void }) => void;
  showSpinner?: boolean;
  hideSaveButton?: boolean;
  hideContinueButton?: boolean;
}) => {
  return showSpinner ? (
    <div className="h-12 bg-slate-300 w-60 rounded-md transition-all shadow-lg ">
      <div className="flex justify-center place-items-center w-full h-full">
        <SpinnerCircularFixed color="#ffffff" size={35} thickness={180} />
      </div>
    </div>
  ) : (
    <div className="flex gap-[2px]">
      {!hideContinueButton && (
        <input
          className={`h-12  bg-[#E63946] ${
            hideSaveButton ? "rounded-md w-60" : "rounded-s-md w-48"
          } shadow-lg text-white text-xl font-bold hover:bg-opacity-70 transition-all hover:cursor-pointer`}
          type="submit"
          value="Turpināt"
        />
      )}
      {!hideSaveButton && (
        <button
          onClick={onSave}
          className={`h-12  bg-[#E63946] ${
            hideContinueButton ? "rounded-md w-60" : "rounded-e-md w-12"
          } shadow-lg text-white text-xl font-bold hover:bg-opacity-70 transition-all hover:cursor-pointer`}
        >
          <i className="fa-solid fa-floppy-disk"></i>
        </button>
      )}
    </div>
  );
};
