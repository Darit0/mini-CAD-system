// src/components/postprocessor/UniformStepCalculator.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { RodResult } from '../../types/sapr.types';

interface Props {
    rods: RodResult[];
    onStepDataChange?: (data: any[]) => void;
}

const UniformStepCalculator: React.FC<Props> = ({ rods, onStepDataChange }) => {
    const [step, setStep] = useState<number>(0.5);

    const tableData = useMemo(() => {
        if (step <= 0) return [];

        const rows: {
            rodId: number;
            x: number;
            N: number;
            sigma: number;
            u: number;
            isBoundary: boolean;
        }[] = [];

        rods.forEach(rod => {
            const L = rod.length;
            const points = new Set<number>();

            points.add(0);
            points.add(L);

            if (step < L) {
                let x = step;
                while (x < L) {
                    points.add(x);
                    x += step;
                }
            }

            Array.from(points)
                .sort((a, b) => a - b)
                .forEach(x => {
                    const N = rod.axialForceCoeffs.a0 + rod.axialForceCoeffs.a1 * x;
                    const sigma = rod.stressCoeffs.a0 + rod.stressCoeffs.a1 * x;
                    const u = rod.displacementCoeffs.a0 +
                        rod.displacementCoeffs.a1 * x +
                        rod.displacementCoeffs.a2 * x * x;
                    rows.push({
                        rodId: rod.rodId,
                        x,
                        N,
                        sigma,
                        u,
                        isBoundary: x === 0 || x === L,
                    });
                });
        });

        return rows;
    }, [rods, step]);

    // Вызываем пропс ТОЛЬКО при изменении данных, а не при каждом useMemo
    useEffect(() => {
        onStepDataChange?.(tableData);
    }, [tableData, onStepDataChange]);

    return (
        <section style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
            <h3>Расчёт по равномерному шагу</h3>
            <p>Таблица значений N(x), σ(x), u(x) с шагом вдоль конструкции.</p>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <label>
                    Шаг, м:
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={step}
                        onChange={e => setStep(parseFloat(e.target.value) || 0.01)}
                        style={{ width: '80px', marginLeft: '6px' }}
                    />
                </label>
                <button
                    onClick={() => {
                        const content = `Стержень,x,N(x),σ(x),u(x)\n` +
                            tableData.map(r =>
                                `${r.rodId},${r.x.toFixed(3)},${r.N.toExponential(3)},${r.sigma.toExponential(3)},${r.u.toExponential(3)}`
                            ).join('\n');
                        const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `step_table_${step}m.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                    style={{ padding: '4px 10px', fontSize: '0.9em' }}
                >
                    Экспорт в CSV
                </button>
            </div>

            {tableData.length > 0 && (
                <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                        <thead>
                        <tr style={{ backgroundColor: '#4a90e2', color: 'white' }}>
                            <th>Стержень</th>
                            <th>x, м</th>
                            <th>N(x), Н</th>
                            <th>σ(x), Па</th>
                            <th>u(x), м</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableData.map((row, i) => (
                            <tr key={i} style={{ backgroundColor: row.isBoundary ? '#e8f5e9' : 'transparent' }}>
                                <td style={{ padding: '4px', textAlign: 'center' }}>{row.rodId}</td>
                                <td style={{ padding: '4px', textAlign: 'center' }}>{row.x.toFixed(4)}</td>
                                <td style={{ padding: '4px', textAlign: 'center', fontFamily: 'monospace' }}>{row.N.toExponential(3)}</td>
                                <td style={{ padding: '4px', textAlign: 'center', fontFamily: 'monospace' }}>{row.sigma.toExponential(3)}</td>
                                <td style={{ padding: '4px', textAlign: 'center', fontFamily: 'monospace' }}>{row.u.toExponential(5)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <p style={{ fontSize: '0.85em', color: '#666', marginTop: '6px' }}>
                        Подсвечены граничные сечения (начало и конец стержня)
                    </p>
                </div>
            )}

            {step <= 0 && (
                <p style={{ color: 'red' }}>Шаг должен быть больше 0</p>
            )}
        </section>
    );
};

export default UniformStepCalculator;