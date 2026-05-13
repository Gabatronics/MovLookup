import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { Button} from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";


export default function Nav() {
  const apiUrl = import.meta.env.VITE_MOVIE_API_URL;

  /* use states to change from register, login to logout, persons page*/
  const [ thirdIcon, setThirdIcon] = useState("");
  const [ thirdIconName, setThirdIconName] = useState("");
  const [ fourthIcon, setFourthIcon]  = useState("");
  const [ fourthIconName, setFourthIconName]  = useState("");
  
  /* use states to change for token*/
  const [ token, setToken]  = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  /* Endpoint of loggint out user*/
  const url = `${apiUrl}/user/logout`
  
  const logout = () => {
    return fetch(url, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: token })
    })
      .then(res => res.json())
      .then(data => { 
        localStorage.clear();
        if (data.message) {
          console.info(data.message);
        }
        window.location.reload();
      })
      .catch(error => { /* If error detected, log error*/
        console.error('Error:', error);
      });
    }


    
  /* This happens at every render*/
  useEffect(() => { 
    const localToken = localStorage.getItem("refreshToken");
    setToken(localToken);
    let currentTime = Date.now() / 1000;
    
      /* If user has tokens stored, they must be a logged in users*/
      if (localToken) { 
        const decoded = jwtDecode(localToken);
        if (decoded.exp > currentTime){ /* If refresh token isn't expired*/
          setThirdIcon(""); /* set navigation point for logout to the home page*/
          setThirdIconName("Logout"); /* display third tab as logout*/
    
          setFourthIcon("individual");/* set navigation point for logout to the persons page*/
          setFourthIconName("Actors"); /* display fourth tab as users email*/
          return
      }} 

        setThirdIcon("Register"); /* set navigation point for logout to the register page*/
        setThirdIconName("Register");  /* display third tab as register*/
        
        setFourthIcon("Login"); /* set navigation point for logout to the loginpage*/
        setFourthIconName("Login"); /* display fourth tab as login*/
        
      
       
  }, []);

  return (
    <nav>
      <ul>
        <li>
          <Link className={location.pathname === "/" ? "active" : ""} to="/">Home</Link>
        </li>
        <li> 
          <Link className={["/movies", "/moviePage"].includes(location.pathname) ? "active" : ""} to="/movies">Movies</Link> 
        </li>
        <Button className={`transparent-button ${
          thirdIcon === "Register" && location.pathname.toLowerCase() === "/register" ? "active" : ""
        }`}
        onClick={() => {
        if (thirdIcon === "Register"){
          navigate(`/${thirdIcon}`);
        }else{
          logout()
          navigate(`/`);
        }
      }}
    >
      {thirdIconName}
    </Button>

    
        <li>
          <Link className={location.pathname.toLowerCase() === `/${fourthIcon}`.toLowerCase() ? "active" : ""} to={`/${fourthIcon}`}>{fourthIconName}</Link>
        </li>
        
      </ul>
    </nav>
  );
}
