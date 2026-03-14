'use server';

/**
 * @fileOverview Consultoria de IA para MEI.
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
}): Promise<PersonalizedMeiAdviceOutput> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      summary: "Erro: chave da API não configurada. Adicione OPENROUTER_API_KEY no .env.local",
      distributionAdvice: ["Configure sua API Key"],
      meiLimitAdvice: ["Chave ausente"],
      optimizationSuggestions: ["Verifique o arquivo .env"]
    };
  }

  const model = await getAvailableFreeModel(apiKey);
  const MEI_DAS_FIXO = 76;
  const totalDespesas = input.custosOperacionais + MEI_DAS_FIXO + input.prolabore;
  const sobra = Math.max(0, input.faturamentoMensal - totalDespesas);
  
  const faturamentoAnualProjetado = input.faturamentoMensal * 12;
  const faturamentoAcumulado = input.faturamentoMensal * input.mesesFaturamento;

  const prompt = `
Você é um consultor financeiro de elite, estilo Wall Street, focado em Microempreendedores Individuais (MEI) brasileiros.
Sua missão é dar um veredito tático REAL baseado nos números.

DADOS DO NEGÓCIO:
- Faturamento Médio: R$ ${input.faturamentoMensal}
- Custos: R$ ${input.custosOperacionais}
- Pró-labore: R$ ${input.prolabore}
- Meses Ativos: ${input.mesesFaturamento}
- Teto MEI: R$ ${input.meiLimiteAnual}

REGRAS PARA O "summary":
1. NÃO repita os números brutos.
2. Dê um VEREDITO: o negócio é sustentável ou um "castelo de cartas"?
3. Identifique o GARGALO principal.
4. Use linguagem direta, profissional e impactante. Foque no "pulo do gato".
5. Texto curto e denso.

Responda APENAS um JSON válido com as chaves:
- summary (string)
- distributionAdvice (array de strings)
- meiLimitAdvice (array de strings)
- optimizationSuggestions (array de strings)
`;

  try {
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

    if (!response.ok) {
      throw new Error(`OpenRouter Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    return JSON.parse(content);
  } catch (error: any) {
    return {
      summary: "Ocorreu um erro na análise estratégica. Verifique sua conexão ou a chave da API.",
      distributionAdvice: ["Erro na consulta"],
      meiLimitAdvice: ["Falha técnica"],
      optimizationSuggestions: ["Tente novamente em instantes"]
    };
  }
}