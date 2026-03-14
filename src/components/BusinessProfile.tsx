"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/contexts/BusinessContext";
import { 
  Briefcase, 
  Store, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  Target,
  Zap,
  CheckCircle2,
  TrendingUp,
  Users
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { businessStrategyAdvice, type BusinessStrategyOutput } from "@/ai/flows/business-strategy-advice";

export function BusinessProfile() {
  const { businessData, updateBusinessData } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<BusinessStrategyOutput | null>(null);

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

  const getStrategy = async () => {
    setLoading(true);
    try {
      const result = await businessStrategyAdvice(businessData);
      setStrategy(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <CardHeader className="pt-8 px-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-lg shadow-primary/10"><Briefcase className="w-6 h-6" /></div>
            <div>
              <CardTitle className="text-xl font-headline font-bold">Identidade Estratégica</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold">Perfil do Negócio</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nome do Negócio</Label>
                <Input placeholder="Ex: Minha Empresa MEI" value={businessData.nomeNegocio} onChange={(e) => updateBusinessData({ nomeNegocio: e.target.value })} className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ramo de Atividade</Label>
                <Select value={businessData.ramo} onValueChange={(val) => updateBusinessData({ ramo: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>{ramos.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Modelo de Negócio</Label>
                <Select value={businessData.modeloNegocio} onValueChange={(val) => updateBusinessData({ modeloNegocio: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>{modelos.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Meta Principal</Label>
                <Select value={businessData.meta} onValueChange={(val) => updateBusinessData({ meta: val })}>
                  <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>{metas.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Canais de Venda Ativos</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {canaisOpcoes.map((canal) => (
                <div key={canal} onClick={() => toggleCanal(canal)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${businessData.canaisVenda?.includes(canal) ? "bg-primary/10 border-primary/40 text-primary" : "bg-background/40 border-border/50"}`}>
                  <Checkbox checked={businessData.canaisVenda?.includes(canal)} />
                  <span className="text-xs font-bold">{canal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ticket Médio (R$)</Label>
              <Input type="number" value={businessData.ticketMedio} onChange={(e) => updateBusinessData({ ticketMedio: parseFloat(e.target.value) || 0 })} className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Clientes Ativos</Label>
              <Input type="number" value={businessData.numClientes} onChange={(e) => updateBusinessData({ numClientes: parseInt(e.target.value) || 0 })} className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Maior Gargalo</Label>
              <Select value={businessData.desafio} onValueChange={(val) => updateBusinessData({ desafio: val })}>
                <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>{desafios.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultoria Estratégica AI */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner"><Target className="w-6 h-6" /></div>
            <div>
              <h3 className="font-headline font-bold text-xl">Consultoria Estratégica AI</h3>
              <p className="text-xs text-muted-foreground font-medium">Análise de posicionamento e escala</p>
            </div>
          </div>
          <Button onClick={getStrategy} disabled={loading} className="rounded-full gap-2 shadow-xl shadow-primary/20">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Obter Análise Estratégica
          </Button>
        </div>

        {strategy && (
          <div className="grid gap-6 animate-in fade-in duration-500">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <p className="text-xs italic leading-relaxed text-muted-foreground">"{strategy.verdict}"</p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-black uppercase">Estratégia de Canais</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {strategy.channelStrategy.map((s, i) => (
                    <div key={i} className="flex gap-2 text-xs text-muted-foreground"><Zap className="w-3.5 h-3.5 text-primary shrink-0" /> {s}</div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm font-black uppercase">Ações de Crescimento</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {strategy.growthActions.map((a, i) => (
                    <div key={i} className="flex gap-2 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" /> {a}</div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
