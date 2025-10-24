package stankin.processor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import stankin.processor.dto.StructureInput;

@Service
public class PreprocessorClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${preprocessor.url:http://localhost:8081}")
    private String preprocessorUrl;

    public StructureInput fetchProject(String projectId) {
        String url = preprocessorUrl + "/api/preprocessor/project/" + projectId;
        return restTemplate.getForObject(url, StructureInput.class);
    }
}