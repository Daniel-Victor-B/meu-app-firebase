'use server';

/**
 * @fileOverview Consultoria Estratégica para o Perfil do Negócio.
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

export type BusinessStrategyOutput = {
  verdict: string;
  channelStrategy: string[];
  growthActions: string[];
  benchmarking: string[];
};

export async function businessStrategyAdvice(input: {
  nomeNegocio: string;
  ramo: string;
  modeloNegocio: string;
  canaisVenda: string[];
  ticketMedio: number;
  numClientes: number;
  desafio: string;
  meta: string;
}): Promise<BusinessStrategyOutput> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const model = await getAvailableFreeModel(apiKey);
    
    const prompt = `
Você é um consultor de estratégia de negócios de alto nível. Analise o perfil deste MEI e forneça recomendações de crescimento.

PERFIL:
- Nome: ${input.nomeNegocio}
- Ramo: ${input.ramo}
- Modelo: ${input.modeloNegocio}
- Canais: ${input.canaisVenda.join(', ')}
- Ticket Médio: R$ ${input.ticketMedio}
- Clientes: ${input.numClientes}
- Maior Desafio: ${input.desafio}
- Meta Principal: ${input.meta}

MISSÃO:
1. "verdict": Análise estratégica do posicionamento atual vs meta.
2. "channelStrategy": Como otimizar os canais de venda atuais.
3. "growthActions": 3 ações práticas para atingir a meta.
4. "benchmarking": Como esse negócio se compara a líderes do setor.

Responda APENAS JSON:
{
  "verdict": "string",
  "channelStrategy": ["array"],
  "growthActions": ["array"],
  "benchmarking": ["array"]
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
      verdict: parsed.verdict || "Análise concluída.",
      channelStrategy: parsed.channelStrategy || [],
      growthActions: parsed.growthActions || [],
      benchmarking: parsed.benchmarking || []
    };
  } catch (error) {
    return {
      verdict: "Erro na consultoria estratégica.",
      channelStrategy: [],
      growthActions: [],
      benchmarking: []
    };
  }
}
