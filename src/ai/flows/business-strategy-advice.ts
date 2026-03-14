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
      ?.filter((model: any) => model.id.endsWith(':free'))
      .map((model: any) => model.id) || [];
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
  nicho: string;
  modeloNegocio: string;
  canaisVenda: string[];
  ticketMedio: number;
  numClientes: number;
  desafio: string;
  meta: string;
}): Promise<BusinessStrategyOutput> {
  const defaultResponse = {
    verdict: "Análise estratégica pendente. Verifique os dados do perfil.",
    channelStrategy: ["Diversifique seus canais", "Otimize presença digital"],
    growthActions: ["Foco em retenção", "Expansão de base", "Ajuste de ticket"],
    benchmarking: ["Análise de concorrência necessária"]
  };

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const model = await getAvailableFreeModel(apiKey);
    
    const prompt = `
Você é um consultor de estratégia de negócios de alto nível. Analise o perfil deste MEI e forneça recomendações práticas e realistas.

PERFIL DO NEGÓCIO:
- Nome: ${input.nomeNegocio}
- Ramo: ${input.ramo}
- Nicho Específico: ${input.nicho}
- Modelo: ${input.modeloNegocio}
- Canais de Venda: ${input.canaisVenda.join(', ')}
- Ticket Médio: R$ ${input.ticketMedio}
- Clientes Ativos: ${input.numClientes}
- Desafio Principal: ${input.desafio}
- Meta Atual: ${input.meta}

MISSÃO:
1. "verdict": Uma análise afiada do posicionamento atual. O nicho é promissor? O ticket médio faz sentido para o ramo?
2. "channelStrategy": 3 sugestões de como otimizar ou expandir os canais de venda atuais focando no nicho específico.
3. "growthActions": 3 ações práticas de escala imediata.
4. "benchmarking": Como esse negócio se compara com os líderes desse nicho específico? O que eles fazem que este MEI ainda não faz?

Responda APENAS JSON puro. Não inclua markdown:
{
  "verdict": "string",
  "channelStrategy": ["array de 3 strings"],
  "growthActions": ["array de 3 strings"],
  "benchmarking": ["array de 3 strings"]
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
    
    // Limpeza de Markdown robusta
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(content);

    return {
      verdict: parsed.verdict || defaultResponse.verdict,
      channelStrategy: Array.isArray(parsed.channelStrategy) ? parsed.channelStrategy : defaultResponse.channelStrategy,
      growthActions: Array.isArray(parsed.growthActions) ? parsed.growthActions : defaultResponse.growthActions,
      benchmarking: Array.isArray(parsed.benchmarking) ? parsed.benchmarking : defaultResponse.benchmarking
    };
  } catch (error) {
    console.error('Erro na Business Strategy:', error);
    return defaultResponse;
  }
}
