package stankin.preprocessor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import stankin.preprocessor.dto.StructureInput;
import stankin.preprocessor.service.ExcelProjectService;
import stankin.preprocessor.service.ProjectService;
import stankin.preprocessor.service.ProjectStorageService;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/preprocessor")
public class PreprocessorController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ExcelProjectService excelProjectService;

    @Autowired
    private ProjectStorageService storageService;

    // 1. Создание нового пустого проекта
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createEmptyProject() {
        StructureInput empty = new StructureInput();
        empty.setRods(List.of());
        empty.setNodes(List.of());
        String id = storageService.createProject(empty);
        return ResponseEntity.ok(Map.of("projectId", id));
    }

    // 2. Загрузка из Excel
    @PostMapping("/upload")
    public ResponseEntity<?> uploadProject(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty() || !file.getOriginalFilename().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body("Требуется .xlsx файл");
        }

        try {
            StructureInput input = excelProjectService.readProjectFromExcel(file);
            List<String> errors = projectService.validateAndReturnErrors(input);
            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(errors);
            }
            String projectId = storageService.createProject(input);
            return ResponseEntity.ok(Map.of("projectId", projectId, "project", input));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка при чтении файла: " + e.getMessage());
        }
    }

    // 3. Отправка проекта в JSON (от фронтенда)
    @PostMapping("/submit")
    public ResponseEntity<?> submitProject(@RequestBody StructureInput input) {
        List<String> errors = projectService.validateAndReturnErrors(input);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        String projectId = storageService.createProject(input);
        return ResponseEntity.ok(Map.of("projectId", projectId));
    }

    // 4. Получение проекта для визуализации
    @GetMapping("/project/{projectId}")
    public ResponseEntity<StructureInput> getProject(@PathVariable String projectId) {
        StructureInput project = storageService.getProject(projectId);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(project);
    }

    // 5. Экспорт проекта в Excel
    @GetMapping("/export/{projectId}")
    public ResponseEntity<byte[]> exportProject(@PathVariable String projectId) throws IOException {
        StructureInput project = storageService.getProject(projectId);
        if (project == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] excelBytes = excelProjectService.writeProjectToExcel(project);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=project_" + projectId + ".xlsx")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
    }

    // 6. Скачать шаблон Excel (без привязки к проекту)
    @GetMapping("/download-template")
    public ResponseEntity<byte[]> downloadTemplate() {
        try {
            byte[] template = excelProjectService.generateTemplate();
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=sapr_template.xlsx")
                    .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                    .body(template);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    // 7. Редактирование проекта
    @PutMapping("/project/{projectId}")
    public ResponseEntity<?> updateProject(
            @PathVariable String projectId,
            @RequestBody StructureInput input) {

        if (!storageService.exists(projectId)) {
            return ResponseEntity.notFound().build();
        }

        List<String> errors = projectService.validateAndReturnErrors(input);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        storageService.updateProject(projectId, input);
        return ResponseEntity.ok(Map.of("message", "Проект обновлён", "projectId", projectId));
    }


}