'use server';

/**
 * @fileOverview Fluxo de aconselhamento financeiro para MEI via OpenRouter.
 */

async function getAvailableFreeModel(apiKey: string): Promise<string> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    
    // Filtra modelos gratuitos (terminam com :free)
    const freeModels = data.data
      .filter((model: any) => model.id.endsWith(':free'))
      .map((model: any) => model.id);
    
    if (freeModels.length > 0) {
      return freeModels[0];
    }
    
    // Fallback para modelos conhecidos
    return 'meta-llama/llama-3.2-3b-instruct:free';
  } catch (error) {
    console.error('Erro ao buscar modelos:', error);
    return 'meta-llama/llama-3.2-3b-instruct:free';
  }
}

export async function personalizedMeiAdvice(input: {
  faturamentoMensal: number;
  custosOperacionais: number;
  prolabore: number;
  reservaPct: number;
  mesesFaturamento: number;
  meiLimiteAnual: number;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      summary: "Erro: chave da API não configurada. Adicione OPENROUTER_API_KEY no .env.local",
      distributionAdvice: [],
      meiLimitAdvice: [],
      optimizationSuggestions: []
    };
  }

  // Busca um modelo gratuito disponível
  const model = await getAvailableFreeModel(apiKey);

  // Cálculos financeiros localmente
  const MEI_DAS_FIXO = 76;
  const totalDespesas = input.custosOperacionais + MEI_DAS_FIXO + input.prolabore;
  const sobra = Math.max(0, input.faturamentoMensal - totalDespesas);
  const reserva = Math.round((sobra * input.reservaPct) / 100);
  const lucro = sobra - reserva;

  const faturamentoAnualProjetado = input.faturamentoMensal * 12;
  const faturamentoAcumulado = input.faturamentoMensal * input.mesesFaturamento;
  const percentualLimiteProjetado = Math.round((faturamentoAnualProjetado / input.meiLimiteAnual) * 100);
  const percentualLimiteAcumulado = Math.round((faturamentoAcumulado / input.meiLimiteAnual) * 100);
  const restanteLimite = Math.max(0, input.meiLimiteAnual - faturamentoAcumulado);
  const limite80 = input.meiLimiteAnual * 0.8;

  const prompt = `
Você é um consultor financeiro especializado em MEI. Com base nos dados abaixo, gere um conselho em JSON com as chaves:
- summary (string)
- distributionAdvice (array de strings)
- meiLimitAdvice (array de strings)
- optimizationSuggestions (array de strings)

Dados:
- Faturamento Mensal: R$ ${input.faturamentoMensal}
- Custos: R$ ${input.custosOperacionais}
- Pró-labore: R$ ${input.prolabore}
- Reserva: ${input.reservaPct}% da sobra
- Meses com faturamento: ${input.mesesFaturamento}
- Limite Anual MEI: R$ ${input.meiLimiteAnual}

Cálculos:
- DAS Fixo: R$ ${MEI_DAS_FIXO}
- Total Despesas: R$ ${totalDespesas}
- Sobra: R$ ${sobra}
- Reserva: R$ ${reserva}
- Lucro Disponível: R$ ${lucro}
- Faturamento Anual Projetado: R$ ${faturamentoAnualProjetado}
- Faturamento Acumulado: R$ ${faturamentoAcumulado}
- % Limite Projetado: ${percentualLimiteProjetado}%
- % Limite Acumulado: ${percentualLimiteAcumulado}%
- Restante no Limite: R$ ${restanteLimite}
- 80% do Limite: R$ ${limite80}

Responda apenas o JSON, sem texto adicional.
`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error('Resposta vazia');

    try {
      return JSON.parse(content);
    } catch {
      return {
        summary: content,
        distributionAdvice: [],
        meiLimitAdvice: [],
        optimizationSuggestions: []
      };
    }
  } catch (error: any) {
    console.error('Erro na chamada OpenRouter:', error);
    return {
      summary: `Erro ao consultar IA: ${error.message}`,
      distributionAdvice: [],
      meiLimitAdvice: [],
      optimizationSuggestions: []
    };
  }
}