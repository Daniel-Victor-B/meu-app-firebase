"use client"

import { useState } from "react";
import { FileText, Globe, AlertTriangle, Lightbulb, CheckCircle2, ListChecks, Table as TableIcon, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STEPS_CONFIG = [
  {
    id: "acesso",
    titulo: "1. Acesso ao Emissor",
    cor: "#6366f1",
    icon: <Globe className="w-5 h-5" />,
    conteudo: [
      {
        tipo: "intro",
        texto: "O Emissor Público Nacional da NFS-e é gratuito e oficial. Acesse pelo portal gov.br — nenhum software precisa ser instalado."
      },
      {
        tipo: "link",
        label: "Portal NFS-e",
        url: "nfse.gov.br",
        desc: "Acesse com sua conta gov.br (nível prata ou ouro — o mesmo que você usa para abrir o MEI)"
      },
      {
        tipo: "alerta",
        texto: "Antes de emitir a primeira nota, você precisa fazer duas configurações: Valor aproximado dos tributos e Serviços Favoritos. O sistema bloqueia a emissão simplificada se isso não estiver feito."
      },
    ]
  },
  {
    id: "configurar",
    titulo: "2. Configuração Inicial (1x só)",
    cor: "#f59e0b",
    icon: <ListChecks className="w-5 h-5" />,
    conteudo: [
      {
        tipo: "intro",
        texto: "Faça isso uma única vez logo após abrir o MEI. Leva menos de 5 minutos."
      },
      {
        tipo: "checklist",
        itens: [
          { label: "Configurações → informar e-mail e telefone", sub: "Menu superior do emissor" },
          { label: "Marcar 'Simples Nacional' no cálculo de tributos", sub: "Aparece logo abaixo do e-mail" },
          { label: "Criar Serviço Favorito", sub: "Menu 'Serviços Favoritos' → Novo serviço" },
        ]
      },
      {
        tipo: "detalhe",
        titulo: "Como criar o Serviço Favorito (para WiinPay)",
        itens: [
          "Apelido: ex. 'Produto Digital', 'Infoproduto', 'Curso Online' (máx. 50 caracteres)",
          "Código de Tributação Nacional: escolha o código que corresponde ao seu serviço digital",
          "Descrição: descreva o que você vende (ex. 'Venda de curso online gravado')",
        ]
      },
      {
        tipo: "dica",
        texto: "Crie um Serviço Favorito para cada tipo de produto que você vende no WiinPay. Na hora de emitir, você só seleciona da lista — não precisa preencher tudo de novo."
      }
    ]
  },
  {
    id: "quando",
    titulo: "3. Quando Emitir NF?",
    cor: "#10b981",
    icon: <TableIcon className="w-5 h-5" />,
    conteudo: [
      {
        tipo: "regra",
        titulo: "Faturamento = Venda aprovada. Não o saque.",
        desc: "Toda venda aprovada no WiinPay — mesmo R$ 10, mesmo sem sacar — já é faturamento MEI. O saque é só você movendo dinheiro que já era seu. A Receita Federal recebe relatório automático das plataformas (DIMP), então o controle tem que ser pelas vendas, não pelo extrato bancário."
      },
      {
        tipo: "intro",
        texto: "Definido isso: a obrigatoriedade da NFS-e depende de quem comprou."
      },
      {
        tipo: "tabela",
        linhas: [
          { quem: "PJ (empresa comprou)", obrig: "OBRIGATÓRIA", desc: "Toda venda para CNPJ exige NFS-e. Sem isso, a empresa compradora não consegue dar baixa fiscal.", cor: "#ef4444" },
          { quem: "PF (pessoa física)", obrig: "OPCIONAL", desc: "Não é legalmente obrigatória — mas toda venda PF ainda conta como faturamento MEI e deve ser registrada.", cor: "#f59e0b" },
        ]
      },
      {
        tipo: "alerta",
        texto: "No WiinPay, configure o checkout para capturar CPF/CNPJ do comprador. Se vier CNPJ → emita NFS-e. Se vier CPF → registre a venda na planilha mesmo assim."
      },
      {
        tipo: "dica",
        texto: "Use o painel de vendas do WiinPay como fonte de verdade do seu faturamento — não o extrato de saques. É de lá que sai o número que vai na DASN-SIMEI anual."
      }
    ]
  },
  {
    id: "emitir",
    titulo: "4. Emitindo a Nota (MEI Simplificado)",
    cor: "#3b82f6",
    icon: <FileText className="w-5 h-5" />,
    conteudo: [
      {
        tipo: "intro",
        texto: "Como MEI no Simples Nacional, você usa a Emissão Simplificada — o formulário tem apenas 4 campos. É o fluxo mais rápido do sistema."
      },
      {
        tipo: "formulario",
        campos: [
          { num: "1", campo: "CPF/CNPJ do Cliente", desc: "O sistema busca o nome automaticamente", obrig: true },
          { num: "2", campo: "Serviço Prestado", desc: "Selecione da sua lista de Serviços Favoritos", obrig: true },
          { num: "3", campo: "Valor do Serviço", desc: "Valor total da venda em reais", obrig: true },
          { num: "4", campo: "Retenção na Fonte (ISS)", desc: "Para vendas a PJ: verifique se o comprador retém. Para PF: não.", obrig: true },
        ]
      },
      {
        tipo: "dica",
        texto: "Após emitir, o sistema gera a NFS-e e mostra a chave de acesso. Baixe o DANFSe (PDF) e o XML. Guarde os dois por 5 anos."
      }
    ]
  },
  {
    id: "wiinpay",
    titulo: "5. Integração com WiinPay",
    cor: "#8b5cf6",
    icon: <ArrowRight className="w-5 h-5" />,
    conteudo: [
      {
        tipo: "intro",
        texto: "O WiinPay não emite NFS-e automaticamente pelo sistema nacional. O fluxo correto é manual — mas é simples quando você tem tudo configurado."
      },
      {
        tipo: "fluxo",
        passos: [
          { icone: "💳", label: "Venda aprovada no WiinPay", desc: "⚡ Faturamento registrado aqui — independente de sacar ou não" },
          { icone: "📊", label: "Registra na planilha do mês", desc: "Usa o painel WiinPay (vendas, não saques) para atualizar o controle MEI" },
          { icone: "📄", label: "Acessa o nfse.gov.br", desc: "Se o comprador for PJ (CNPJ): abre o Emissor Nacional → Emissão Simplificada" },
          { icone: "📝", label: "Preenche os 4 campos", desc: "CPF/CNPJ do cliente (painel WiinPay), serviço favorito, valor da venda" },
          { icone: "✅", label: "NFS-e gerada → envia ao cliente PJ", desc: "Baixa DANFSe (PDF) + XML. Guarda por 5 anos. Para PF: não precisa enviar." },
          { icone: "🏦", label: "Saque: quando quiser", desc: "Não altera faturamento. O dinheiro já era seu desde a venda aprovada." },
        ]
      },
      {
        tipo: "alerta",
        texto: "Emita a NF no mesmo mês da venda — ou na competência em que o serviço foi prestado. Isso é o campo 'Data de Competência' no sistema."
      }
    ]
  },
  {
    id: "correcoes",
    titulo: "6. Erros, Cancelamentos e Substituições",
    cor: "#ef4444",
    icon: <AlertTriangle className="w-5 h-5" />,
    conteudo: [
      {
        tipo: "intro",
        texto: "Emitiu errado? O sistema permite cancelar ou substituir a NFS-e — mas há regras de prazo que variam por município."
      },
      {
        tipo: "checklist",
        itens: [
          { label: "Substituição de NFS-e", sub: "Para corrigir informações: gera uma NFS-e nova vinculada à original. A original é cancelada automaticamente." },
          { label: "Cancelamento de NFS-e", sub: "Use se a venda não ocorreu. Informar motivo e justificativa no sistema." },
          { label: "Prazo para cancelar/substituir", sub: "Definido pelo município (BH/SMARH). Em caso de dúvida, contate a prefeitura de BH." },
        ]
      },
      {
        tipo: "dica",
        texto: "Sempre baixe o XML e o DANFSe de cada NFS-e emitida logo após a geração. Guarde em pasta organizada por mês/ano — isso é a sua escrituração fiscal como MEI."
      }
    ]
  }
];

export function NfseGuide() {
  const [step, setStep] = useState(0);
  const current = STEPS_CONFIG[step];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="text-sm text-muted-foreground">
        Guia completo para emissão de Nota Fiscal de Serviço (NFS-e) no Portal Nacional, focado em infoprodutores e WiinPay.
      </div>

      {/* Header do Passo */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${current.cor}20`, color: current.cor, border: `1px solid ${current.cor}40` }}
        >
          {current.icon}
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: current.cor }}>
            Passo {step + 1} de {STEPS_CONFIG.length}
          </div>
          <h3 className="text-lg font-headline font-bold">{current.titulo}</h3>
        </div>
      </div>

      {/* Conteúdo do Bloco */}
      <div className="space-y-4">
        {current.conteudo.map((bloco: any, bi: number) => {
          if (bloco.tipo === "regra") return (
            <div key={bi} className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-emerald-500 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {bloco.titulo}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{bloco.desc}</p>
            </div>
          );

          if (bloco.tipo === "intro") return (
            <div key={bi} className="flex gap-3 p-4 bg-secondary/20 rounded-xl border-l-4" style={{ borderColor: current.cor }}>
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed italic">{bloco.texto}</p>
            </div>
          );

          if (bloco.tipo === "link") return (
            <Card key={bi} className="border-dashed" style={{ borderColor: `${current.cor}40` }}>
              <CardContent className="p-4 flex gap-4 items-center">
                <div className="p-2 rounded-lg" style={{ background: `${current.cor}15`, color: current.cor }}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: current.cor }}>{bloco.url}</div>
                  <div className="text-xs text-muted-foreground">{bloco.desc}</div>
                </div>
              </CardContent>
            </Card>
          );

          if (bloco.tipo === "alerta") return (
            <div key={bi} className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-600/80 leading-relaxed font-medium">{bloco.texto}</p>
            </div>
          );

          if (bloco.tipo === "dica") return (
            <div key={bi} className="flex gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary/80 leading-relaxed">{bloco.texto}</p>
            </div>
          );

          if (bloco.tipo === "checklist") return (
            <div key={bi} className="space-y-3 bg-secondary/20 rounded-xl p-4 border">
              {bloco.itens.map((item: any, ii: number) => (
                <div key={ii} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          );

          if (bloco.tipo === "detalhe") return (
            <div key={bi} className="p-4 bg-secondary/10 rounded-xl border border-border/50">
              <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: current.cor }}>{bloco.titulo}</div>
              <ul className="space-y-2">
                {bloco.itens.map((item: string, ii: number) => (
                  <li key={ii} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );

          if (bloco.tipo === "tabela") return (
            <div key={bi} className="space-y-3">
              {bloco.linhas.map((linha: any, li: number) => (
                <div key={li} className="p-4 rounded-xl border bg-card" style={{ borderColor: `${linha.cor}30` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{linha.quem}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${linha.cor}20`, color: linha.cor }}>
                      {linha.obrig}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{linha.desc}</p>
                </div>
              ))}
            </div>
          );

          if (bloco.tipo === "formulario") return (
            <div key={bi} className="space-y-2 bg-secondary/20 rounded-xl p-4 border border-dashed">
              <div className="text-xs font-bold uppercase mb-4 opacity-60">Formulário Simplificado MEI</div>
              {bloco.campos.map((c: any, ci: number) => (
                <div key={ci} className="flex gap-3 py-2 border-b border-border last:border-0">
                  <div className="w-6 h-6 rounded bg-primary/20 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                    {c.num}
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {c.campo} {c.obrig && <span className="text-destructive">*</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          );

          if (bloco.tipo === "fluxo") return (
            <div key={bi} className="space-y-4">
              {bloco.passos.map((p: any, pi: number) => (
                <div key={pi} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-secondary border flex items-center justify-center text-lg">
                      {p.icone}
                    </div>
                    {pi < bloco.passos.length - 1 && (
                      <div className="w-0.5 h-6 bg-border mt-1 rounded-full" />
                    )}
                  </div>
                  <div className="pt-1">
                    <div className="text-sm font-bold">{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          );

          return null;
        })}
      </div>

      {/* Navegação entre Passos */}
      <div className="flex items-center justify-between pt-6 border-t border-border/50">
        <Button 
          variant="outline" 
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-full gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex gap-1.5">
          {STEPS_CONFIG.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${i === step ? 'w-6' : 'w-1.5 bg-muted-foreground/30'}`}
              style={{ background: i === step ? current.cor : undefined }}
            />
          ))}
        </div>

        <Button 
          onClick={() => setStep(s => Math.min(STEPS_CONFIG.length - 1, s + 1))}
          disabled={step === STEPS_CONFIG.length - 1}
          className="rounded-full gap-2"
          style={{ background: step < STEPS_CONFIG.length - 1 ? current.cor : undefined }}
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
