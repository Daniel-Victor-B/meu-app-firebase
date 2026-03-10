"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Landmark, CreditCard, TrendingUp, ArrowRight } from "lucide-react";

const CONTAS = [
  {
    id: "pj-op",
    label: "PJ Operacional",
    tipo: "EMPRESA",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: <Settings className="w-5 h-5" />,
    desc: "Recebe tudo que entra. Paga custos fixos, DAS e fornecedores.",
    sugestao: "Nubank PJ / PagBank",
  },
  {
    id: "pj-res",
    label: "PJ Reserva",
    tipo: "EMPRESA",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    icon: <Landmark className="w-5 h-5" />,
    desc: "Colchão financeiro da empresa. Ideal ter 3-6 meses de custos fixos.",
    sugestao: "CDB de liquidez diária",
  },
  {
    id: "pf-sal",
    label: "PF Pró-labore",
    tipo: "PESSOAL",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    icon: <CreditCard className="w-5 h-5" />,
    desc: "Seu 'salário' mensal. Valor fixo transferido da PJ no dia 5.",
    sugestao: "Conta corrente PF",
  },
  {
    id: "pf-inv",
    label: "PF Investimentos",
    tipo: "PESSOAL",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    icon: <TrendingUp className="w-5 h-5" />,
    desc: "Lucros distribuídos trimestralmente. Foco em patrimônio de longo prazo.",
    sugestao: "Corretora (XP, BTG, Rico)",
  },
];

const FLUXO = [
  { de: "Cliente paga", para: "PJ Operacional", color: "text-blue-500" },
  { de: "PJ Operacional", para: "Custos + DAS + Salário", color: "text-orange-500" },
  { de: "Sobra mensal", para: "PJ Reserva (% fixo)", color: "text-purple-500" },
  { de: "Lucro trimestral", para: "PF Investimentos", color: "text-primary" },
];

export function AccountGuide() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-sm text-muted-foreground">
        A clareza financeira do MEI começa na separação total entre pessoa física e jurídica. 
        Use este modelo de 4 contas para nunca mais misturar dinheiro.
      </div>

      <div className="grid gap-4">
        {CONTAS.map((c) => (
          <Card key={c.id} className={`${c.borderColor} overflow-hidden`}>
            <CardContent className="p-5 flex gap-4 items-start">
              <div className={`${c.bgColor} ${c.color} p-3 rounded-xl flex-shrink-0`}>
                {c.icon}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-headline font-bold text-lg">{c.label}</h4>
                  <Badge variant="outline" className={`${c.color} ${c.bgColor} border-transparent text-[10px]`}>
                    {c.tipo}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sugestão:</span>
                  <span className={`text-[11px] font-bold ${c.color}`}>{c.sugestao}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-secondary/30 border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">Fluxo Inteligente de Dinheiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FLUXO.map((f, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
                <span className="text-xs text-muted-foreground min-w-[100px]">{f.de}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                <span className={`text-xs font-bold ${f.color}`}>{f.para}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
