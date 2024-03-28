export function calcTax(invoices) {
  let results = [];

  try {
    invoices.forEach((invoice) => {
      if (invoice.ufEmitente === "MG") {
        throw new Error("Nota de dentro do estado de MG");
      }
      if (!invoice.itens || invoice.itens.length === 0) {
        throw new Error("A nota não contém produtos");
      }

      let total_tax = 0; // Valor do Imposto Calculado
      let tax_substitution = 0; // Valor total da substituição
      const tax_calcs = {}; // Valor total das notas e o imposto individual
      let total_tributation_4 = 0; // Valor total do imposto calculado sobre 17.07%
      let total_tributation_12_0 = 0; // Valor total do imposto calculado sobre 7.32%

      invoice.itens.forEach((item) => {
        const keyNcmCfop = `NCM:${item.ncm}, CFOP:${item.cfop}`;

        if (!tax_calcs[keyNcmCfop]) {
          tax_calcs[keyNcmCfop] = {
            total: 0,
            calculed_tax: 0,
          };
        }

        let aliquota = 0;

        if (item.aliq == 4) {
          aliquota = 17.07;
        } else if (item.aliq == 12 || item.aliq == 0) {
          aliquota = 7.32;
        } else {
          throw new Error("Aliquota Not Defined");
        }

        if (aliquota == 17.07 && item.cfop.startsWith("61")) {
          total_tributation_4 += item.value
        }
        if (aliquota == 7.32 && item.cfop.startsWith("61")) {
          total_tributation_12_0 += item.value
        }

        // Calcula o imposto individual para o item
        const item_tax = (item.value * aliquota) / 100;

        tax_calcs[keyNcmCfop].total += item.value;
        tax_calcs[keyNcmCfop].calculed_tax += item_tax;

        // Adicione o valor do imposto individual ao total_tax
        if (item.cfop.startsWith("61")) {
          total_tax += item_tax;
        } else {
          tax_substitution += item.value;
        }
      });

      const ObjectReturn = {
        header: {
          invoiceNumber: invoice.number,
          cnpjEmitente: invoice.cnpjEmitente,
          nameEmit: invoice.nameEmitente,
        },
        tax_calcs,
        total_tax,
        tax_substitution,
        total_tributation_12_0,
        total_tributation_4
      };

      results.push(ObjectReturn);
    });

    return results;
  } catch (error) {
    console.error("Erro ao calcular os impostos:", error.message);
    throw new Error(error);
  }
}
