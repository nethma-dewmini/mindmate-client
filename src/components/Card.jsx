const Card = ({ children, className = "", padding = "md", hover = false, onClick }) => {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverStyles = hover ? "hover:shadow-lg hover:-translate-y-1 cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-soft border border-slate-100
        ${paddings[padding]}
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
