'use server';

/**
 * @fileOverview Consultoria Financeira de Elite para MEI (Foco em Distribuição e Caixa).
 * Realiza cálculos no servidor antes de consultar a IA para evitar alucinações matemáticas.
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
  // 1. Cálculos Financeiros Precisos no Servidor
  const DAS_FIXO = 76;
  const totalDespesas = input.custosOperacionais + DAS_FIXO + input.prolabore;
  const sobra = Math.max(0, input.faturamentoMensal - totalDespesas);
  const valorReserva = (sobra * input.reservaPct) / 100;
  const lucroDisponivel = sobra - valorReserva;
  const margemSeguranca = input.faturamentoMensal > 0 ? (sobra / input.faturamentoMensal) * 100 : 0;
  
  // Ponto de Equilíbrio considerando a reserva pretendida
  const divisorEquilibrio = 1 - (input.reservaPct / 100);
  const pontoEquilibrio = divisorEquilibrio > 0 ? (totalDespesas / divisorEquilibrio) : totalDespesas;

  const defaultErrorResponse = {
    summary: `Análise técnica: Sua margem de segurança atual é de ${margemSeguranca.toFixed(1)}%. Com uma sobra real de R$ ${sobra.toFixed(0)}, você possui fôlego para manter a operação, mas a disciplina na reserva de R$ ${valorReserva.toFixed(0)} é inegociável.`,
    distributionAdvice: [
      `Mantenha o pró-labore em R$ ${input.prolabore}`,
      "Evite retiradas extras acima do lucro disponível",
      "Priorize o pagamento do DAS no dia 20"
    ],
    savingsAdvice: [
      `Sua meta de reserva mensal é R$ ${valorReserva.toFixed(0)}`,
      `Busque atingir o ponto de equilíbrio de R$ ${pontoEquilibrio.toFixed(0)}`
    ],
    optimizationSuggestions: [
      "Revise custos fixos mensais",
      "Aumente o ticket médio para expandir a margem",
      "Negocie prazos com fornecedores"
    ]
  };

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return {
        ...defaultErrorResponse,
        summary: "Aviso: Conectividade com IA limitada. Exibindo diagnóstico técnico baseado em cálculos locais."
      };
    }

    const model = await getAvailableFreeModel(apiKey);
    
    console.log('Enviando indicadores calculados para a IA:', {
      faturamento: input.faturamentoMensal,
      sobra,
      margem: margemSeguranca,
      lucroDisp: lucroDisponivel
    });

    const prompt = `
Você é um CFO de elite especializado em Microempreendedores Individuais.
Sua missão é interpretar os seguintes INDICADORES FINANCEIROS REAIS (calculados pelo sistema) e fornecer conselhos estratégicos.

DADOS FINANCEIROS REAIS:
· Faturamento Mensal: R$ ${input.faturamentoMensal.toFixed(2)}
· Custos Operacionais: R$ ${input.custosOperacionais.toFixed(2)}
· DAS Fixo: R$ ${DAS_FIXO.toFixed(2)}
· Pró-labore (Salário): R$ ${input.prolabore.toFixed(2)}
· Total de Despesas (Saídas): R$ ${totalDespesas.toFixed(2)}
· Sobra (Lucro antes da reserva): R$ ${sobra.toFixed(2)}
· Margem de Segurança: ${margemSeguranca.toFixed(1)}%
· Reserva Pretendida: ${input.reservaPct}%
· Valor da Reserva Mensal: R$ ${valorReserva.toFixed(2)}
· Lucro Disponível (Pós-reserva): R$ ${lucroDisponivel.toFixed(2)}
· Ponto de Equilíbrio Estratégico: R$ ${pontoEquilibrio.toFixed(2)}

DIRETRIZES:
1. "summary": Analise a saúde da margem de segurança e o fôlego do caixa. Seja direto e profissional.
2. "distributionAdvice": 3 ações práticas sobre pró-labore ou gestão de saídas.
3. "savingsAdvice": 2 conselhos sobre a formação do colchão de segurança baseados no valor da reserva calculado.
4. "optimizationSuggestions": 3 sugestões táticas de melhoria de margem ou redução de despesas.

Responda APENAS um JSON válido. Não inclua markdown, explicações ou texto fora do JSON:
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
        temperature: 0.3, // Menos criatividade, mais precisão técnica
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "{}";
    
    // Limpeza de possíveis blocos de código markdown
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary || defaultErrorResponse.summary,
      distributionAdvice: Array.isArray(parsed.distributionAdvice) ? parsed.distributionAdvice : defaultErrorResponse.distributionAdvice,
      savingsAdvice: Array.isArray(parsed.savingsAdvice) ? parsed.savingsAdvice : defaultErrorResponse.savingsAdvice,
      optimizationSuggestions: Array.isArray(parsed.optimizationSuggestions) ? parsed.optimizationSuggestions : defaultErrorResponse.optimizationSuggestions
    };
  } catch (error) {
    console.error('Erro na Consultoria de IA:', error);
    return defaultErrorResponse;
  }
}
