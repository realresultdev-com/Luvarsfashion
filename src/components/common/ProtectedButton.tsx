import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  redirectTo?: string;
}

export default function ProtectedButton({
  children,
  onClick,
  className = "",
  redirectTo = "/login",
}: ProtectedButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      navigate(redirectTo);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
