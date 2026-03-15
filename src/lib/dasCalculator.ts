/**
 * @fileOverview Calculadora dinâmica do DAS MEI baseada no salário mínimo de 2026 (R$ 1.621,00).
 */

export const calculateDasValue = (ramo: string = ""): number => {
  const SALARIO_MINIMO_2026 = 1621;
  const INSS = SALARIO_MINIMO_2026 * 0.05; // R$ 81,05
  const ICMS = 1.00;
  const ISS = 5.00;

  const ramoLower = ramo.toLowerCase();

  // MEI Caminhoneiro / Transporte Intermunicipal/Interestadual
  if (ramoLower.includes("transporte") || ramoLower.includes("caminhoneiro")) {
    const INSS_CAMINHONEIRO = SALARIO_MINIMO_2026 * 0.12; // R$ 194,52
    return INSS_CAMINHONEIRO + ICMS; // R$ 195,52
  }
  
  const isComercio = 
    ramoLower.includes("comércio") || 
    ramoLower.includes("indústria") || 
    ramoLower.includes("vendas") || 
    ramoLower.includes("loja") ||
    ramoLower.includes("revenda") ||
    ramoLower.includes("alimentação") ||
    ramoLower.includes("delivery") ||
    ramoLower.includes("bebidas") ||
    ramoLower.includes("artesanato");

  const isServicos = 
    ramoLower.includes("serviços") || 
    ramoLower.includes("consultoria") || 
    ramoLower.includes("freelancer") || 
    ramoLower.includes("estética") ||
    ramoLower.includes("beleza") ||
    ramoLower.includes("saúde") ||
    ramoLower.includes("design") ||
    ramoLower.includes("dev") ||
    ramoLower.includes("marketing") ||
    ramoLower.includes("tráfego") ||
    ramoLower.includes("manutenção");

  // Atividade Mista (Comércio + Serviços)
  if (isComercio && isServicos) {
    return INSS + ICMS + ISS; // R$ 87,05
  }

  // Apenas Serviços
  if (isServicos) {
    return INSS + ISS; // R$ 86,05
  }

  // Apenas Comércio / Indústria
  if (isComercio) {
    return INSS + ICMS; // R$ 82,05
  }
  
  // Fallback para Comércio se não identificado
  return INSS + ICMS;
};
