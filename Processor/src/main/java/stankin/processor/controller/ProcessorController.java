package stankin.processor.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import stankin.processor.config.PreprocessorClient;
import stankin.processor.dto.DisplacementVector;
import stankin.processor.dto.ProjectIdRequest;
import stankin.processor.dto.StructureInput;
import stankin.processor.service.CalculateDisplacementsService;

@RestController
@RequestMapping("/api/processor")
public class ProcessorController {

    @Autowired
    private CalculateDisplacementsService calculateDisplacementsService;

    @Autowired
    private PreprocessorClient preprocessorClient;

    // прямая передача данных
    @PostMapping("/calculate-with-structure")
    public ResponseEntity<DisplacementVector> calculate(@RequestBody StructureInput input) {
        DisplacementVector result = calculateDisplacementsService.calculateDisplacements(input);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/calculate")
    public ResponseEntity<DisplacementVector> calculateByProjectIdFromJson(@RequestBody ProjectIdRequest request) {
        StructureInput input = preprocessorClient.fetchProject(request.getProjectId());
        if (input == null) {
            return ResponseEntity.notFound().build();
        }
        DisplacementVector result = calculateDisplacementsService.calculateDisplacements(input);
        return ResponseEntity.ok(result);
    }

}

