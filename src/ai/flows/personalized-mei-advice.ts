'use server';

/**
 * @fileOverview Consultoria de IA para MEI.
 */
import { calculateDasValue } from '@/lib/dasCalculator';

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

export type PersonalizedMeiAdviceOutput = {
  summary: string;
  distributionAdvice: string[];
  meiLimitAdvice: string[];
  optimizationSuggestions: string[];
};

export async function personalizedMeiAdvice(input: {
  faturamentoMensal: number;
  custosOperacionais: number;
  prolabore: number;
  reservaPct: number;
  mesesFaturamento: number;
  meiLimiteAnual: number;
  ramo?: string;
}): Promise<PersonalizedMeiAdviceOutput> {
  const defaultResponse: PersonalizedMeiAdviceOutput = {
    summary: "Ocorreu um erro na análise estratégica. Verifique sua conexão ou a chave da API.",
    distributionAdvice: ["Revise seus custos mensais", "Ajuste o pro-labore conforme a sobra"],
    meiLimitAdvice: ["Monitore o teto de 81k", "Planeje a transição com antecedência"],
    optimizationSuggestions: ["Reduza custos fixos", "Aumente o ticket médio"]
  };

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      ...defaultResponse,
      summary: "Erro: chave da API não configurada. Adicione OPENROUTER_API_KEY no .env.local"
    };
  }

  try {
    const model = await getAvailableFreeModel(apiKey);
    const dasValue = calculateDasValue(input.ramo || "");
    const totalDespesas = input.custosOperacionais + dasValue + input.prolabore;
    const sobra = Math.max(0, input.faturamentoMensal - totalDespesas);
    
    const prompt = `
Você é um consultor financeiro de elite, focado em MEIs brasileiros.
Sua missão é dar um veredito tático REAL baseado nos números atuais de 2026.

DADOS DO NEGÓCIO:
- Ramo: ${input.ramo || "Geral"}
- Faturamento Médio: R$ ${input.faturamentoMensal}
- Custos: R$ ${input.custosOperacionais}
- DAS Mensal (Calculado): R$ ${dasValue}
- Pró-labore: R$ ${input.prolabore}
- Meses Ativos: ${input.mesesFaturamento}
- Teto MEI: R$ ${input.meiLimiteAnual}
- Sobra Real: R$ ${sobra}

MISSÃO:
1. "summary": Análise da saúde financeira. O negócio é sustentável ou um "castelo de cartas"? Identifique o gargalo. Use linguagem direta e profissional. Mencione se o DAS atual condiz com o ramo.
2. "distributionAdvice": 2-3 dicas de alocação.
3. "meiLimitAdvice": 2-3 dicas sobre o teto.
4. "optimizationSuggestions": 2-3 ações de otimização.

Responda APENAS JSON puro. Não inclua markdown (sem \`\`\`json):
{
  "summary": "string",
  "distributionAdvice": ["array"],
  "meiLimitAdvice": ["array"],
  "optimizationSuggestions": ["array"]
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

    if (!response.ok) throw new Error(`OpenRouter Error: ${response.status}`);

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "{}";
    
    // Limpeza de Markdown robusta
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || defaultResponse.summary,
      distributionAdvice: Array.isArray(parsed.distributionAdvice) ? parsed.distributionAdvice : defaultResponse.distributionAdvice,
      meiLimitAdvice: Array.isArray(parsed.meiLimitAdvice) ? parsed.meiLimitAdvice : defaultResponse.meiLimitAdvice,
      optimizationSuggestions: Array.isArray(parsed.optimizationSuggestions) ? parsed.optimizationSuggestions : defaultResponse.optimizationSuggestions
    };
  } catch (error: any) {
    console.error('Erro na Personalized Advice:', error);
    return defaultResponse;
  }
}
