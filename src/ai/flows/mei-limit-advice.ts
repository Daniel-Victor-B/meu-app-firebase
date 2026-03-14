'use server';

/**
 * @fileOverview Consultoria de Transição Tributária (Foco em Limite e Regimes).
 */

async function getAvailableFreeModel(apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    const freeModels = data.data
      ?.filter((model: any) => model.id.endsWith(':free'))
      .map((model: any) => model.id) || [];
    if (freeModels.length > 0) return freeModels[0];
    return 'meta-llama/llama-3.2-3b-instruct:free';
  } catch {
    return 'meta-llama/llama-3.2-3b-instruct:free';
  }
}

export type MeiLimitAdviceOutput = {
  riskAnalysis: string;
  migrationTiming: string;
  fiscalOptimization: string[];
  profitImpact: string[];
};

export async function meiLimitAdvice(input: {
  projecaoAnual: number;
  acumulado: number;
  ramo: string;
  custosAnuais: number;
  prolaboreAnual: number;
}): Promise<MeiLimitAdviceOutput> {
  const defaultResponse = {
    riskAnalysis: "Análise de risco indisponível no momento.",
    migrationTiming: "Consulte um contador para avaliar o teto de 81k.",
    fiscalOptimization: ["Planejamento tributário", "Revisão de DAS"],
    profitImpact: ["Análise de margem necessária"]
  };

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const model = await getAvailableFreeModel(apiKey);
    
    const prompt = `
Você é um tributarista especialista em transição de MEI para ME.
Analise os dados fiscais e projete a melhor estratégia.

DADOS:
- Faturamento Projetado: R$ ${input.projecaoAnual}
- Acumulado: R$ ${input.acumulado}
- Ramo: ${input.ramo}
- Custos: R$ ${input.custosAnuais}

MISSÃO:
1. "riskAnalysis": Avalie o risco de ultrapassar 81k.
2. "migrationTiming": Momento ideal para migrar.
3. "fiscalOptimization": Redução de impostos no novo regime.
4. "profitImpact": Impacto no lucro líquido.

Responda APENAS JSON puro. Não inclua markdown:
{
  "riskAnalysis": "string",
  "migrationTiming": "string",
  "fiscalOptimization": ["array"],
  "profitImpact": ["array"]
}
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "{}";
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(content);

    return {
      riskAnalysis: parsed.riskAnalysis || defaultResponse.riskAnalysis,
      migrationTiming: parsed.migrationTiming || defaultResponse.migrationTiming,
      fiscalOptimization: Array.isArray(parsed.fiscalOptimization) ? parsed.fiscalOptimization : defaultResponse.fiscalOptimization,
      profitImpact: Array.isArray(parsed.profitImpact) ? parsed.profitImpact : defaultResponse.profitImpact
    };
  } catch (error) {
    console.error('Erro na Limit Advice:', error);
    return defaultResponse;
  }
}