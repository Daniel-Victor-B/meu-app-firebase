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
  ramo: string;
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
  
  const prompt = `
Você é um consultor financeiro de elite, especialista em Microempreendedores Individuais (MEI) brasileiros.
O negócio atua no ramo de: ${input.ramo}.

Sua missão é dar um veredito tático REAL baseado nos números e no contexto específico deste setor.

DADOS DO NEGÓCIO:
- Ramo de Atividade: ${input.ramo}
- Faturamento Médio Mensal: R$ ${input.faturamentoMensal}
- Custos Operacionais: R$ ${input.custosOperacionais}
- Pró-labore (Salário): R$ ${input.prolabore}
- Meses Ativos no Ano: ${input.mesesFaturamento}
- Teto MEI Anual: R$ ${input.meiLimiteAnual}

INSTRUÇÕES ESTRATÉGICAS:
1. Adapte todas as sugestões e o veredito às particularidades e desafios do ramo de "${input.ramo}".
2. Analise se a margem de lucro está adequada para este setor específico.
3. Identifique o gargalo principal (custos, teto MEI ou retirada pessoal).
4. No campo "summary", forneça um veredito direto, profissional e altamente estratégico sobre a saúde do negócio.

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
