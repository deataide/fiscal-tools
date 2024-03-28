import React, { useState, useRef } from "react";
import xmlParser from "xml-js";
import { calcTax } from "../utils/invoiceFilter";
import Modal from "react-modal";
import html2pdf from "html2pdf.js";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const XmlHandler = () => {
  const [invoices, setInvoices] = useState([]);
  const [tratedInvoices, setTratedInvoices] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const doc = useRef(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [clientData, setClientData] = useState({});

  const onSubmit = (data) => {
    setIsFormVisible(false);

    const clientData = {
      name: data.name,
      reference: data.reference,
      stateRegistration: data.stateRegistration,
    };

    setClientData(clientData);
    toast.success("Client data submitted successfully!");
  };

  const openModal = (invoice) => {
    setCurrentInvoice(invoice);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setCurrentInvoice(null);
    setModalIsOpen(false);
  };

  const handleDownloadPDF = () => {
    const options = {
      filename: "antecipacao.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "in",
        format: "letter",
        orientation: "landscape",
        margin: {
          top: 0.5,
          bottom: 0.5,
          left: 0.5,
          right: 0.5,
        },
      },
    };
    html2pdf().from(doc.current).set(options).save();
  };

  const handleImport = async (event) => {
    const files = event.target.files;
    let newInvoices = [];

    try {
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
    } catch (error) {
      toast.error(error);
    }
  };

  const filterHandle = () => {
    try {
      const calc = calcTax(invoices);
      setTratedInvoices(calc);
      console.log(calc);
      return;
    } catch (error) {
      toast.error(error);
    }
  };

  const clearInvoices = () => {
    setTratedInvoices([]);
    setInvoices([]);
  };

  return (
    <div className="h-screen">
      <ToastContainer />
      <div>
        <div className="mb-4 flex justify-center m-12 flex-col">
          <h1 className="flex justify-center text-blue-700 text-3xl font-bold">
           Generate your Tax
          </h1>
          <div className="m-8 flex justify-center ">
            <input
              type="file"
              id="fileInput"
              accept=".xml"
              onChange={handleImport}
              multiple
              className="border border-gray-300 rounded px-4 py-2 bg-white text-gray-800 shadow-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={filterHandle}
              className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Generate Docs
            </button>
            <button
              onClick={clearInvoices}
              className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Clear Docs
            </button>
            <button
              onClick={handleDownloadPDF}
              className="ml-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Download Docs
            </button>
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="ml-4 bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Set Client Data
            </button>
            {isFormVisible && (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-8 absolute bg-blue-300 border rounded px-3 py-2"
              >
                <div className="pt-4 pb-4 text-white text-2xl font-bold">
                  Client Data
                </div>
                <div className="mb-4">
                  <input
                    placeholder="Name"
                    type="text"
                    id="name"
                    {...register("name", { required: true })}
                    className={`w-full border border-gray-300 rounded px-3 py-2 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs">
                      O nome é obrigatório
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <input
                    placeholder="Reference..."
                    type="text"
                    id="reference"
                    {...register("reference", { required: true })}
                    className={`w-full border border-gray-300 rounded px-3 py-2 ${
                      errors.reference ? "border-red-500" : ""
                    }`}
                  />
                  {errors.reference && (
                    <span className="text-red-500 text-xs">
                      A referência é obrigatória
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="State Registration"
                    id="stateRegistration"
                    {...register("stateRegistration", { required: true })}
                    className={`w-full border border-gray-300 rounded px-3 py-2 ${
                      errors.stateRegistration ? "border-red-500" : ""
                    }`}
                  />
                  {errors.stateRegistration && (
                    <span className="text-red-500 text-xs">
                      A inscrição estadual é obrigatória
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold m-4">Invoices List</h1>
        <div className="overflow-x-auto" ref={doc}>
          {clientData && (
            <div className="flex justify-between m-4">
              <div>
                <p className="text-lg font-semibold">
                  Client: {clientData.name}
                </p>
                <p className="text-lg font-semibold">
                  I.E.: {clientData.stateRegistration}
                </p>
              </div>

              <p className="text-lg font-semibold">
                Ref: {clientData.reference}
              </p>
            </div>
          )}
          <table className="table-auto w-full border-collapse border border-gray-200 bg-slate-50">
            <thead>
              <tr>
                <th className="border border-gray-200 px-4 py-2">
                  Invoice Number
                </th>
                <th className="border border-gray-200 px-4 py-2">
                  Client Emit
                </th>
                <th className="border border-gray-200 px-4 py-2 bg-gray-300">
                  Total Tax (61)
                </th>
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
                    <button onClick={() => openModal(invoice)}>Details</button>
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

              <div className="flex justify-between items-center mb-4 bg-red-300">
                <div>
                  <p className="text-sm text-gray-600">Total Tributation 12:</p>
                  <p className="text-lg font-semibold">
                    {currentInvoice.total_tributation_12_0.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tributation 4:</p>
                  <p className="text-lg font-semibold">
                    {currentInvoice.total_tributation_4.toFixed(2)}
                  </p>
                </div>
                <hr className="my-4 border-gray-600" />
              </div>
              <ul>
                {Object.entries(currentInvoice.tax_calcs).map(
                  ([key, value]) => (
                    <li key={key} className="mb-4">
                      <span className="font-semibold text-gray-700">
                        {key}:
                      </span>
                      <div className="flex justify-between items-center bg-green-100">
                        <div>
                          <p className="text-sm text-gray-600">Total Value:</p>
                          <p className="text-lg font-semibold">{value.total}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Calculated Tax:
                          </p>
                          <p className="text-lg font-semibold">
                            {value.calculed_tax.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <hr className="my-4 border-gray-600" />
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
          <button
            onClick={closeModal}
            className="mt-6 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
          >
            Close
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default XmlHandler;
