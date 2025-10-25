"use client";
import Modal from '@/components/ui/Modal';

export default function MacroHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Guía de variables macroeconómicas">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-white bg-gradient-to-r from-logo-start via-logo-mid to-logo-end">
              <th className="py-2 pl-3 pr-3 font-semibold">Variable</th>
              <th className="py-2 pr-3 font-semibold">Frecuencia</th>
              <th className="py-2 pr-3 font-semibold">Unidad</th>
              <th className="py-2 pr-3 font-semibold">Importancia en la Evaluación de Riesgo de Crédito B2B</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Inflación (IPC)</span></td>
              <td className="py-2 pr-3">Mensual 📅</td>
              <td className="py-2 pr-3">Porcentaje (%)</td>
              <td className="py-2">La inflación descontrolada reduce el poder adquisitivo de los consumidores y aumenta costos operativos, afectando rentabilidad y capacidad de pago.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Inflación acumulada (últimos 12 meses)</span></td>
              <td className="py-2 pr-3">Anual 🗓️</td>
              <td className="py-2 pr-3">Porcentaje (%)</td>
              <td className="py-2">Refleja presión inflacionaria de mediano plazo; útil para contratos reajustables y planeación financiera.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Producto Interno Bruto (PIB)</span></td>
              <td className="py-2 pr-3">Trimestral / Anual 🗓️</td>
              <td className="py-2 pr-3">Monto ($)</td>
              <td className="py-2">Indicador de salud económica general. Crecimiento robusto reduce riesgo de incumplimiento; contracción lo eleva.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Desempleo</span></td>
              <td className="py-2 pr-3">Trimestral 🗓️</td>
              <td className="py-2 pr-3">Porcentaje (%)</td>
              <td className="py-2">Impacta demanda y ventas de clientes B2B; mayor desempleo aumenta riesgo financiero.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Unidad de Fomento (UF)</span></td>
              <td className="py-2 pr-3">Diaria ☀️</td>
              <td className="py-2 pr-3">Monto (UF/$)</td>
              <td className="py-2">Créditos o contratos en UF se reajustan por inflación. Debe existir capacidad de generación para cubrir mayores pagos.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Tasa de Política Monetaria (TPM)</span></td>
              <td className="py-2 pr-3">Mensual 📅</td>
              <td className="py-2 pr-3">Porcentaje (%)</td>
              <td className="py-2">Tasa base del sistema. Al subir, encarece financiamiento y puede tensionar liquidez y solvencia.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Dólar observado (FX)</span></td>
              <td className="py-2 pr-3">Diaria ☀️</td>
              <td className="py-2 pr-3">Monto ($)</td>
              <td className="py-2">Volatilidad cambiaria afecta costos de importaciones/exportaciones y márgenes.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Commodities</span></td>
              <td className="py-2 pr-3">Diaria / Continua ☀️</td>
              <td className="py-2 pr-3">$/unidad</td>
              <td className="py-2">Precios (p.ej., cobre) influyen a nivel sistémico. Caídas fuertes elevan riesgo sectorial y de cadena.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
