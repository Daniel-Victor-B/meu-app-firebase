
"use client"

import { useState, useEffect } from "react";
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
        label: "Portal NFS-e Nacional",
        url: "nfse.gov.br",
        desc: "Acesse com sua conta gov.br (nível prata ou ouro — o mesmo que você usa para gerir seu MEI)"
      },
      {
        tipo: "alerta",
        texto: "Antes de emitir a primeira nota, você precisa fazer duas configurações obrigatórias: informar e-mail/telefone e configurar seus Serviços Favoritos. O sistema bloqueia a emissão simplificada se isso não estiver feito."
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
        texto: "Faça isso uma única vez logo após abrir o MEI para destravar a agilidade do sistema."
      },
      {
        tipo: "checklist",
        itens: [
          { label: "Configurações → informar e-mail e telefone", sub: "Menu superior (engrenagem)" },
          { label: "Marcar 'Simples Nacional' no cálculo de tributos", sub: "Essencial para o MEI" },
          { label: "Criar Serviço Favorito", sub: "Menu 'Serviços Favoritos' → Novo serviço" },
        ]
      },
      {
        tipo: "detalhe",
        titulo: "Como criar o Serviço Favorito (Padrão Elite)",
        itens: [
          "Apelido: ex. 'Curso Online', 'Consultoria Digital' ou 'Mentoria' (máx. 50 caracteres)",
          "Código de Tributação Nacional: escolha o código que corresponde ao seu CNAE principal",
          "Descrição: descreva o serviço de forma clara (ex. 'Prestação de serviço de mentoria empresarial online')",
        ]
      },
      {
        tipo: "dica",
        texto: "Crie um Serviço Favorito para cada produto ou serviço recorrente. Na hora de emitir, você só seleciona da lista — o que reduz o tempo de emissão para segundos."
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
        desc: "Toda venda aprovada em sua plataforma de checkout — independente de quando você saca para o banco — já é faturamento MEI. A Receita Federal recebe relatórios automáticos das plataformas, então seu controle deve ser pelas vendas confirmadas."
      },
      {
        tipo: "intro",
        texto: "A obrigatoriedade da NFS-e depende de quem é o seu cliente."
      },
      {
        tipo: "tabela",
        linhas: [
          { quem: "PJ (Empresa compradora)", obrig: "OBRIGATÓRIA", desc: "Toda venda para CNPJ exige NFS-e por lei. Sem isso, a empresa não consegue comprovar a despesa.", cor: "#ef4444" },
          { quem: "PF (Pessoa física)", obrig: "OPCIONAL", desc: "Legalmente opcional para o MEI — mas a venda ainda conta 100% como faturamento e deve ser planilhada.", cor: "#f59e0b" },
        ]
      },
      {
        tipo: "alerta",
        texto: "Configure seu checkout para capturar CPF/CNPJ. Se o cliente for empresa (CNPJ), a emissão é seu dever imediato. Se for CPF, o registro na planilha garante sua margem de segurança."
      },
      {
        tipo: "dica",
        texto: "Use o painel de vendas da sua plataforma como fonte única de verdade do seu faturamento bruto. É esse número que vai na sua Declaração Anual (DASN-SIMEI)."
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
        texto: "Como MEI, você utiliza a Emissão Simplificada. O formulário é minimalista, contendo apenas as informações críticas do negócio."
      },
      {
        tipo: "formulario",
        campos: [
          { num: "1", campo: "CPF/CNPJ do Cliente", desc: "O sistema busca o nome oficial automaticamente", obrig: true },
          { num: "2", campo: "Serviço Prestado", desc: "Selecione o seu 'Serviço Favorito' pré-cadastrado", obrig: true },
          { num: "3", campo: "Valor do Serviço", desc: "Valor bruto total da venda (sem descontar taxas)", obrig: true },
          { num: "4", campo: "Retenção de ISS", desc: "Para a maioria dos serviços MEI, marque 'Não'", obrig: true },
        ]
      },
      {
        tipo: "dica",
        texto: "Após emitir, o sistema gera o DANFSe (PDF) e o XML. Baixe e armazene ambos de forma organizada por mês e ano. Eles são a prova da sua regularidade."
      }
    ]
  },
  {
    id: "checkouts",
    titulo: "5. Fluxo com Plataformas",
    cor: "#8b5cf6",
    icon: <ArrowRight className="w-5 h-5" />,
    conteudo: [
      {
        tipo: "intro",
        texto: "Plataformas de infoprodutos geralmente não emitem a nota nacional automaticamente. O fluxo de elite é manual, porém extremamente eficiente."
      },
      {
        tipo: "fluxo",
        passos: [
          { icone: "💳", label: "Venda aprovada na plataforma", desc: "O faturamento ocorre no momento da aprovação do pagamento" },
          { icone: "📊", label: "Registro no MEI Flow", desc: "Atualize sua planilha mensal com o valor bruto da venda" },
          { icone: "📄", label: "Acesso ao Emissor Nacional", desc: "Se o comprador for PJ: use a Emissão Simplificada" },
          { icone: "📝", label: "Preenchimento Instantâneo", desc: "Use os dados do cliente e o seu serviço favorito já configurado" },
          { icone: "✅", label: "Arquivo e Envio", desc: "Guarde o PDF e envie para o cliente PJ por e-mail ou WhatsApp" },
          { icone: "🏦", label: "Saque da Plataforma", desc: "O saque é apenas transferência de patrimônio, não gera nova nota fiscal" },
        ]
      },
      {
        tipo: "alerta",
        texto: "Mantenha a competência da nota (data do serviço) no mesmo mês da venda aprovada para evitar desencontros fiscais."
      }
    ]
  },
  {
    id: "correcoes",
    titulo: "6. Erros e Cancelamentos",
    cor: "#ef4444",
    icon: <AlertTriangle className="w-5 h-5" />,
    conteudo: [
      {
        tipo: "intro",
        texto: "Errar faz parte do processo. O sistema nacional permite correções, mas exige atenção aos prazos regulamentados por cada município."
      },
      {
        tipo: "checklist",
        itens: [
          { label: "Substituição de NFS-e", sub: "Gera uma nota nova corrigida e anula a anterior automaticamente." },
          { label: "Cancelamento Direto", sub: "Deve ser feito quando a venda não se concretizou (estorno)." },
          { label: "Prazo de Segurança", sub: "Verifique o prazo de cancelamento do seu município (geralmente de 5 a 30 dias)." },
        ]
      },
      {
        tipo: "dica",
        texto: "Mantenha uma pasta na nuvem organizada. A disciplina fiscal hoje é o que permite o seu crescimento como Microempresa (ME) amanhã."
      }
    ]
  }
];

export function NfseGuide() {
  const [step, setStep] = useState(0);
  const current = STEPS_CONFIG[step];

  // Motor de Scroll Sincronizado: Garante que ao mudar de passo, o usuário volte ao topo do guia
  useEffect(() => {
    // Calculamos a posição do topo da página com um pequeno offset para o menu fixo
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  }, [step]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="text-sm text-muted-foreground font-medium text-center">
        Guia definitivo para emissão de Nota Fiscal de Serviço (NFS-e) no Portal Nacional, blindando sua operação como infoprodutor ou prestador de serviços.
      </div>

      {/* Header do Passo */}
      <div className="flex items-center gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/50 shadow-sm">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{ background: `${current.cor}20`, color: current.cor, border: `1px solid ${current.cor}40` }}
        >
          {current.icon}
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60" style={{ color: current.cor }}>
            Passo {step + 1} de {STEPS_CONFIG.length}
          </div>
          <h3 className="text-xl font-headline font-bold tracking-tight">{current.titulo}</h3>
        </div>
      </div>

      {/* Conteúdo do Bloco */}
      <div className="space-y-5">
        {current.conteudo.map((bloco: any, bi: number) => {
          if (bloco.tipo === "regra") return (
            <div key={bi} className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-500 font-bold text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5" />
                {bloco.titulo}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{bloco.desc}</p>
            </div>
          );

          if (bloco.tipo === "intro") return (
            <div key={bi} className="flex gap-4 p-5 bg-secondary/20 rounded-2xl border-l-4 shadow-inner" style={{ borderColor: current.cor }}>
              <Info className="w-6 h-6 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">{bloco.texto}</p>
            </div>
          );

          if (bloco.tipo === "link") return (
            <Card key={bi} className="border-dashed hover:bg-secondary/10 transition-colors" style={{ borderColor: `${current.cor}40` }}>
              <CardContent className="p-5 flex gap-5 items-center">
                <div className="p-3 rounded-xl shadow-md" style={{ background: `${current.cor}15`, color: current.cor }}>
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black uppercase tracking-widest" style={{ color: current.cor }}>{bloco.url}</div>
                  <div className="text-xs text-muted-foreground font-medium">{bloco.desc}</div>
                </div>
              </CardContent>
            </Card>
          );

          if (bloco.tipo === "alerta") return (
            <div key={bi} className="flex gap-4 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl shadow-sm">
              <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700/80 dark:text-amber-500/80 leading-relaxed font-bold">{bloco.texto}</p>
            </div>
          );

          if (bloco.tipo === "dica") return (
            <div key={bi} className="flex gap-4 p-5 bg-primary/5 border border-primary/20 rounded-2xl">
              <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary/80 leading-relaxed font-medium">{bloco.texto}</p>
            </div>
          );

          if (bloco.tipo === "checklist") return (
            <div key={bi} className="space-y-4 bg-secondary/20 rounded-2xl p-5 border shadow-inner">
              {bloco.itens.map((item: any, ii: number) => (
                <div key={ii} className="flex gap-4 items-start group">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-sm mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{item.label}</div>
                    <div className="text-[11px] text-muted-foreground font-medium">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          );

          if (bloco.tipo === "detalhe") return (
            <div key={bi} className="p-5 bg-secondary/10 rounded-2xl border border-border/50 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{ color: current.cor }}>{bloco.titulo}</div>
              <ul className="space-y-3">
                {bloco.itens.map((item: string, ii: number) => (
                  <li key={ii} className="flex gap-3 text-sm text-muted-foreground font-medium">
                    <span className="text-primary mt-1 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );

          if (bloco.tipo === "tabela") return (
            <div key={bi} className="space-y-4">
              {bloco.linhas.map((linha: any, li: number) => (
                <div key={li} className="p-5 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-md transition-all hover:scale-[1.01]" style={{ borderColor: `${linha.cor}30` }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black uppercase tracking-tight">{linha.quem}</span>
                    <span className="text-[9px] font-black px-3 py-1 rounded-full shadow-sm" style={{ background: `${linha.cor}20`, color: linha.cor }}>
                      {linha.obrig}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">{linha.desc}</p>
                </div>
              ))}
            </div>
          );

          if (bloco.tipo === "formulario") return (
            <div key={bi} className="space-y-3 bg-secondary/20 rounded-2xl p-5 border border-dashed border-border/80">
              <div className="text-[10px] font-black uppercase tracking-widest mb-5 opacity-60 text-center">Protocolo de Emissão Simplificada</div>
              {bloco.campos.map((c: any, ci: number) => (
                <div key={ci} className="flex gap-4 py-3 border-b border-border/50 last:border-0 group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs flex items-center justify-center font-black shrink-0 shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    {c.num}
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {c.campo} {c.obrig && <span className="text-destructive">*</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium mt-0.5">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          );

          if (bloco.tipo === "fluxo") return (
            <div key={bi} className="space-y-6 py-2">
              {bloco.passos.map((p: any, pi: number) => (
                <div key={pi} className="flex gap-5 relative group">
                  <div className="flex flex-col items-center shrink-0 z-10">
                    <div className="w-12 h-12 rounded-2xl bg-card border-2 border-border shadow-xl flex items-center justify-center text-xl group-hover:border-primary transition-colors">
                      {p.icone}
                    </div>
                    {pi < bloco.passos.length - 1 && (
                      <div className="w-0.5 h-10 bg-gradient-to-b from-border to-transparent mt-2 rounded-full" />
                    )}
                  </div>
                  <div className="pt-2">
                    <div className="text-sm font-black text-foreground uppercase tracking-tight">{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          );

          return null;
        })}
      </div>

      {/* Navegação entre Passos */}
      <div className="flex items-center justify-between pt-10 border-t border-border/50">
        <Button 
          variant="outline" 
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-xl gap-2 font-bold h-11 px-6 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {STEPS_CONFIG.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all cursor-pointer shadow-sm ${i === step ? 'w-8' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
              style={{ background: i === step ? current.cor : undefined }}
            />
          ))}
        </div>

        <Button 
          onClick={() => setStep(s => Math.min(STEPS_CONFIG.length - 1, s + 1))}
          disabled={step === STEPS_CONFIG.length - 1}
          className="rounded-xl gap-2 font-bold h-11 px-6 shadow-lg shadow-primary/20"
          style={{ background: step < STEPS_CONFIG.length - 1 ? current.cor : undefined }}
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
