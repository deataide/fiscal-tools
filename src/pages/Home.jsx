import React from "react";
import Image from "../assets/coin.png";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import FunctionCard from "../components/FunctionCard";

export default function Home() {
  return (
    <Layout>
      <div className="max-h-screen p-8 flex">
        <FunctionCard name={"Antecipação"} link={"antecipacao"} />

        <FunctionCard name={"Cálculos"} link={"calculos"}  />
      </div>
    </Layout>
  );
}
