import React from 'react';
import { Node } from '../../types/sapr.types';

interface NodeEditorProps {
    nodes: Node[];
    rods: any[]; // Добавляем rods для проверки
    onChange: (nodes: Node[]) => void;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ nodes, rods, onChange }) => {
    // Проверяем, можно ли зафиксировать узел (только первый и последний)
    const canFixNode = (nodeIndex: number) => {
        return nodeIndex === 0 || nodeIndex === nodes.length - 1;
    };

    const addNode = () => {
        const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
        onChange([
            ...nodes,
            {
                id: newId,
                fixed: false,
                externalForce: 0.0,
            },
        ]);
    };

    const updateNode = (index: number, field: keyof Node, value: string | boolean | number) => {
        const updated = [...nodes];

        if (field === 'fixed') {
            // Нормализуем булево значение
            let boolValue: boolean;
            if (typeof value === 'string') {
                boolValue = value === 'true' || value === '1' || value.toLowerCase() === 'истина';
            } else {
                boolValue = Boolean(value);
            }

            // Проверяем, можно ли установить заделку
            if (boolValue && !canFixNode(index)) {
                alert('Заделки можно устанавливать только на крайних узлах конструкции!');
                return;
            }
            updated[index][field] = boolValue;
        } else if (field === 'externalForce') {
            // Разрешаем ввод отрицательных значений и пустую строку
            if (value === '') {
                updated[index][field] = 0;
            } else {
                const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
                updated[index][field] = numValue as number;
            }
        } else {
            // @ts-ignore
            updated[index][field] = typeof value === 'string' ? parseFloat(value) || 0 : value;
        }
        onChange(updated);
    };

    const handleForceInput = (index: number, value: string) => {
        // Разрешаем: пустую строку, отрицательные числа, десятичные числа
        if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
            updateNode(index, 'externalForce', value);
        }
    };

    const removeNode = (index: number) => {
        // Не позволяем удалить узел, если он используется в стержнях
        const isNodeUsed = rods.some(rod => rod.startNode === nodes[index].id || rod.endNode === nodes[index].id);

        if (isNodeUsed) {
            alert('Нельзя удалить узел, который используется в стержнях!');
            return;
        }

        onChange(nodes.filter((_, i) => i !== index));
    };

    return (
        <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th style={{ textAlign: 'center' }}>Заделка</th>
                    <th>Fj (Н)</th>
                    <th>Позиция</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {nodes.map((node, i) => (
                    <tr key={node.id} style={{
                        backgroundColor: canFixNode(i) ? '#f0f8ff' : '#fff9f9'
                    }}>
                        <td style={{
                            textAlign: 'center',
                            padding: '4px',
                            fontWeight: 'bold'
                        }}>
                            {node.id}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                            <input
                                type="checkbox"
                                checked={node.fixed}
                                disabled={!canFixNode(i)}
                                onChange={e => updateNode(i, 'fixed', e.target.checked)}
                                title={!canFixNode(i) ? "Заделки можно ставить только на крайних узлах" : ""}
                            />
                            {!canFixNode(i) && node.fixed && (
                                <span style={{color: 'red', fontSize: '0.8em', marginLeft: '5px'}}>⚠️</span>
                            )}
                        </td>
                        <td>
                            <input
                                type="text"
                                value={node.externalForce === 0 ? '' : node.externalForce.toString()}
                                onChange={e => handleForceInput(i, e.target.value)}
                                onBlur={(e) => {
                                    if (e.target.value === '' || e.target.value === '-') {
                                        updateNode(i, 'externalForce', 0);
                                    }
                                }}
                                placeholder="0"
                                style={{ width: '80px', textAlign: 'right' }}
                            />
                        </td>
                        <td style={{ fontSize: '0.8em', color: '#666', textAlign: 'center' }}>
                            {i === 0 && 'Начало'}
                            {i === nodes.length - 1 && 'Конец'}
                            {i > 0 && i < nodes.length - 1 && 'Середина'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                            <button
                                onClick={() => removeNode(i)}
                                style={{
                                    color: 'red',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.2em',
                                    cursor: 'pointer',
                                    padding: '2px 6px'
                                }}
                                title="Удалить узел"
                            >
                                ×
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <button onClick={addNode} style={{ marginTop: '0.5rem' }}>+ Добавить узел</button>

            {/* Подсказка для пользователя */}
            <div style={{
                marginTop: '0.5rem',
                fontSize: '0.8em',
                color: '#666',
                padding: '0.5rem',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
            }}>
                Заделки можно устанавливать только на крайних узлах конструкции (отмечены голубым фоном)
            </div>
        </div>
    );
};

export default NodeEditor;