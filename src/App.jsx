import React from "react";
import Modal from "react-modal";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages/Home";
import Antecipacao from "./pages/Antecipacao";
import Calculos from "./pages/Calculos";

function App() {
  Modal.setAppElement("#root");

  return (

     <BrowserRouter>
     <Routes>
      <Route path="fiscal-tools" element={<Home/>}/>
      <Route path="fiscal-tools/antecipacao" element={<Antecipacao/>}/>
      <Route path="fiscal-tools/calculos" element={<Calculos/>}/>
     </Routes>

  </BrowserRouter>

  );
}

export default App;
