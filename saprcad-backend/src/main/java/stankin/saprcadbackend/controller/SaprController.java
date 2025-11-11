package stankin.saprcadbackend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import stankin.saprcadbackend.dto.calculate.DisplacementVector;
import stankin.saprcadbackend.dto.result.FullResult;
import stankin.saprcadbackend.dto.structure.StructureInput;
import stankin.saprcadbackend.service.postprocessor.ResultService;
import stankin.saprcadbackend.service.preprocessor.ProjectService;
import stankin.saprcadbackend.service.processor.CalculateDisplacementsService;

import java.util.List;

@RestController
@RequestMapping("api/saprcad")
public class SaprController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private CalculateDisplacementsService calculateDisplacementsService;

    @Autowired
    private ResultService resultService;

    // Получение проекта, проверка его валидности
    @PostMapping("/submit")
    public ResponseEntity<?> submitProject(@RequestBody StructureInput input) {
        List<String> errors = projectService.validateAndReturnErrors(input);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        return ResponseEntity.ok("OK");
    }

    // Передача структуры на расчет
    @PostMapping("/calculate-structure")
    public ResponseEntity<DisplacementVector> calculate(@RequestBody StructureInput input) {
        DisplacementVector result = calculateDisplacementsService.calculateDisplacements(input);
        return ResponseEntity.ok(result);
    }

    // Получение полной информации расчета
    @PostMapping("/full-calculation")
    public ResponseEntity<FullResult> fullCalculation(@RequestBody StructureInput input) {
        List<String> errors = projectService.validateAndReturnErrors(input);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        DisplacementVector delta = calculateDisplacementsService.calculateDisplacements(input);
        FullResult result = resultService.calculateNds(input, delta);

        return ResponseEntity.ok(result);
    }
}
