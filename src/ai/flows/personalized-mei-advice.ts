'use server';

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
      distributionAdvice: [],
      meiLimitAdvice: [],
      optimizationSuggestions: []
    };
  }

  const model = await getAvailableFreeModel(apiKey);
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
Você é um consultor financeiro de elite, estilo Wall Street, mas para MEIs brasileiros.
Com base nos dados abaixo, gere um parecer tático em JSON com as chaves:
- summary (string)
- distributionAdvice (array de strings)
- meiLimitAdvice (array de strings)
- optimizationSuggestions (array de strings)

REGRAS CRÍTICAS PARA O "summary":
1. NÃO repita os números que eu já te dei (faturamento, sobra, etc). O usuário já está vendo eles na tela.
2. Dê um VEREDITO claro: o negócio é sustentável ou é um "castelo de cartas"?
3. Identifique o GARGALO principal.
4. Use linguagem direta, profissional e impactante. Foque na ÚNICA coisa que ele deve mudar hoje.

Dados para análise:
- Faturamento Mensal: R$ ${input.faturamentoMensal}
- Custos: R$ ${input.custosOperacionais}
- Pró-labore: R$ ${input.prolabore}
- Reserva: ${input.reservaPct}% da sobra
- Meses com faturamento: ${input.mesesFaturamento}
- Limite Anual MEI: R$ ${input.meiLimiteAnual}

Cálculos Prontos:
- Sobra Real: R$ ${sobra}
- Lucro Livre: R$ ${lucro}
- % Limite Projetado: ${percentualLimiteProjetado}%
- Restante no Limite: R$ ${restanteLimite}

Responda apenas o JSON.
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
    return {
      summary: `Erro ao consultar IA: ${error.message}`,
      distributionAdvice: [],
      meiLimitAdvice: [],
      optimizationSuggestions: []
    };
  }
}