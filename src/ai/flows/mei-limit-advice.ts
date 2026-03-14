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
      .filter((model: any) => model.id.endsWith(':free'))
      .map((model: any) => model.id);
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
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const model = await getAvailableFreeModel(apiKey);
    
    const prompt = `
Você é um tributarista especialista em transição de MEI para ME (Simples Nacional).
Analise os dados fiscais e projete a melhor estratégia de migração.

DADOS:
- Faturamento Projetado: R$ ${input.projecaoAnual}
- Acumulado até agora: R$ ${input.acumulado}
- Ramo: ${input.ramo}
- Custos: R$ ${input.custosAnuais}
- Pró-labore: R$ ${input.prolaboreAnual}

MISSÃO:
1. "riskAnalysis": Avalie o risco de ultrapassar o teto de 81k.
2. "migrationTiming": Quando é o momento ideal para migrar.
3. "fiscalOptimization": Sugestões para reduzir impostos no novo regime.
4. "profitImpact": Como o lucro líquido será afetado pela nova carga tributária.

Responda APENAS JSON:
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
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0]?.message?.content || "{}");

    return {
      riskAnalysis: parsed.riskAnalysis || "Análise de risco concluída.",
      migrationTiming: parsed.migrationTiming || "Consulte um contador.",
      fiscalOptimization: parsed.fiscalOptimization || [],
      profitImpact: parsed.profitImpact || []
    };
  } catch (error) {
    return {
      riskAnalysis: "Erro na análise tributária.",
      migrationTiming: "Tente novamente.",
      fiscalOptimization: [],
      profitImpact: []
    };
  }
}
