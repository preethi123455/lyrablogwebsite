import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { SERVER_URL } from "./constant";

const ProtectedRoute = ({ children }) => {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/users/me`, {
      credentials: "include",
    })
      .then((res) => {
        setIsAuth(res.ok);
      })
      .catch(() => {
        setIsAuth(false);
      });
  }, []);

  if (isAuth === null) {
    return <div>authentication checking</div>;
  }
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
