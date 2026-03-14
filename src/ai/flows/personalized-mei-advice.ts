'use server';

/**
 * @fileOverview Consultoria Financeira de Elite para MEI (Foco em Distribuição e Caixa).
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

export type PersonalizedMeiAdviceOutput = {
  summary: string;
  distributionAdvice: string[];
  savingsAdvice: string[];
  optimizationSuggestions: string[];
};

export async function personalizedMeiAdvice(input: {
  faturamentoMensal: number;
  custosOperacionais: number;
  prolabore: number;
  reservaPct: number;
  mesesFaturamento: number;
}): Promise<PersonalizedMeiAdviceOutput> {
  const defaultErrorResponse = {
    summary: "Falha temporária na análise financeira. Por favor, tente novamente em instantes.",
    distributionAdvice: ["Revise seus custos operacionais", "Mantenha a disciplina no pró-labore", "Ajuste o fluxo de caixa"],
    savingsAdvice: ["Foco na reserva de emergência", "Evite retiradas extras"],
    optimizationSuggestions: ["Redução de custos fixos", "Melhoria de margem", "Gestão de estoque"]
  };

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        ...defaultErrorResponse,
        summary: "Erro: Chave de API não configurada no servidor."
      };
    }

    const model = await getAvailableFreeModel(apiKey);
    
    const prompt = `
Você é um CFO de elite especializado em finanças para Microempreendedores Individuais.
Sua análise deve ser puramente financeira, focada na saúde do fluxo de caixa e na eficiência da distribuição de capital.

DADOS FINANCEIROS:
- Faturamento Mensal Médio: R$ ${input.faturamentoMensal}
- Custos Operacionais: R$ ${input.custosOperacionais}
- Pró-labore (Salário): R$ ${input.prolabore}
- Percentual de Reserva Pretendido: ${input.reservaPct}%
- Histórico: ${input.mesesFaturamento} meses registrados

SUA MISSÃO:
1. Analise a margem de segurança atual no campo "summary".
2. No campo "distributionAdvice", sugira ajustes no pró-labore ou custos para maximizar a reserva.
3. No campo "savingsAdvice", dê conselhos sobre a formação do colchão de segurança.
4. No campo "optimizationSuggestions", sugira 3 cortes ou otimizações de custos.

Responda APENAS um JSON válido. Não inclua markdown, não inclua explicações fora do JSON:
{
  "summary": "String",
  "distributionAdvice": ["Array de 3"],
  "savingsAdvice": ["Array de 2"],
  "optimizationSuggestions": ["Array de 3"]
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
    
    // Limpeza de possíveis blocos de código markdown na resposta
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || defaultErrorResponse.summary,
      distributionAdvice: Array.isArray(parsed.distributionAdvice) ? parsed.distributionAdvice : defaultErrorResponse.distributionAdvice,
      savingsAdvice: Array.isArray(parsed.savingsAdvice) ? parsed.savingsAdvice : defaultErrorResponse.savingsAdvice,
      optimizationSuggestions: Array.isArray(parsed.optimizationSuggestions) ? parsed.optimizationSuggestions : defaultErrorResponse.optimizationSuggestions
    };
  } catch (error) {
    console.error('Erro na IA Advice:', error);
    return defaultErrorResponse;
  }
}