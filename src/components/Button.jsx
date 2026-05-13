const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
  icon: Icon,
  iconPosition = "left",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-indigo-500",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-indigo-500",
    gradient:
      "gradient-primary text-white hover:opacity-90 focus:ring-indigo-500 shadow-md",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? disabledStyles : ""}
        ${className}
      `}
    >
      {Icon && iconPosition === "left" && <Icon className="mr-2" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="ml-2" />}
    </button>
  );
};

export default Button;
