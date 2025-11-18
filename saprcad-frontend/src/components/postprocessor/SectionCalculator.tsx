// src/components/postprocessor/SectionCalculator.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { RodResult } from '../../types/sapr.types';

interface SectionCalcResult {
    id: string;
    rodId: number;
    x: number;
    N: number;
    sigma: number;
    u: number;
    timestamp: Date;
}

interface SectionCalculatorProps {
    rods: RodResult[];
    onHistoryChange?: (history: SectionCalcResult[]) => void;
}

const SectionCalculator: React.FC<SectionCalculatorProps> = ({ rods, onHistoryChange }) => {
    const [selectedRodId, setSelectedRodId] = useState(rods[0]?.rodId ?? 0);
    const [x, setX] = useState(0);
    const [history, setHistory] = useState<SectionCalcResult[]>(() => {
        const saved = localStorage.getItem('sapr_section_history');
        return saved ? JSON.parse(saved) : [];
    });

    const rod = rods.find(r => r.rodId === selectedRodId);

    // Стабильный ключ для отслеживания изменения стержней
    const rodsKey = useMemo(() => rods.map(r => r.rodId).join(','), [rods]);

    useEffect(() => {
        // Очищаем историю только при смене конструкции
        setHistory([]);
        onHistoryChange?.([]);
    }, [rodsKey, onHistoryChange]);

    const calculate = () => {
        if (!rod) return;
        if (x < 0 || x > rod.length) {
            alert(`x должно быть в [0, ${rod.length}]`);
            return;
        }

        const N = rod.axialForceCoeffs.a0 + rod.axialForceCoeffs.a1 * x;
        const sigma = rod.stressCoeffs.a0 + rod.stressCoeffs.a1 * x;
        const u = rod.displacementCoeffs.a0 +
            rod.displacementCoeffs.a1 * x +
            rod.displacementCoeffs.a2 * x * x;

        const newCalc: SectionCalcResult = {
            id: Date.now().toString(),
            rodId: selectedRodId,
            x,
            N,
            sigma,
            u,
            timestamp: new Date(),
        };

        const updated = [newCalc, ...history];
        setHistory(updated);
        onHistoryChange?.(updated);
        localStorage.setItem('sapr_section_history', JSON.stringify(updated));
    };

    const removeItem = (id: string) => {
        const updated = history.filter(item => item.id !== id);
        setHistory(updated);
        onHistoryChange?.(updated);
        localStorage.setItem('sapr_section_history', JSON.stringify(updated));
    };

    const clearAll = () => {
        setHistory([]);
        onHistoryChange?.([]);
        localStorage.removeItem('sapr_section_history');
    };

    return (
        <section style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Калькулятор сечения</h3>
                {history.length > 0 && (
                    <button
                        onClick={clearAll}
                        style={{ padding: '4px 8px', fontSize: '0.85em', color: '#e53935', background: 'none', border: 'none' }}
                    >
                        🗑 Очистить историю ({history.length})
                    </button>
                )}
            </div>

            <p>Получите N(x), σ(x), u(x) в любом сечении стержня.</p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
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
                    Рассчитать и добавить в историю
                </button>
            </div>

            {history.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ margin: '0.5rem 0' }}>История расчётов ({history.length})</h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                        {history.map(item => {
                            const rod = rods.find(r => r.rodId === item.rodId);
                            const safe = rod ? Math.abs(item.sigma) <= rod.allowableStress : true;
                            return (
                                <div key={item.id} style={{
                                    padding: '8px',
                                    borderBottom: '1px solid #f0f0f0',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: '10px',
                                    alignItems: 'center',
                                }}>
                                    <div>
                                        <strong>Стержень {item.rodId}, x = {item.x.toFixed(3)} м</strong>
                                        <div style={{ fontSize: '0.9em', color: '#555' }}>
                                            N = {item.N.toExponential(3)} Н,
                                            σ = {item.sigma.toExponential(3)} Па,
                                            u = {item.u.toExponential(4)} м
                                            {!safe}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        style={{ padding: '2px 6px', fontSize: '0.8em', color: '#e53935', background: 'none', border: 'none' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};

export default SectionCalculator;