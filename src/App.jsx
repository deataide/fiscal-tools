import React from "react";
import XmlHandler from './components/Importer'
function App() {

  return (
    <div className="flex flex-col h-screen">
      {/* Cabeçalho */}
      <div className="bg-lime-700 text-white py-4 text-center">
        <h1 className="text-2xl font-bold">Fiscal Tools</h1>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-grow bg-gray-100">
        <div className="container mx-auto py-8">
          <XmlHandler />
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-lime-700 text-white py-4 text-center">
        <p></p>
      </div>
    </div>
  );
}

export default App