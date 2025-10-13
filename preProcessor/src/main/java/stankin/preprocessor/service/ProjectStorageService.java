package stankin.preprocessor.service;

import org.springframework.stereotype.Service;
import stankin.preprocessor.dto.StructureInput;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ProjectStorageService {

    private final Map<String, StructureInput> storage = new ConcurrentHashMap<>();

    public String createProject(StructureInput input) {
        String id = UUID.randomUUID().toString();
        storage.put(id, input);
        return id;
    }

    public boolean updateProject(String projectId, StructureInput input) {
        if (!storage.containsKey(projectId)) {
            return false;
        }
        storage.put(projectId, input);
        return true;
    }

    public StructureInput getProject(String projectId) {
        return storage.get(projectId);
    }

    public boolean exists(String projectId) {
        return storage.containsKey(projectId);
    }
}