"use client"

import { useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { calculateDasValue } from "@/lib/dasCalculator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ShieldCheck, 
  ExternalLink, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  CreditCard,
  FileCheck,
  Building,
  Key,
  Globe,
  Youtube,
  GraduationCap,
  Rocket,
  LogOut,
  HeartHandshake,
  Calculator,
  Zap
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export function BureaucraticGuide() {
  const { businessData } = useBusiness();
  const [activeTab, setActiveTab] = useState("nfs-e");

  const dasValue = calculateDasValue(businessData.ramo);

  const sections = [
    {
      id: "abrir",
      label: "Abrir MEI",
      icon: <Rocket className="w-4 h-4" />,
      title: "Formalização (Abrir MEI)",
      description: "Como se tornar MEI de forma gratuita e segura em 2026.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      steps: [
        "Verifique se seu CPF está regular e se você possui conta gov.br Prata ou Ouro.",
        "Acesse o Portal do Empreendedor oficial (gov.br).",
        "Escolha sua atividade principal (CNAE) e atividades secundárias.",
        "Preencha os dados de endereço e contato do negócio.",
        "Confirme as declarações de desimpedimento e opção pelo Simples Nacional.",
        "Emita e guarde seu Certificado de Condição de MEI (CCMEI)."
      ],
      warning: "A formalização é 100% GRATUITA no portal do governo. Desconfie de sites que cobram taxas para abrir o MEI."
    },
    {
      id: "nfs-e",
      label: "Nota Fiscal",
      icon: <FileText className="w-4 h-4" />,
      title: "Emissão de NFS-e Nacional",
      description: "O MEI deve emitir nota fiscal sempre que vender para empresas (CNPJ).",
      officialLink: "https://nfse.gov.br/EmissorNacional",
      videoUrl: "https://www.youtube.com/embed/PjRreV0fP6c",
      steps: [
        "Acesse o Portal NFS-e Nacional com sua conta Gov.br.",
        "Configure seu e-mail e telefone no menu de configurações.",
        "Cadastre seus 'Serviços Favoritos' para facilitar a emissão diária.",
        "Utilize a 'Emissão Simplificada' para faturar rapidamente via web ou app."
      ],
      warning: "Desde 2026, o uso do Emissor Nacional é obrigatório para todos os MEIs prestadores de serviço do país."
    },
    {
      id: "das",
      label: "Guia DAS",
      icon: <CreditCard className="w-4 h-4" />,
      title: "Pagamento Mensal do DAS",
      description: "Sua única obrigação financeira fixa. Garante sua previdência e regularidade.",
      officialLink: "https://www.gov.br/mei/pt-br/servicos/pagamento-do-das",
      videoUrl: "https://www.youtube.com/embed/fAEv38zS93w",
      steps: [
        "Acesse o portal do PGMEI e informe seu CNPJ.",
        "Selecione o ano vigente e os meses em aberto.",
        "Gere o boleto ou use o QR Code PIX para pagamento imediato.",
        "O vencimento ocorre sempre no dia 20 de cada mês."
      ],
      special: {
        label: "Cálculo 2026",
        value: `R$ ${dasValue.toFixed(2).replace('.', ',')}`,
        detail: `Baseado no Salário Mínimo de R$ 1.621,00 para ${businessData.ramo}`
      },
      warning: "O atraso no DAS gera multa de 0,33% ao dia + juros SELIC. Mantenha o pagamento em dia para não perder direitos INSS."
    },
    {
      id: "declaracao",
      label: "DASN-SIMEI",
      icon: <FileCheck className="w-4 h-4" />,
      title: "Declaração Anual (DASN)",
      description: "Obrigatória para todos, mesmo que não tenha faturado nada no ano.",
      officialLink: "https://www.gov.br/mei/pt-br/servicos/declaracao-anual-de-faturamento",
      videoUrl: "https://www.youtube.com/embed/5U2BvJqW3jY",
      steps: [
        "Soma todo o seu faturamento bruto (vendas com e sem nota) do ano anterior.",
        "Acesse o portal DASN-SIMEI oficial entre 01/Jan e 31/Mai.",
        "Informe o valor total e se teve funcionários registrados.",
        "Guarde o recibo — ele é sua prova de renda oficial para bancos."
      ],
      warning: "Atraso na declaração gera multa mínima de R$ 50,00. O prazo final é 31 de maio."
    },
    {
      id: "direitos",
      label: "Direitos INSS",
      icon: <HeartHandshake className="w-4 h-4" />,
      title: "Benefícios Previdenciários",
      description: "O que você garante ao pagar o DAS em dia.",
      officialLink: "https://www.gov.br/mei/pt-br/empreendedor",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      steps: [
        "Aposentadoria por idade (mulheres 62, homens 65).",
        "Auxílio-doença e aposentadoria por invalidez (carência de 12 meses).",
        "Salário-maternidade (carência de 10 meses).",
        "Pensão por morte para seus dependentes."
      ],
      warning: "A formalização pode suspender benefícios assistenciais como Seguro-Desemprego, BPC/LOAS ou Prouni. Verifique sua situação antes de abrir."
    },
    {
      id: "carne-leao",
      label: "Carnê-leão",
      icon: <Calculator className="w-4 h-4" />,
      title: "Imposto de Renda PF",
      description: "Recolhimento mensal para rendimentos recebidos de pessoas físicas.",
      officialLink: "https://www.gov.br/receitafederal",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      steps: [
        "O lucro do MEI tem parcela isenta (8% comércio, 16% transporte, 32% serviços).",
        "O excedente do lucro é tributável na Declaração de IRPF da Pessoa Física.",
        "Rendimentos extras de PF ou exterior devem ser lançados mensalmente no Carnê-leão.",
        "Acesse o e-CAC com sua conta gov.br para preencher o programa online."
      ]
    },
    {
      id: "baixar",
      label: "Baixar MEI",
      icon: <LogOut className="w-4 h-4" />,
      title: "Encerramento (Baixar MEI)",
      description: "Como dar baixa no seu CNPJ MEI de forma correta.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos-para-mei/baixa-do-mei",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      steps: [
        "Acesse a opção 'Baixar MEI' no Portal do Empreendedor.",
        "Informe o motivo do encerramento e confirme a solicitação.",
        "Emita a Certidão de Baixa do CNPJ.",
        "Entregue a DASN-SIMEI de Situação Especial (Extinção) em até 30 dias.",
        "Importante: Dívidas não pagas do CNPJ migram automaticamente para o seu CPF."
      ]
    },
    {
      id: "alvara",
      label: "Alvará",
      icon: <Building className="w-4 h-4" />,
      title: "Alvará de Funcionamento",
      description: "Regras municipais e dispensa de alvará prévio.",
      officialLink: "https://www.gov.br/empresas-e-negocios/pt-br/redesim/abrir-uma-empresa",
      steps: [
        "O MEI é dispensado de alvarás e licenças prévias para iniciar.",
        "Ao abrir, você concorda com o Termo de Ciência e Responsabilidade.",
        "Verifique as normas da prefeitura para vigilância e bombeiros.",
        "Mantenha o CCMEI sempre disponível para fiscalização."
      ]
    },
    {
      id: "certificado",
      label: "Certificado",
      icon: <Key className="w-4 h-4" />,
      title: "Certificado Digital (e-CNPJ)",
      description: "Sua assinatura eletrônica com validade jurídica.",
      officialLink: "https://www.gov.br/receitafederal",
      steps: [
        "Certificado Tipo A1 (arquivo) é o mais comum para MEIs.",
        "Permite assinar contratos e emitir NFe de produto em alguns estados.",
        "Opcional para NFS-e nacional, mas exigido para sistemas de gestão avançados.",
        "Adquira em uma autoridade certificadora credenciada (Serasa, Certisign, etc)."
      ]
    }
  ];

  const currentSection = sections.find(s => s.id === activeTab) || sections[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-bold">Guia MEI de Elite</h2>
            <p className="text-sm text-muted-foreground font-medium">Sua central de inteligência burocrática atualizada para 2026.</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 font-black text-[10px] tracking-widest uppercase">
          Versão 2026.2
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-9 h-auto p-1 bg-secondary/20 border border-border/50 rounded-2xl overflow-x-auto no-scrollbar">
          {sections.map(s => (
            <TabsTrigger key={s.id} value={s.id} className="flex flex-col gap-1 py-3 text-[9px] md:text-xs min-w-[80px]">
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border/50 shadow-xl overflow-hidden bg-card/60 backdrop-blur-sm">
              <CardHeader className="border-b bg-secondary/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-headline font-bold text-foreground">{currentSection.title}</CardTitle>
                    <CardDescription className="text-xs font-medium">{currentSection.description}</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-full text-[10px] font-black uppercase tracking-widest"
                    onClick={() => window.open(currentSection.officialLink, "_blank")}
                  >
                    <Globe className="w-3 h-3" />
                    Portal Oficial
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-8 space-y-8">
                {currentSection.special && (
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 group hover:bg-amber-500/10 transition-all">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">{currentSection.special.label}</div>
                      <div className="text-2xl font-black text-amber-600">{currentSection.special.value}</div>
                      <div className="text-[10px] font-medium text-muted-foreground">{currentSection.special.detail}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Protocolo Passo a Passo</h4>
                  </div>
                  <div className="grid gap-4">
                    {currentSection.steps.map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                          {i + 1}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium group-hover:text-foreground transition-colors">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {currentSection.warning && (
                  <div className="flex gap-4 p-5 bg-destructive/5 border border-destructive/20 rounded-2xl">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-xs text-destructive/80 font-bold leading-relaxed">{currentSection.warning}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <CardTitle className="text-sm font-bold uppercase tracking-widest">Vídeo Tutorial</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 border-t">
                {currentSection.videoUrl ? (
                  <div className="aspect-video w-full">
                    <iframe 
                      src={currentSection.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Tutorial MEI"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-secondary/50 flex flex-col items-center justify-center p-8 text-center gap-3">
                    <Info className="w-8 h-8 text-muted-foreground/30" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vídeo aula indisponível para este tópico</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 border-border/50 bg-transparent hover:bg-secondary/10 transition-all group">
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-bold text-sm">Acessar Portal do Empreendedor</h5>
                  <p className="text-[10px] text-muted-foreground font-medium">Link oficial do governo federal atualizado para 2026.</p>
                </div>
                <Button 
                  className="w-full rounded-xl h-11 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                  onClick={() => window.open("https://www.gov.br/empresas-e-negocios/pt-br/empreendedor", "_blank")}
                >
                  Ir para o site do Governo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      <section className="p-8 rounded-[40px] bg-secondary/20 border-2 border-dashed border-border/50 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Blindagem Fiscal Ativa 2026</span>
        </div>
        <h4 className="text-xl font-black tracking-tight">Precisa de ajuda com a Declaração?</h4>
        <p className="text-xs text-muted-foreground font-medium max-w-lg mx-auto">
          Utilize nossa aba de **AI Advice** para receber orientações personalizadas sobre sua transição para ME ou como otimizar seus impostos com base no faturamento real do seu livro de caixa.
        </p>
      </section>
    </div>
  );
}
