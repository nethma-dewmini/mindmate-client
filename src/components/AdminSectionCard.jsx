const AdminSectionCard = ({ title, description, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-[#5bb5a1] bg-[#f0fbf8] ring-2 ring-[#5bb5a1]/20"
          : "border-slate-200 bg-white hover:border-[#5bb5a1]/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div
          className={`mt-1 h-3 w-3 rounded-full ${
            active ? "bg-[#5bb5a1]" : "bg-slate-300"
          }`}
        />
      </div>
    </button>
  );
};

export default AdminSectionCard;
