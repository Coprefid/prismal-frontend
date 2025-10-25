"use client";
import Modal from '@/components/ui/Modal';

export default function MicroHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Guía de variables micro (estructura interna)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-white bg-gradient-to-r from-logo-start via-logo-mid to-logo-end">
              <th className="py-2 pl-3 pr-3 font-semibold">Categoría</th>
              <th className="py-2 pr-3 font-semibold">Variable</th>
              <th className="py-2 pr-3 font-semibold">Descripción e Importancia para el Riesgo de Crédito</th>
            </tr>
          </thead>
          <tbody className="align-top">
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3 font-medium">Estructurales</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Antigüedad de la Empresa</span></td>
              <td className="py-2">Más trayectoria suele implicar menor riesgo por resiliencia en ciclos económicos.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3">Estructurales</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Número de Trabajadores</span></td>
              <td className="py-2">Indica tamaño y estabilidad operativa. Cambios bruscos pueden anticipar expansión o tensiones internas.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3">Estructurales</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Giro del Negocio</span></td>
              <td className="py-2">Cada industria enfrenta riesgos distintos (p. ej., construcción vs. tecnología). Sensibilidad a shocks externos.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3 font-medium">Financieros Internos</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Ventas</span></td>
              <td className="py-2">Indicador clave de salud comercial. Caídas bruscas son alertas de demanda o competitividad y afectan capacidad de pago.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3">Financieros Internos</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Rentabilidad</span></td>
              <td className="py-2">Margen decreciente sugiere costos en alza o precios insuficientes; compromete solvencia de mediano plazo.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3">Financieros Internos</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Liquidez</span></td>
              <td className="py-2">Capacidad de cubrir obligaciones de corto plazo; baja liquidez eleva riesgo de morosidad.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3">Financieros Internos</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Nivel de Endeudamiento</span></td>
              <td className="py-2">Dependencia a deuda; niveles altos tensionan intereses y capital si caen ingresos.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3">Financieros Internos</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Capital Propio</span></td>
              <td className="py-2">Respaldo patrimonial; mayor capital propio reduce dependencia de deuda y riesgo para acreedores.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3 font-medium">Tributarios</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Cumplimiento Tributario</span></td>
              <td className="py-2">Historia de cumplimiento refleja responsabilidad; deudas tributarias pueden señalar problemas de liquidez.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3">Tributarios</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Carpeta Tributaria Actualizada</span></td>
              <td className="py-2">Desactualización indica desorden administrativo; menor transparencia eleva riesgo.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3 font-medium">Comerciales y Activos</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Morosidad Comercial</span></td>
              <td className="py-2">Señal directa de riesgo: dificultades actuales para honrar compromisos.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <td className="py-2 pr-3">Comerciales y Activos</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Activos Declarados</span></td>
              <td className="py-2">Respaldo patrimonial; la veracidad y suficiencia son claves para capacidad de respuesta.</td>
            </tr>
            <tr className="border-t border-slate-200 dark:border-slate-800">
              <td className="py-2 pr-3">Comerciales y Activos</td>
              <td className="py-2 pr-3 font-medium"><span className="bg-gradient-to-r from-logo-start via-logo-mid to-logo-end bg-clip-text text-transparent">Diversificación de Clientes</span></td>
              <td className="py-2">Dependencia de un solo cliente eleva riesgo de ingresos; la diversificación mitiga shocks idiosincráticos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
