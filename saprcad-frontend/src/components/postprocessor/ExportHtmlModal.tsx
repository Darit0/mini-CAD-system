// src/components/postprocessor/ExportHtmlModal.tsx
import React, { useState } from 'react';

interface ExportHtmlModalProps {
    rods: any[];
    displacements: number[];
    lastSectionCalc?: Record<string, any>;
    selectedBlocks?: {  // Делаем опциональным
        construction: boolean;
        table: boolean;
        epureN: boolean;
        epureSigma: boolean;
        epureU: boolean;
        displacements: boolean;
        sectionCalc: boolean;
    };
    onClose: () => void;
}

// И в самом компоненте используем переданный selectedBlocks или создаем по умолчанию
const ExportHtmlModal: React.FC<ExportHtmlModalProps> = ({
                                                             rods,
                                                             displacements,
                                                             lastSectionCalc,
                                                             selectedBlocks: externalSelectedBlocks,
                                                             onClose,
                                                         }) => {

    const [selected, setSelected] = useState(externalSelectedBlocks || {
        construction: true,
        table: true,
        epureN: true,
        epureSigma: true,
        epureU: true,
        displacements: true,
        sectionCalc: !!lastSectionCalc,
    });

    const [isGenerating, setIsGenerating] = useState(false);

    const toggle = (key: keyof typeof selected) => {
        setSelected(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const generateHtmlReport = () => {
        setIsGenerating(true);

        try {
            //  1. Получаем SVG-строки из DOM
            const getSvgString = (selectorOrId: string): string => {
                let svgElement: SVGElement | null = null;

                if (selectorOrId.startsWith('#')) {
                    svgElement = document.querySelector(selectorOrId);
                } else {
                    // По заголовку h4 → ищем SVG в том же grid-столбце
                    const h4 = Array.from(document.querySelectorAll('h4')).find(el =>
                        el.textContent?.includes(selectorOrId)
                    );
                    const container = h4?.closest('div');
                    if (container) {
                        svgElement = container.querySelector('svg');
                    }
                }

                return svgElement ? new XMLSerializer().serializeToString(svgElement) : '';
            };

            const constructionSvg = selected.construction ? getSvgString('#construction-svg') : '';
            const epureNSvg = selected.epureN ? getSvgString('Продольные силы N(x)') : '';
            const epureSigmaSvg = selected.epureSigma ? getSvgString('Напряжения σ(x)') : '';
            const epureUSvg = selected.epureU ? getSvgString('Перемещения u(x)') : '';

            // === 2. Генерируем HTML ===
            const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>САПР — Отчёт по расчёту НДС</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4a90e2; padding-bottom: 15px; }
    h1 { color: #2c3e50; margin: 10px 0; }
    h2 { color: #3498db; margin: 25px 0 15px; }
    h3 { color: #2980b9; margin: 20px 0 12px; }
    .meta { background: #f8f9fa; padding: 10px; border-radius: 4px; margin: 15px 0; }
    .displacements { display: flex; flex-wrap: wrap; gap: 10px; }
    .disp-card { background: #e3f2fd; padding: 8px 16px; border-radius: 4px; min-width: 120px; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    th { background-color: #4a90e2; color: white; }
    .result-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .result-item { text-align: center; padding: 15px; border-radius: 6px; }
    .safe { background: #e8f5e9; color: #2e7d32; }
    .danger { background: #ffcdd2; color: #c62828; }
    .neutral { background: #fff3e0; }
    .epure-svg { margin: 20px 0; border: 1px solid #eee; border-radius: 4px; overflow: hidden; }
    footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 0.9em; }
  </style>
</head>
<body>
  <header>
    <h1>САПР стержневых систем</h1>
    <h2>Отчёт по расчёту напряжённо-деформированного состояния</h2>
    <div class="meta">
      <p><strong>Дата:</strong> ${new Date().toLocaleString('ru-RU')}</p>
      <p><strong>Стержней:</strong> ${rods.length}, <strong>узлов:</strong> ${rods.length + 1}</p>
    </div>
  </header>

  ${selected.displacements ? `
  <section>
    <h3>Узловые перемещения ∆, м</h3>
    <div class="displacements">
      ${displacements.map((u, i) => `
        <div class="disp-card">
          <strong>Узел ${i}</strong><br>
          ${u.toExponential(4)}
        </div>
      `).join('')}
    </div>
  </section>
  ` : ''}

  ${constructionSvg ? `
  <section>
    <h3>Конструкция и эпюры N(x), σ(x), u(x)</h3>
    <div class="epure-svg">${constructionSvg}</div>
  </section>
  ` : ''}

  ${epureNSvg ? `
  <section>
    <h3>Эпюра продольных сил N(x)</h3>
    <div class="epure-svg">${epureNSvg}</div>
  </section>
  ` : ''}

  ${epureSigmaSvg ? `
  <section>
    <h3>Эпюра нормальных напряжений σ(x)</h3>
    <div class="epure-svg">${epureSigmaSvg}</div>
  </section>
  ` : ''}

  ${epureUSvg ? `
  <section>
    <h3>Эпюра перемещений u(x)</h3>
    <div class="epure-svg">${epureUSvg}</div>
  </section>
  ` : ''}

  ${selected.table ? `
  <section>
    <h3>Сводная таблица по стержням</h3>
    <table>
      <thead>
        <tr>
          <th>№</th>
          <th>L, м</th>
          <th>A, м²</th>
          <th>[σ], Па</th>
          <th>max\|σ\|, Па</th>
          <th>Прочность</th>
          <th>N₀, Н</th>
          <th>Nₗ, Н</th>
        </tr>
      </thead>
      <tbody>
        ${rods.map((rod: any) => {
                const N0 = rod.axialForceCoeffs.a0;
                const Nl = N0 + rod.axialForceCoeffs.a1 * rod.length;
                const safe = Math.abs(rod.maxStressOnTheRod) <= rod.allowableStress;
                return `
            <tr>
              <td>${rod.rodId}</td>
              <td>${rod.length.toFixed(2)}</td>
              <td>${rod.area.toExponential(1)}</td>
              <td>${rod.allowableStress.toExponential(1)}</td>
              <td>${rod.maxStressOnTheRod.toExponential(1)}</td>
              <td>${safe ? '✓' : '✗'}</td>
              <td>${N0.toFixed(0)}</td>
              <td>${Nl.toFixed(0)}</td>
            </tr>
          `;
            }).join('')}
      </tbody>
    </table>
  </section>
  ` : ''}

  ${selected.sectionCalc && lastSectionCalc ? `
  <section>
    <h3>Расчёт в сечении</h3>
    <div class="result-grid">
      <div class="result-item neutral">
        <h4>N(x)</h4>
        <p>${lastSectionCalc.N.toExponential(4)} Н</p>
      </div>
      <div class="result-item ${Math.abs(lastSectionCalc.sigma) > rods.find((r: any) => r.rodId === lastSectionCalc.rodId)?.allowableStress ? 'danger' : 'safe'}">
        <h4>σ(x)</h4>
        <p>${lastSectionCalc.sigma.toExponential(4)} Па</p>
      </div>
      <div class="result-item neutral">
        <h4>u(x)</h4>
        <p>${lastSectionCalc.u.toExponential(6)} м</p>
      </div>
    </div>
    <p><em>Стержень ${lastSectionCalc.rodId}, x = ${lastSectionCalc.x.toFixed(3)} м</em></p>
  </section>
  ` : ''}

  <footer>
    САПР стержневых систем. Курсовая работа. Вычислительная механика, 2025/26
  </footer>
</body>
</html>
`;

            // === 3. Скачиваем ===
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sapr_report_${new Date().toISOString().slice(0, 10)}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            onClose();

        } catch (err) {
            console.error('Ошибка генерации HTML', err);
            alert('Не удалось создать отчёт. Проверьте консоль.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                width: '500px',
                maxHeight: '85vh',
                overflowY: 'auto',
            }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>Формирование отчёта (HTML)</h3>
                <p>Выберите, какие блоки включить:</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '6px 12px', marginBottom: '1.5rem' }}>
                    {[
                        { key: 'construction', label: 'Конструкция + эпюры' },
                        { key: 'table', label: 'Сводная таблица' },
                        { key: 'epureN', label: 'Эпюра N(x)' },
                        { key: 'epureSigma', label: 'Эпюра σ(x)' },
                        { key: 'epureU', label: 'Эпюра u(x)' },
                        { key: 'displacements', label: 'Вектор ∆' },
                        { key: 'sectionCalc', label: 'Расчёт в сечении', disabled: !lastSectionCalc },
                    ].map(({ key, label, disabled }) => (
                        <React.Fragment key={key}>
                            <label style={{ opacity: disabled ? 0.5 : 1 }}>
                                <input
                                    type="checkbox"
                                    checked={selected[key as keyof typeof selected]}
                                    onChange={() => !disabled && toggle(key as keyof typeof selected)}
                                    disabled={disabled}
                                />
                                {' '} {label}
                            </label>
                            <div></div>
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ padding: '6px 16px' }}>
                        Отмена
                    </button>
                    <button
                        onClick={generateHtmlReport}
                        disabled={isGenerating}
                        style={{
                            padding: '6px 16px',
                            backgroundColor: isGenerating ? '#ccc' : '#2e7d32',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isGenerating ? 'wait' : 'pointer',
                        }}
                    >
                        {isGenerating ? 'Генерация…' : 'Скачать HTML'}
                    </button>
                </div>

                <p style={{ fontSize: '0.85em', color: '#666', marginTop: '1rem' }}>
                    Вы можете выбрать только нужные блоки.<br />
                    Отчёт сохраняется в один HTML-файл с SVG-графиками и кириллицей.
                </p>
            </div>
        </div>
    );
};

export default ExportHtmlModal;