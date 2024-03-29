import React from "react";
import Image from '../assets/coin.png'
import { Link } from "react-router-dom";

export default function FunctionCard({link, name, color}) {
  return (
  
      <div className={`border border-gray-300 p-4 w-1/5 flex justify-center items-center flex-col m-2`}>
        <img src={Image} alt="Antecipacao Image" className="w-16 mb-2" />
        <Link to={`${link}`}>
          <button className="text-white font-semibold bg-green-500 px-4 py-2 rounded-md hover:bg-green-700">
            {name}
          </button>
        </Link>
      </div>
    
  );
}
