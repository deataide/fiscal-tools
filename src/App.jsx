import React from "react";
import XmlHandler from "./components/XmlHandler";
import Modal from "react-modal";

function App() {
  Modal.setAppElement("#root");

  return (
    <div className="flex flex-col h-screen">
      {/* Cabeçalho */}
      <div className="text-white py-4 text-center bg-gradient-to-r from-blue-500 to-green-500 w-full h-64 shadow-md">
        <h1 className="text-2xl font-bold">Fiscal Tools</h1>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-grow bg-gray-100">
        <div className="container mx-auto py-8">
          <XmlHandler />
        </div>
      </div>
    </div>
  );
}

export default App;
