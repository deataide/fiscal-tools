import React, { useState } from "react";
import xmlParser from "xml-js";
import {calcTax} from '../utils/invoiceFilter'
import Modal from "react-modal";

const XmlHandler = () => {
  const [invoices, setInvoices] = useState([]);
  const [tratedInvoices, setTratedInvoices] = useState([]);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (invoice) => {
    setCurrentInvoice(invoice);
    setModalIsOpen(true);
  };

  const toggleClass = () => {
    setIsOpen(!isOpen);
  };

  const closeModal = () => {
    setCurrentInvoice(null);
    setModalIsOpen(false);
  };

  const handleImport = async (event) => {
    const files = event.target.files;
    let newInvoices = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "text/xml") {
        const text = await file.text();
        const xmlData = xmlParser.xml2js(text, { compact: true });

        const notaData = {
          number: xmlData.nfeProc.NFe.infNFe.ide.nNF._text,
          cnpjRemetente: xmlData.nfeProc.NFe.infNFe.dest.CNPJ._text,
          nameEmitente: xmlData.nfeProc.NFe.infNFe.emit.xNome._text,
          cnpjEmitente: xmlData.nfeProc.NFe.infNFe.emit.CNPJ._text,
          ufEmitente: xmlData.nfeProc.NFe.infNFe.emit.enderEmit.UF._text,
          itens: [],
        };

        const itens = xmlData.nfeProc.NFe.infNFe.det || [];

        if (Array.isArray(itens)) {
          itens.forEach((item) => {
            const nItem = item._attributes.nItem;
            const prod = item.prod;
            const aliq =
              item.imposto.ICMS.ICMS00 || item.imposto.ICMS.ICMS10 || [];

            const newItem = {
              item: nItem,
              xProd: prod.xProd?._text || "",
              ncm: prod.NCM?._text || "",
              cfop: prod.CFOP?._text || "",
              aliq: parseFloat(aliq.pICMS?._text?.replace(",", ".")) || 0,
              value: parseFloat(prod.vProd?._text?.replace(",", ".")) || 0,
            };
            notaData.itens.push(newItem);
            notaData.totalValue += newItem.value;
          });
        }

        newInvoices.push(notaData);
      }
    }
    setInvoices([...invoices, ...newInvoices]);
  };

  const filterHandle = () => {
    try {
      const calc = calcTax(invoices);
      setTratedInvoices(calc);
      console.log(calc);
      return calc;
    } catch (error) {
      console.log(error);
    }
  };

  const clearInvoices = () =>{
    setTratedInvoices([])
    setInvoices([])
  }

  return (
    <div className="h-screen">
      <div>

      <div className="mb-4 flex justify-center m-12 flex-col">
        <h1 className="flex justify-center text-blue-700 text-3xl font-bold">Choose your XML files</h1>
      <div className="m-8 flex justify-center ">

        <input
          type="file"
          id="fileInput"
          accept=".xml"
          onChange={handleImport}
          multiple
          className="border border-gray-300 rounded px-2 py-1"
        />
        <button
          onClick={filterHandle}
          className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate
        </button>
        <button
          onClick={clearInvoices}
          className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Clear
        </button>
</div>

      </div>
      <h1 className="text-2xl font-bold m-4">Lista de Invoices</h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-200 bg-slate-50">
          <thead>
            <tr>
              <th className="border border-gray-200 px-4 py-2">
                Invoice Number
              </th>
              <th className="border border-gray-200 px-4 py-2">Client Emit</th>
              <th className="border border-gray-200 px-4 py-2 bg-gray-300">Total Tax (61)</th>
              <th className="border border-gray-200 px-4 py-2">
                Tax Substitution (64)
              </th>
            </tr>
          </thead>
          <tbody>
            {tratedInvoices.map((invoice, index) => (
              <tr key={index}>
                <td className="border border-gray-200 px-4 py-2">
                  {invoice.header.invoiceNumber}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {invoice.header.nameEmit}
                </td>
                <td className="border border-gray-200 px-4 py-2 bg-gray-300">
                  {invoice.total_tax.toFixed(2)}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {invoice.tax_substitution.toFixed(2)}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <button onClick={() => openModal(invoice)}>
                    Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
  {currentInvoice && (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Details</h2>
      <ul>
        {Object.entries(currentInvoice.tax_calcs).map(([key, value]) => (
          <li key={key} className="mb-4">
            <span className="font-semibold text-gray-700">{key}:</span>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Valor Total:</p>
                <p className="text-lg font-semibold">{value.total}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Imposto Calculado:</p>
                <p className="text-lg font-semibold">{value.calculed_tax.toFixed(2)}</p>
              </div>
            </div>
            <hr className="my-4 border-gray-600" />

          </li>
        ))}
      </ul>
    </div>
  )}
  <button onClick={closeModal} className="mt-6 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700">
    Fechar
  </button>
</Modal>

    </div>
    </div>

  );
};

export default XmlHandler;