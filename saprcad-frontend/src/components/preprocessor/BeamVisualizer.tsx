import React from 'react';
import { StructureInput } from '../../types/sapr.types';

interface BeamVisualizerProps {
    project: StructureInput;
}

const BeamVisualizer: React.FC<BeamVisualizerProps> = ({ project }) => {

    if (project.nodes.length !== project.rods.length + 1) {
        return (
            <div style={{ padding: '1rem', color: 'orange' }}>
                Несоответствие: узлов должно быть на 1 больше, чем стержней.
                Сейчас: стержней — {project.rods.length}, узлов — {project.nodes.length}.
            </div>
        );
    }

    if (project.rods.length === 0 || project.nodes.length === 0) {
        return <div className="beam-placeholder">Добавьте стержни и узлы</div>;
    }

    // Масштабы
    const BASE_LENGTH_SCALE = 50;
    const MAX_HEIGHT = 20;
    const MIN_HEIGHT = 8;
    const ARROW_LENGTH = 25; // Длина стрелки
    const NODE_OFFSET_X = ARROW_LENGTH + 10; // Увеличиваем отступ для стрелки
    const MAX_VISIBLE_WIDTH = 800;

    // Предварительный расчёт позиций
    const rodPositions: { x: number; width: number; height: number; y: number }[] = [];
    const nodePositions: number[] = [];

    // Рассчитываем общую длину конструкции
    const totalLength = project.rods.reduce((sum, rod) => sum + rod.length, 0);

    // Автоматическое масштабирование длины
    let lengthScale = BASE_LENGTH_SCALE;
    const requiredWidth = totalLength * BASE_LENGTH_SCALE + 2 * NODE_OFFSET_X;

    if (requiredWidth > MAX_VISIBLE_WIDTH) {
        lengthScale = (MAX_VISIBLE_WIDTH - 2 * NODE_OFFSET_X) / totalLength;
    }

    let currentX = NODE_OFFSET_X;

    // Позиции стержней с улучшенным масштабированием высоты
    const maxArea = Math.max(...project.rods.map(r => r.area));
    const minArea = Math.min(...project.rods.map(r => r.area));

    let areaScale = 1;
    if (maxArea > 0) {
        if (maxArea / minArea > 10) {
            areaScale = (MAX_HEIGHT - MIN_HEIGHT) / Math.log(maxArea / minArea + 1);
        } else {
            areaScale = (MAX_HEIGHT - MIN_HEIGHT) / maxArea;
        }
    }

    for (const rod of project.rods) {
        const width = rod.length * lengthScale;
        let height;

        if (maxArea / minArea > 10) {
            height = MIN_HEIGHT + Math.log(rod.area / minArea + 1) * areaScale;
        } else {
            height = MIN_HEIGHT + rod.area * areaScale;
        }

        const y = 100 - height / 2;
        rodPositions.push({ x: currentX, width, height, y });
        currentX += width;
    }

    // Позиции узлов
    currentX = NODE_OFFSET_X;
    for (let i = 0; i < project.nodes.length; i++) {
        if (i === 0) {
            nodePositions.push(NODE_OFFSET_X);
        } else {
            currentX += project.rods[i - 1].length * lengthScale;
            nodePositions.push(currentX);
        }
    }

    return (
        <div style={{ overflow: 'auto', padding: '10px 0', paddingLeft: '20px' }}>
            <svg
                width="100%"
                height="180"
                style={{
                    minWidth: '600px',
                    backgroundColor: '#fafafa',
                    maxWidth: `${MAX_VISIBLE_WIDTH}px`
                }}
                viewBox={`0 0 ${Math.max(MAX_VISIBLE_WIDTH, requiredWidth)} 180`} // Добавляем viewBox для правильного отображения
            >
                <defs>
                    {/* Улучшенная стрелка для сосредоточенных сил с палочкой */}
                    <marker
                        id="concentratedArrow"
                        markerWidth="8"
                        markerHeight="8"
                        refX="7"
                        refY="4"
                        orient="auto"
                    >
                        {/* Палочка */}
                        <line x1="0" y1="4" x2="5" y2="4" stroke="currentColor" strokeWidth="2" />
                        {/* Треугольник (уменьшен в 3 раза) */}
                        <path d="M5,2 L5,6 L7,4 Z" fill="currentColor" />
                    </marker>

                    {/* Маленькая стрелка для распределенных нагрузок */}
                    <marker
                        id="distributedArrow"
                        markerWidth="4"
                        markerHeight="4"
                        refX="3"
                        refY="2"
                        orient="auto"
                    >
                        <path d="M0,0 L0,4 L3,2 z" fill="currentColor" />
                    </marker>
                </defs>

                {/* Стержни */}
                {project.rods.map((rod, i) => {
                    const pos = rodPositions[i];
                    return (
                        <g key={rod.id}>
                            <rect
                                x={pos.x}
                                y={pos.y}
                                width={pos.width}
                                height={pos.height}
                                fill="#4a90e2"
                                stroke="#2c3e50"
                                strokeWidth="1"
                            />

                            {/* Подпись стержня */}
                            <circle cx={pos.x + pos.width / 2} cy={70} r="10" fill="#fff" stroke="#333" />
                            <text x={pos.x + pos.width / 2} y={74} textAnchor="middle" fontSize="10" fill="#000">
                                {rod.id}
                            </text>

                            {/* Информация о длине стержня */}
                            <text x={pos.x + pos.width / 2} y={60} textAnchor="middle" fontSize="8" fill="#666">
                                L={rod.length.toFixed(2)}м
                            </text>

                            {/* Распределённая нагрузка - маленькие частые стрелки */}
                            {rod.distributedLoad !== 0 && (
                                <>
                                    {Array.from({ length: Math.max(3, Math.floor(pos.width / 15)) }).map((_, idx) => {
                                        const spacing = pos.width / (Math.max(3, Math.floor(pos.width / 15)) + 1);
                                        const arrowX = pos.x + spacing * (idx + 1);
                                        const direction = rod.distributedLoad > 0 ? 1 : -1;
                                        const arrowLength = 8;

                                        return (
                                            <line
                                                key={idx}
                                                x1={arrowX}
                                                y1={pos.y + pos.height / 2}
                                                x2={arrowX + arrowLength * direction}
                                                y2={pos.y + pos.height / 2}
                                                stroke={rod.distributedLoad > 0 ? 'green' : 'red'}
                                                strokeWidth="1.5"
                                                markerEnd="url(#distributedArrow)"
                                            />
                                        );
                                    })}
                                </>
                            )}
                        </g>
                    );
                })}

                {/* Узлы */}
                {project.nodes.map((node, i) => {
                    const nodeX = nodePositions[i];
                    const isLastNode = i === project.nodes.length - 1;
                    const isFixed = node.isFixed;

                    return (
                        <g key={node.id}>
                            {/* Опора (заделка) */}
                            {isFixed && (
                                <>
                                    {/* Стенка */}
                                    <line x1={nodeX} y1={90} x2={nodeX} y2={110} stroke="#000" strokeWidth="2" />

                                    {/* Наклонные штрихи заделки */}
                                    {isLastNode ? (
                                        <>
                                            {[...Array(7)].map((_, idx) => (
                                                <line
                                                    key={idx}
                                                    x1={nodeX}
                                                    y1={90 + idx * 3}
                                                    x2={nodeX + 8}
                                                    y2={90 + idx * 3 + 4}
                                                    stroke="#000"
                                                    strokeWidth="1.5"
                                                />
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {[...Array(7)].map((_, idx) => (
                                                <line
                                                    key={idx}
                                                    x1={nodeX}
                                                    y1={90 + idx * 3}
                                                    x2={nodeX - 8}
                                                    y2={90 + idx * 3 + 4}
                                                    stroke="#000"
                                                    strokeWidth="1.5"
                                                />
                                            ))}
                                        </>
                                    )}
                                </>
                            )}

                            {/* Сосредоточенная сила - улучшенные стрелки с палочкой */}
                            {node.externalForce !== 0 && (
                                <line
                                    x1={nodeX}
                                    y1={100}
                                    x2={nodeX + (node.externalForce > 0 ? ARROW_LENGTH : -ARROW_LENGTH)}
                                    y2={100}
                                    stroke={node.externalForce > 0 ? 'blue' : 'orange'}
                                    strokeWidth="2"
                                    markerEnd="url(#concentratedArrow)"
                                />
                            )}

                            {/* Подпись узла */}
                            <text x={nodeX} y={145} textAnchor="middle" fontSize="12" fill="#333">
                                Узел {node.id}
                            </text>

                            {/* Маркер узла */}
                            <circle cx={nodeX} cy={100} r="3" fill="#fff" stroke="#333" strokeWidth="1.5" />
                        </g>
                    );
                })}

                {/* Информация о масштабе */}
                {lengthScale !== BASE_LENGTH_SCALE && (
                    <text x={NODE_OFFSET_X} y={170} fontSize="10" fill="#888">
                        Масштаб длины уменьшен для отображения (1м = {(lengthScale).toFixed(1)}px)
                    </text>
                )}
            </svg>
        </div>
    );
};

export default BeamVisualizer;