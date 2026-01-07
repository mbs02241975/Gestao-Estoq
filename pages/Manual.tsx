
import React from 'react';
import { BookOpen, CheckCircle2, AlertTriangle, ArrowRightCircle, Tag, Ruler } from 'lucide-react';

const Manual: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-10 rounded-[2.5rem] shadow-xl flex items-center gap-8">
        <div className="p-5 bg-white/20 rounded-3xl backdrop-blur-md"><BookOpen size={48} /></div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Guia do Operador</h1>
          <p className="text-blue-100 font-medium opacity-90">Siga estas instruções para manter a integridade do estoque e dos custos.</p>
        </div>
      </div>

      <div className="grid gap-8">
        <ManualSection title="1. Cadastro e Variantes" icon={Tag} color="emerald">
          <ul className="space-y-3 text-gray-600 font-medium">
            <li className="flex gap-2"><span>•</span> <strong>Especificação:</strong> Utilize este campo para tamanhos (ex: 39), voltagem (ex: 220V) ou cores. Isso evita cadastrar o mesmo item várias vezes.</li>
            <li className="flex gap-2"><span>•</span> <strong>Unidades:</strong> Escolha a unidade correta (Par, Rolo, Metro) para que o requisitante saiba exatamente o que está recebendo.</li>
            <li className="flex gap-2"><span>•</span> <strong>Estoque Mínimo:</strong> O Dashboard avisará em vermelho sempre que o saldo for menor ou igual a este valor.</li>
          </ul>
        </ManualSection>

        <ManualSection title="2. Saídas e Assinatura Digital" icon={Ruler} color="red">
          <ul className="space-y-3 text-gray-600 font-medium">
            <li className="flex gap-2"><span>•</span> <strong>Destino/Projeto:</strong> Informe sempre o nome da obra ou trabalho (ex: Letreiro Farmácia Centro). Isso permite gerar relatórios de custo por projeto.</li>
            <li className="flex gap-2"><span>•</span> <strong>Assinatura:</strong> O requisitante deve assinar na tela. O sistema salva a assinatura no documento final, que pode ser impresso ou guardado digitalmente.</li>
            <li className="flex gap-2"><span>•</span> <strong>Termo:</strong> Ao assinar, o funcionário declara ciência da responsabilidade sobre o material.</li>
          </ul>
        </ManualSection>

        <ManualSection title="3. Gestão Financeira" icon={ArrowRightCircle} color="green">
          <ul className="space-y-3 text-gray-600 font-medium">
            <li className="flex gap-2"><span>•</span> <strong>Preço Médio:</strong> O sistema calcula automaticamente o custo médio do seu estoque conforme novas entradas são feitas com preços diferentes.</li>
            <li className="flex gap-2"><span>•</span> <strong>Nota Fiscal:</strong> Nas entradas, o número da NF é crucial para auditoria posterior.</li>
          </ul>
        </ManualSection>

        <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 flex gap-6 items-start">
          <div className="p-3 bg-amber-500 text-white rounded-2xl"><AlertTriangle size={24} /></div>
          <div className="space-y-2">
            <h4 className="text-lg font-black text-amber-900 uppercase tracking-tighter">Aviso de Segurança</h4>
            <p className="text-sm text-amber-800 leading-relaxed font-medium">
              Nunca exclua produtos que já tiveram saídas registradas. Se um produto não será mais usado, apenas zere o estoque. A exclusão remove o histórico financeiro dos relatórios de projetos passados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManualSection = ({ title, children, icon: Icon, color }: any) => {
  const colors: any = {
    emerald: "border-emerald-100 hover:border-emerald-200",
    red: "border-red-100 hover:border-red-200",
    green: "border-green-100 hover:border-green-200",
  };

  const iconColors: any = {
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div className={`bg-white p-8 rounded-[2rem] border-2 shadow-sm transition-all ${colors[color]}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-2xl ${iconColors[color]}`}>
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{title}</h3>
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
};

export default Manual;
