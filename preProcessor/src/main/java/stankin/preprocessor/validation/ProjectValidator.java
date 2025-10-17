package stankin.preprocessor.validation;

import org.springframework.stereotype.Component;
import stankin.preprocessor.dto.Rod;
import stankin.preprocessor.dto.Node;
import stankin.preprocessor.dto.StructureInput;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class ProjectValidator {

    public List<String> validate(StructureInput input) {
        List<String> errors = new ArrayList<>();

        // Проверка на null
        if (input == null) {
            errors.add("Входные данные не могут быть null.");
            return errors;
        }

        if (input.getNodes() == null) {
            errors.add("Список узлов не может быть null.");
        }

        if (input.getRods() == null) {
            errors.add("Список стержней не может быть null.");
        }

        if (errors.size() > 0) {
            return errors;
        }

        // Проверка что списки не пустые
        if (input.getNodes().isEmpty()) {
            errors.add("Список узлов не может быть пустым.");
        }

        if (input.getRods().isEmpty()) {
            errors.add("Список стержней не может быть пустым.");
        }

        if (errors.size() > 0) {
            return errors;
        }

        // Проверка количества узлов = количество стержней + 1
        if (input.getNodes().size() != input.getRods().size() + 1) {
            errors.add("Количество узлов должно быть на 1 больше количества стержней. Узлов: " +
                    input.getNodes().size() + ", стержней: " + input.getRods().size());
        }

        // Проверка уникальности ID
        validateUniqueIds(input.getRods(), "стержней", errors);
        validateUniqueIds(input.getNodes(), "узлов", errors);

        // Проверка корректности ID (не отрицательные)
        validateIdNonNegative(input.getRods(), "стержней", errors);
        validateIdNonNegative(input.getNodes(), "узлов", errors);

        // Проверка физических ограничений для стержней
        for (Rod rod : input.getRods()) {
            if (rod.getLength() <= 0) {
                errors.add("Стержень ID=" + rod.getId() + ": длина должна быть > 0.");
            }
            if (rod.getArea() <= 0) {
                errors.add("Стержень ID=" + rod.getId() + ": площадь сечения должна быть > 0.");
            }
            if (rod.getElasticModulus() <= 0) {
                errors.add("Стержень ID=" + rod.getId() + ": модуль упругости должен быть > 0.");
            }
            if (rod.getAllowableStress() <= 0) {
                errors.add("Стержень ID=" + rod.getId() + ": допускаемое напряжение должно быть > 0.");
            }
            // distributedLoad может быть любым (отрицательным, положительным или нулем)
        }

        // Проверка последовательности ID узлов (для упрощения расчетов)
        validateNodeIdSequence(input.getNodes(), errors);

        // Проверка последовательности ID стержней (для упрощения расчетов)
        validateRodIdSequence(input.getRods(), errors);

        // Проверка структуры стержневой системы
        validateStructure(input.getRods(), input.getNodes(), errors);

        // Проверка расположения опор (опоры не могут быть в середине конструкции)
        validateSupportLocations(input.getNodes(), errors);

        // Проверка критических ошибок
        validateCritical(input, errors);

        return errors;
    }

    private void validateUniqueIds(List<?> items, String type, List<String> errors) {
        if (items == null || items.isEmpty()) {
            return;
        }

        Set<Integer> idSet = new HashSet<>();
        for (Object item : items) {
            Integer id = getIdFromObject(item);
            if (id != null) {
                if (idSet.contains(id)) {
                    errors.add("Найден дубликат ID " + id + " в списке " + type + ".");
                } else {
                    idSet.add(id);
                }
            }
        }
    }

    private void validateIdNonNegative(List<?> items, String type, List<String> errors) {
        if (items == null) {
            return;
        }

        for (Object item : items) {
            Integer id = getIdFromObject(item);
            if (id != null && id < 0) {
                errors.add("ID не может быть отрицательным. Найдено в " + type + ": " + id);
            }
        }
    }

    private Integer getIdFromObject(Object item) {
        if (item instanceof Rod) {
            return ((Rod) item).getId();
        } else if (item instanceof Node) {
            return ((Node) item).getId();
        }
        return null;
    }

    private void validateNodeIdSequence(List<Node> nodes, List<String> errors) {
        if (nodes == null || nodes.isEmpty()) {
            return;
        }

        // Проверяем, что ID узлов идут последовательно от 0 или 1
        Set<Integer> nodeIds = new HashSet<>();
        int minId = Integer.MAX_VALUE;
        int maxId = Integer.MIN_VALUE;

        for (Node node : nodes) {
            int id = node.getId();
            nodeIds.add(id);
            minId = Math.min(minId, id);
            maxId = Math.max(maxId, id);
        }

        // Проверяем последовательность
        if (maxId - minId + 1 != nodeIds.size()) {
            errors.add("ID узлов должны идти последовательно без пропусков. Найдены ID от " +
                    minId + " до " + maxId + " с пропусками.");
        }

        // Рекомендуем начинать с 0 или 1
        if (minId != 0 && minId != 1) {
            errors.add("Рекомендуется начинать нумерацию узлов с 0 или 1. Найден минимальный ID: " + minId);
        }

        // Проверяем наличие хотя бы одной заделки (фиксированного узла)
        boolean hasFixedSupport = false;
        for (Node node : nodes) {
            if (node.isFixed()) {
                hasFixedSupport = true;
                break;
            }
        }
        if (!hasFixedSupport) {
            errors.add("Система должна иметь хотя бы одну заделку (фиксированный узел).");
        }

    }

    private void validateRodIdSequence(List<Rod> rods, List<String> errors) {
        if (rods == null || rods.isEmpty()) {
            return;
        }

        // Проверяем, что ID стержней идут последовательно от 0 или 1
        Set<Integer> rodIds = new HashSet<>();
        int minId = Integer.MAX_VALUE;
        int maxId = Integer.MIN_VALUE;

        for (Rod rod : rods) {
            int id = rod.getId();
            rodIds.add(id);
            minId = Math.min(minId, id);
            maxId = Math.max(maxId, id);
        }

        // Проверяем последовательность
        if (maxId - minId + 1 != rodIds.size()) {
            errors.add("ID стержней должны идти последовательно без пропусков. Найдены ID от " +
                    minId + " до " + maxId + " с пропусками.");
        }

        // Рекомендуем начинать с 0 или 1
        if (minId != 0 && minId != 1) {
            errors.add("Рекомендуется начинать нумерацию стержней с 0 или 1. Найден минимальный ID: " + minId);
        }
    }

    private void validateStructure(List<Rod> rods, List<Node> nodes, List<String> errors) {
        if (rods == null || nodes == null || rods.isEmpty() || nodes.isEmpty()) {
            return;
        }

        // Создаем множество ID узлов для быстрой проверки
        Set<Integer> nodeIds = new HashSet<>();
        for (Node node : nodes) {
            nodeIds.add(node.getId());
        }

        // Для линейной системы стержней проверяем, что узлы соединены последовательно
        // В линейной системе стержень i соединяет узел i и узел i+1
        for (int i = 0; i < rods.size(); i++) {
            Rod rod = rods.get(i);
            int expectedStartNode = i;
            int expectedEndNode = i + 1;

            // Проверяем существование ожидаемых узлов
            if (!nodeIds.contains(expectedStartNode) || !nodeIds.contains(expectedEndNode)) {
                errors.add("Нарушена последовательность соединения стержней. " +
                        "Стержень " + rod.getId() + " должен соединять узлы " +
                        expectedStartNode + " и " + expectedEndNode);
            }
        }

        // Проверяем наличие хотя бы одной заделки (фиксированного узла)
        boolean hasFixedSupport = false;
        for (Node node : nodes) {
            if (node.isFixed()) {
                hasFixedSupport = true;
                break;
            }
        }

        if (!hasFixedSupport) {
            errors.add("Система должна иметь хотя бы одну заделку (фиксированный узел).");
        }
    }

    /**
     * Проверяет, что фиксированные опоры находятся только на концах конструкции
     * Опоры не могут быть расположены в середине конструкции
     */
    private void validateSupportLocations(List<Node> nodes, List<String> errors) {
        if (nodes == null || nodes.size() < 3) {
            return; // Для менее чем 3 узлов не может быть "середины"
        }

        // Находим минимальный и максимальный ID узлов
        int minId = Integer.MAX_VALUE;
        int maxId = Integer.MIN_VALUE;

        for (Node node : nodes) {
            int id = node.getId();
            minId = Math.min(minId, id);
            maxId = Math.max(maxId, id);
        }

        // Проверяем каждый фиксированный узел
        for (Node node : nodes) {
            if (node.isFixed()) {
                int nodeId = node.getId();
                // Если узел не первый и не последний - это ошибка
                if (nodeId != minId && nodeId != maxId) {
                    errors.add("Фиксированная опора не может находиться в середине конструкции. " +
                            "Узел ID=" + nodeId + " является фиксированной опорой, но не находится на конце конструкции. " +
                            "Опоры могут быть только на крайних узлах (ID: " + minId + " или " + maxId + ").");
                }
            }
        }
    }

    // Дополнительный метод для проверки перед расчетами
    public boolean isValid(StructureInput input) {
        return validate(input).isEmpty();
    }

    // Метод для получения первой ошибки (удобно для UI)
    public String getFirstError(StructureInput input) {
        List<String> errors = validate(input);
        return errors.isEmpty() ? null : errors.get(0);
    }

    // Метод для быстрой проверки только критических ошибок
    public List<String> validateCritical(StructureInput input,List<String> errors) {

        if (input == null) {
            errors.add("Входные данные не могут быть null.");
            return errors;
        }

        if (input.getNodes() == null || input.getNodes().isEmpty()) {
            errors.add("Список узлов не может быть пустым.");
        }

        if (input.getRods() == null || input.getRods().isEmpty()) {
            errors.add("Список стержней не может быть пустым.");
        }

        if (errors.size() > 0) {
            return errors;
        }

        // Проверка количества узлов
        if (input.getNodes().size() != input.getRods().size() + 1) {
            errors.add("Количество узлов должно быть на 1 больше количества стержней.");
        }

        // Проверка наличия фиксированной опоры
        boolean hasFixedSupport = false;
        for (Node node : input.getNodes()) {
            if (node.isFixed()) {
                hasFixedSupport = true;
                break;
            }
        }

        if (!hasFixedSupport) {
            errors.add("Система должна иметь хотя бы одну заделку.");
        }

        return errors;
    }
}