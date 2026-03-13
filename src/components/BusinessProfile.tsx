"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useBusiness } from "@/contexts/BusinessContext";
import { 
  Briefcase, 
  Info, 
  Zap, 
  ShieldCheck, 
  Target, 
  Users, 
  TrendingUp, 
  Store, 
  AlertCircle,
  HelpCircle 
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS_BUSINESS = [
  {
    q: "Por que definir meu Ramo de Atividade com precisão?",
    a: "O ramo define sua natureza jurídica e obrigações (ISS para serviços ou ICMS para comércio). No MEI Flow, essa informação permite que a IA compare sua performance com benchmarks reais do seu setor, entregando conselhos muito mais cirúrgicos."
  },
  {
    q: "Qual a importância do Ticket Médio na estratégia do MEI?",
    a: "O Ticket Médio (valor médio por venda) é o acelerador do seu teto de R$ 81k. Se seu ticket é baixo, você precisa de um volume operacional exaustivo. Aumentar o ticket estratégico permite atingir suas metas com menos esforço e maior margem de lucro."
  },
  {
    q: "Como escolher os Canais de Venda ideais?",
    a: "Depende do seu Modelo de Negócio. Se você é B2B, canais diretos e LinkedIn são fundamentais. Se é B2C, redes sociais e marketplaces garantem escala. Diversificar canais protege seu faturamento contra instabilidades em uma única plataforma."
  },
  {
    q: "B2B vs B2C: Qual o impacto na minha gestão financeira?",
    a: "Negócios B2B costumam ter ciclos de venda longos e tickets altos, exigindo mais capital de giro. Negócios B2C focam em volume e giro rápido. A IA utiliza essa distinção para sugerir como você deve alocar sua reserva e seu lucro."
  }
];

export function BusinessProfile() {
  const { businessData, updateBusinessData } = useBusiness();

  const ramos = [
    "Alimentação (restaurante, lanchonete, delivery)",
    "Comércio varejista (loja física)",
    "E-commerce / Negócio digital (loja virtual, infoprodutos)",
    "Serviços presenciais (consultoria, estética, oficina)",
    "Serviços online (freelancer, consultoria online, desenvolvimento)",
    "Indústria / Artesanato",
    "Transporte / Mobilidade",
    "Outros"
  ];

  const modelos = ["B2B", "B2C", "B2B e B2C", "Marketplace"];
  const canaisOpcoes = ["Loja física", "E-commerce", "Redes sociais", "Marketplace", "Delivery", "Outros"];
  const desafios = ["Fluxo de caixa", "Carga tributária", "Concorrência", "Falta de clientes", "Gestão de tempo", "Dificuldade de formalização"];
  const metas = ["Aumentar faturamento", "Reduzir custos", "Melhorar gestão", "Formalizar-se", "Investir em marketing", "Expandir"];

  const toggleCanal = (canal: string) => {
    const current = businessData.canaisVenda || [];
    const next = current.includes(canal) 
      ? current.filter(c => c !== canal)
      : [...current, canal];
    updateBusinessData({ canaisVenda: next });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <CardHeader className="pt-8 px-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-lg shadow-primary/10">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-headline font-bold">Identidade Estratégica</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground/60">Configuração de Perfil do Negócio</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-10 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Nome do Negócio</Label>
                <Input 
                  placeholder="Ex: Minha Empresa MEI"
                  value={businessData.nomeNegocio}
                  onChange={(e) => updateBusinessData({ nomeNegocio: e.target.value })}
                  className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Ramo de Atividade</Label>
                <Select value={businessData.ramo} onValueChange={(val) => updateBusinessData({ ramo: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold">
                    <SelectValue placeholder="Selecione o ramo" />
                  </SelectTrigger>
                  <SelectContent>
                    {ramos.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Modelo de Negócio</Label>
                <Select value={businessData.modeloNegocio} onValueChange={(val) => updateBusinessData({ modeloNegocio: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold">
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelos.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Meta Principal</Label>
                <Select value={businessData.meta} onValueChange={(val) => updateBusinessData({ meta: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold">
                    <SelectValue placeholder="Selecione a meta" />
                  </SelectTrigger>
                  <SelectContent>
                    {metas.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Store className="w-4 h-4 text-primary" />
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Canais de Venda Ativos</Label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {canaisOpcoes.map((canal) => (
                <div 
                  key={canal} 
                  onClick={() => toggleCanal(canal)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    businessData.canaisVenda?.includes(canal) 
                      ? "bg-primary/10 border-primary/40 text-primary shadow-sm" 
                      : "bg-background/40 border-border/50 text-muted-foreground hover:border-primary/20"
                  }`}
                >
                  <Checkbox 
                    checked={businessData.canaisVenda?.includes(canal)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-xs font-bold leading-none">{canal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ticket Médio (R$)</Label>
              </div>
              <Input 
                type="number"
                value={businessData.ticketMedio}
                onChange={(e) => updateBusinessData({ ticketMedio: parseFloat(e.target.value) || 0 })}
                className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-primary" />
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Clientes Ativos</Label>
              </div>
              <Input 
                type="number"
                value={businessData.numClientes}
                onChange={(e) => updateBusinessData({ numClientes: parseInt(e.target.value) || 0 })}
                className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-primary" />
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Maior Gargalo</Label>
              </div>
              <Select value={businessData.desafio} onValueChange={(val) => updateBusinessData({ desafio: val })}>
                <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold">
                  <SelectValue placeholder="Selecione o desafio" />
                </SelectTrigger>
                <SelectContent>
                  {desafios.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-secondary/30 border border-border/50 flex gap-4 items-start">
            <Zap className="w-5 h-5 text-primary shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Poder de Personalização</p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                Quanto mais detalhado for o seu perfil, mais cirúrgica será a análise da IA. O modelo B2B exige estratégias de escala diferentes do B2C.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-xl tracking-tight">FAQ Estratégica</h3>
            <p className="text-xs text-muted-foreground font-medium mt-1">Entenda como seu perfil de negócio impulsiona seu crescimento.</p>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQS_BUSINESS.map((faq, idx) => (
            <AccordionItem key={idx} value={`faq-${idx}`} className="border rounded-2xl px-5 bg-card/40 shadow-sm hover:shadow-md transition-all hover:bg-card">
              <AccordionTrigger className="text-sm font-bold text-left hover:no-underline py-5 leading-relaxed group">
                <span className="group-hover:text-primary transition-colors">{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-6 pt-2 font-medium">
                <div className="flex gap-4">
                  <div className="w-1 h-full bg-primary/20 rounded-full shrink-0" />
                  {faq.a}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="p-8 rounded-[32px] bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-sm tracking-tight">Privacidade e Blindagem</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Seus dados estratégicos são processados em tempo real e não são utilizados para treinamento de modelos públicos.
          </p>
        </div>
      </section>
    </div>
  );
}