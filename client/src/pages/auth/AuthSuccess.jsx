import React from "react";
import { useParams } from "react-router-dom";

const AuthSuccess = () => {
    useEffect(() => {
        const params = useParams();
        console.log(params)
    }, [])
    
  return (
    <div>
      <h1>Auth Success</h1>
    </div>
  );
};

export default AuthSuccess;
