
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Landmark, CreditCard, TrendingUp, ArrowRight, HelpCircle, Info, ShieldCheck, Wallet } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

const CONTAS = [
  {
    id: "pj-op",
    label: "PJ Operacional",
    tipo: "EMPRESA (CNPJ)",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    icon: <Settings className="w-5 h-5" />,
    desc: "A porta de entrada. Recebe faturamento bruto e paga as contas.",
    sugestao: "Nubank PJ / Inter / PagBank",
    detalhes: [
      "Faturamento Bruto: Todo PIX de cliente deve cair aqui primeiro.",
      "Imposto DAS: Pague sempre por esta conta para facilitar o controle fiscal.",
      "Custos Fixos: Ferramentas, internet e materiais saem daqui.",
      "Extrato Mensal: É a base para sua Declaração Anual de MEI."
    ]
  },
  {
    id: "pj-res",
    label: "PJ Reserva",
    tipo: "EMPRESA (CNPJ)",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    icon: <ShieldCheck className="w-5 h-5" />,
    desc: "O pulmão financeiro. Mantém o negócio vivo em meses ruins.",
    sugestao: "CDB de liquidez diária (100% CDI)",
    detalhes: [
      "Patrimônio do Negócio: Dinheiro que pertence ao CNPJ, não à você.",
      "Segurança: Ideal acumular 6 meses de custos operacionais aqui.",
      "Separação: Não use para gastos do dia a dia. É um fluxo de reserva.",
      "Crescimento: No futuro, use para investir em novos equipamentos ou escala."
    ]
  },
  {
    id: "pf-sal",
    label: "PF Pró-labore",
    tipo: "PESSOAL (CPF)",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: <CreditCard className="w-5 h-5" />,
    desc: "Seu salário fixo mensal. Dinheiro para sua vida pessoal.",
    sugestao: "Sua conta PF principal",
    detalhes: [
      "Disciplina: Transfira sempre o mesmo valor no mesmo dia (ex: dia 05).",
      "Comprovação de Renda: O extrato de recebimento serve como seu holerite.",
      "Paz Mental: Gastos pessoais (aluguel, lazer) saem exclusivamente daqui.",
      "Regra de Ouro: Nunca pague despesas de mercado direto na conta PJ."
    ]
  },
  {
    id: "pf-inv",
    label: "PF Investimentos",
    tipo: "PESSOAL (CPF)",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    icon: <TrendingUp className="w-5 h-5" />,
    desc: "Distribuição de Lucro Real. Foco em patrimônio longo prazo.",
    sugestao: "Corretora (XP, BTG, NuInvest, etc.)",
    detalhes: [
      "Lucro não é Salário: É o prêmio trimestral por sua boa gestão.",
      "Distribuição Trimestral: Acumule na PJ e decida o que fazer a cada 90 dias.",
      "Isenção: Lucros de MEI são isentos de IR sob certas regras.",
      "Liberdade: Use para investir, realizar sonhos ou projetos estratégicos."
    ]
  },
];

const FLUXO = [
  { de: "Cliente paga", para: "PJ Operacional", color: "text-indigo-500" },
  { de: "PJ Operacional", para: "Custos (Laranja)", color: "text-orange-500" },
  { de: "PJ Operacional", para: "DAS (Vermelho)", color: "text-red-500" },
  { de: "PJ Operacional", para: "Pró-labore (Azul)", color: "text-blue-500" },
  { de: "Sobra mensal", para: "PJ Reserva (Roxo)", color: "text-purple-500" },
  { de: "Lucro Real", para: "PF Investimentos (Verde)", color: "text-primary" },
];

export function AccountGuide() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="space-y-4">
        <header className="space-y-1">
          <h3 className="text-lg font-headline font-bold">Arquitetura de Contas</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A saúde financeira do MEI exige a separação total entre CPF e CNPJ. 
            Siga este modelo para blindar seu patrimônio.
          </p>
        </header>
        
        <div className="space-y-3">
          <Separator className="bg-border/50" />
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground/80 tracking-wide uppercase px-1">
            <Info className="w-3.5 h-3.5" />
            Clique em cada conta para ver as dicas práticas
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {CONTAS.map((c) => (
          <AccordionItem 
            key={c.id} 
            value={c.id} 
            className={`border rounded-xl px-1 bg-card/40 transition-all hover:bg-card/60 ${c.borderColor}`}
          >
            <AccordionTrigger className="hover:no-underline py-5 px-4 group">
              <div className="flex gap-4 items-start text-left">
                <div className={`${c.bgColor} ${c.color} p-3 rounded-xl flex-shrink-0 transition-transform group-data-[state=open]:scale-110 shadow-sm`}>
                  {c.icon}
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-headline font-bold text-lg leading-none">{c.label}</h4>
                    <Badge variant="outline" className={`${c.color} ${c.bgColor} border-transparent text-[9px] font-black px-2 py-0`}>
                      {c.tipo}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-1 group-data-[state=open]:hidden">
                    {c.desc}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-6 pt-2">
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-secondary/20 border border-border/40">
                  <p className="text-sm text-foreground font-semibold mb-3 leading-relaxed">{c.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Onde abrir:</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${c.bgColor} ${c.color}`}>{c.sugestao}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <Wallet className="w-3 h-3" />
                    Guia Prático de Operação
                  </div>
                  <ul className="grid gap-3">
                    {c.detalhes.map((d, i) => (
                      <li key={i} className="flex gap-3 text-xs text-muted-foreground leading-relaxed items-start">
                        <div className={`w-1.5 h-1.5 rounded-full ${c.color} mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Card className="bg-secondary/10 border-dashed border-2 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-[0.15em] text-foreground/80">
              Fluxo Inteligente de Dinheiro
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/50" />
            {FLUXO.map((f, i) => (
              <div key={i} className="flex items-center gap-4 group relative">
                <div className="w-3.5 h-3.5 rounded-full bg-background border-2 border-border group-hover:border-primary transition-colors z-10 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary" />
                </div>
                <div className="flex items-center gap-3 flex-1 py-1">
                  <span className="text-xs text-muted-foreground font-medium min-w-[100px]">{f.de}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
                  <span className={`text-xs font-black tracking-tight ${f.color}`}>{f.para}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
