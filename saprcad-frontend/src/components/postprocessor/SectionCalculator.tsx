// src/components/postprocessor/SectionCalculator.tsx
import React, { useState } from 'react';
import { RodResult } from '../../types/sapr.types';

interface SectionCalculatorProps {
    rods: RodResult[];
    onCalculate?: (result: {
        rodId: number;
        x: number;
        N: number;
        sigma: number;
        u: number;
    }) => void;
}

const SectionCalculator: React.FC<SectionCalculatorProps> = ({ rods, onCalculate }) => {
    const [selectedRodId, setSelectedRodId] = useState(rods[0]?.rodId ?? 0);
    const [x, setX] = useState(0);
    const [result, setResult] = useState<{ N: number; sigma: number; u: number } | null>(null);

    const rod = rods.find(r => r.rodId === selectedRodId);

    const calculate = () => {
        if (!rod) return;
        if (x < 0 || x > rod.length) {
            alert(`x должно быть в [0, ${rod.length}]`);
            return;
        }

        const N = rod.axialForceCoeffs.a0 + rod.axialForceCoeffs.a1 * x;
        const sigma = rod.stressCoeffs.a0 + rod.stressCoeffs.a1 * x;
        const u =
            rod.displacementCoeffs.a0 +
            rod.displacementCoeffs.a1 * x +
            rod.displacementCoeffs.a2 * x * x;

        const calcResult = { N, sigma, u };
        setResult(calcResult);

        // Передаём результат вверх (для отчёта)
        onCalculate?.({
            rodId: rod.rodId,
            x,
            ...calcResult,
        });

        // Проверка прочности
        if (Math.abs(sigma) > rod.allowableStress) {
            alert(` Вы почти у цели, но пока так: |σ| = ${Math.abs(sigma).toFixed(2)} > [σ] = ${rod.allowableStress}`);
        }
    };

    return (
        <section style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
            <h3>Калькулятор сечения</h3>
            <p>Получите N(x), σ(x), u(x) в любом сечении стержня.</p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <label>
                    Стержень:
                    <select value={selectedRodId} onChange={e => setSelectedRodId(Number(e.target.value))}>
                        {rods.map(r => (
                            <option key={r.rodId} value={r.rodId}>
                                {r.rodId} (L={r.length} м)
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    x ={' '}
                    <input
                        type="number"
                        step="0.01"
                        value={x}
                        onChange={e => setX(parseFloat(e.target.value) || 0)}
                        style={{ width: '80px' }}
                    />
                    м
                </label>

                <button onClick={calculate} style={{ padding: '6px 12px' }}>
                    Рассчитать
                </button>
            </div>

            {result && rod && (
                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#e3f2fd' }}>
                        <strong>N(x)</strong><br />
                        {result.N.toFixed(4)} Н
                    </div>
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '0.5rem',
                            backgroundColor:
                                Math.abs(result.sigma) > rod.allowableStress ? '#ffcdd2' : '#e8f5e9',
                        }}
                    >
                        <strong>σ(x)</strong><br />
                        {result.sigma.toFixed(4)} Па
                        {Math.abs(result.sigma) > rod.allowableStress}
                    </div>
                    <div style={{ textAlign: 'center', padding: '0.5rem', backgroundColor: '#fff3e0' }}>
                        <strong>u(x)</strong><br />
                        {result.u.toFixed(6)} м
                    </div>
                </div>
            )}
        </section>
    );
};

export default SectionCalculator;