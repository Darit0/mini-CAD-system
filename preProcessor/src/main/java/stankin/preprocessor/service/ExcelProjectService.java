package stankin.preprocessor.service;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import stankin.preprocessor.dto.Node;
import stankin.preprocessor.dto.Rod;
import stankin.preprocessor.dto.StructureInput;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class ExcelProjectService {

    public StructureInput readProjectFromExcel(MultipartFile file) throws IOException {
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            StructureInput input = new StructureInput();

            // Чтение стержней
            Sheet rodsSheet = workbook.getSheet("Rods");
            if (rodsSheet == null) throw new IllegalArgumentException("Лист 'Rods' не найден");
            input.setRods(readRodsFromSheet(rodsSheet));

            // Чтение узлов
            Sheet nodesSheet = workbook.getSheet("Nodes");
            if (nodesSheet == null) throw new IllegalArgumentException("Лист 'Nodes' не найден");
            input.setNodes(readNodesFromSheet(nodesSheet));

            return input;
        }
    }

    private List<Rod> readRodsFromSheet(Sheet sheet) {
        List<Rod> rods = new ArrayList<>();
        Iterator<Row> rowIterator = sheet.iterator();
        if (rowIterator.hasNext()) rowIterator.next(); // пропускаем заголовок

        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();

            // Проверяем, что строка не пустая
            if (row.getCell(0) == null) continue;

            Rod rod = new Rod();
            rod.setId(getSafeNumericValue(row.getCell(0)).intValue());
            rod.setLength(getSafeNumericValue(row.getCell(1)));
            rod.setArea(getSafeNumericValue(row.getCell(2)));
            rod.setElasticModulus(getSafeNumericValue(row.getCell(3)));
            rod.setAllowableStress(getSafeNumericValue(row.getCell(4)));
            rod.setDistributedLoad(getSafeNumericValue(row.getCell(5)));
            rods.add(rod);
        }
        return rods;
    }

    private List<Node> readNodesFromSheet(Sheet sheet) {
        List<Node> nodes = new ArrayList<>();
        Iterator<Row> rowIterator = sheet.iterator();
        if (rowIterator.hasNext()) rowIterator.next(); // заголовок

        while (rowIterator.hasNext()) {
            Row row = rowIterator.next();

            // Проверяем, что строка не пустая
            if (row.getCell(0) == null) continue;

            Node node = new Node();
            node.setId(getSafeNumericValue(row.getCell(0)).intValue());;

            // Обработка булевого значения с проверкой типа ячейки
            Cell booleanCell = row.getCell(1);
            boolean isFixed = false;

            if (booleanCell != null) {
                switch (booleanCell.getCellType()) {
                    case BOOLEAN:
                        isFixed = booleanCell.getBooleanCellValue();
                        break;
                    case STRING:
                        String stringValue = booleanCell.getStringCellValue().toLowerCase().trim();
                        isFixed = stringValue.equals("true") || stringValue.equals("истина") ||
                                stringValue.equals("да") || stringValue.equals("1") ||
                                stringValue.equals("yes");
                        break;
                    case NUMERIC:
                        isFixed = booleanCell.getNumericCellValue() != 0;
                        break;
                    case FORMULA:
                        // Для формул пытаемся получить результат как булево значение
                        try {
                            isFixed = booleanCell.getBooleanCellValue();
                        } catch (Exception e) {
                            // Если не получается, пробуем как строку
                            try {
                                String formulaValue = booleanCell.getStringCellValue().toLowerCase().trim();
                                isFixed = formulaValue.equals("true") || formulaValue.equals("истина") ||
                                        formulaValue.equals("да") || formulaValue.equals("1");
                            } catch (Exception ex) {
                                isFixed = false;
                            }
                        }
                        break;
                    default:
                        isFixed = false;
                }
            }

            node.setFixed(isFixed);
            node.setExternalForce(getSafeNumericValue(row.getCell(2)));
            nodes.add(node);
        }
        return nodes;
    }

    private Double getSafeNumericValue(Cell cell) {
        if (cell == null) return 0.0;
        try {
            return cell.getNumericCellValue();
        } catch (Exception e) {
            // Если не удалось прочитать как число, пробуем прочитать как строку и преобразовать
            try {
                String stringValue = cell.getStringCellValue().trim();
                if (stringValue.isEmpty()) return 0.0;
                return Double.parseDouble(stringValue);
            } catch (Exception ex) {
                return 0.0;
            }
        }
    }

    public byte[] writeProjectToExcel(StructureInput input) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            // Лист Rods
            Sheet rodsSheet = workbook.createSheet("Rods");
            createRodHeader(rodsSheet);
            int rowNum = 1;
            for (Rod rod : input.getRods()) {
                Row row = rodsSheet.createRow(rowNum++);
                row.createCell(0).setCellValue(rod.getId());
                row.createCell(1).setCellValue(rod.getLength());
                row.createCell(2).setCellValue(rod.getArea());
                row.createCell(3).setCellValue(rod.getElasticModulus());
                row.createCell(4).setCellValue(rod.getAllowableStress());
                row.createCell(5).setCellValue(rod.getDistributedLoad());
            }

            // Лист Nodes
            Sheet nodesSheet = workbook.createSheet("Nodes");
            createNodeHeader(nodesSheet);
            rowNum = 1;
            for (Node node : input.getNodes()) {
                Row row = nodesSheet.createRow(rowNum++);
                row.createCell(0).setCellValue(node.getId());
                row.createCell(1).setCellValue(node.isFixed());
                row.createCell(2).setCellValue(node.getExternalForce());
            }

            // Автоподбор ширины колонок
            for (int i = 0; i < 6; i++) rodsSheet.autoSizeColumn(i);
            for (int i = 0; i < 3; i++) nodesSheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] generateTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            // === Лист Rods ===
            Sheet rodsSheet = workbook.createSheet("Rods");
            Row headerRods = rodsSheet.createRow(0);
            headerRods.createCell(0).setCellValue("id");
            headerRods.createCell(1).setCellValue("Li (м)");
            headerRods.createCell(2).setCellValue("Ai (м²)");
            headerRods.createCell(3).setCellValue("Ei (Па)");
            headerRods.createCell(4).setCellValue("[σ]i (Па)");
            headerRods.createCell(5).setCellValue("qi (Н/м)");

            // Пример строки
            Row exampleRod = rodsSheet.createRow(1);
            exampleRod.createCell(0).setCellValue(0);
            exampleRod.createCell(1).setCellValue(2.0);
            exampleRod.createCell(2).setCellValue(0.01);
            exampleRod.createCell(3).setCellValue(2.1e11); // Сталь
            exampleRod.createCell(4).setCellValue(250e6);
            exampleRod.createCell(5).setCellValue(0.0);

            // === Лист Nodes ===
            Sheet nodesSheet = workbook.createSheet("Nodes");
            Row headerNodes = nodesSheet.createRow(0);
            headerNodes.createCell(0).setCellValue("id");
            headerNodes.createCell(1).setCellValue("isFixed");
            headerNodes.createCell(2).setCellValue("Fj (Н)");

            Row exampleNode1 = nodesSheet.createRow(1);
            exampleNode1.createCell(0).setCellValue(0);
            exampleNode1.createCell(1).setCellValue(true);   // жёсткая опора
            exampleNode1.getCell(1).setCellType(CellType.BOOLEAN);
            exampleNode1.createCell(2).setCellValue(0.0);

            Row exampleNode2 = nodesSheet.createRow(2);
            exampleNode2.createCell(0).setCellValue(1);
            exampleNode2.createCell(1).setCellValue(false);
            exampleNode2.getCell(1).setCellType(CellType.BOOLEAN);
            exampleNode2.createCell(2).setCellValue(-10000.0); // сжимающая сила

            // Автоподбор ширины колонок
            for (int i = 0; i < 6; i++) rodsSheet.autoSizeColumn(i);
            for (int i = 0; i < 3; i++) nodesSheet.autoSizeColumn(i);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void createRodHeader(Sheet sheet) {
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("id");
        header.createCell(1).setCellValue("Li (м)");
        header.createCell(2).setCellValue("Ai (м²)");
        header.createCell(3).setCellValue("Ei (Па)");
        header.createCell(4).setCellValue("[σ]i (Па)");
        header.createCell(5).setCellValue("qi (Н/м)");
    }

    private void createNodeHeader(Sheet sheet) {
        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("id");
        header.createCell(1).setCellValue("isFixed");
        header.createCell(2).setCellValue("Fj (Н)");
    }
}
