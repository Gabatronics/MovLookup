import './App.css';
// components
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// pages
import Home from "./pages/Home";
import Movies from "./pages/movies";
import RegisterPage from "./pages/register";
import LoginPage from "./pages/login";
import MoviePage from "./pages/moviePage";

import Individual from "./pages/individual";


function App() {
  return (
    <BrowserRouter>
    <div className="App">
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<Movies />} />
      <Route path="/Register" element={<RegisterPage/>} />
      <Route path="/Login" element={<LoginPage/>} />
      <Route path="/moviePage" element={<MoviePage />} />
      
      <Route path="/individual" element={<Individual/>} />
    </Routes>
    {/* the content */}
    
    <Footer />
  </div>
  </BrowserRouter>
  );
}

export default App;
