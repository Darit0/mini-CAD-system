package stankin.preprocessor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import stankin.preprocessor.dto.StructureInput;
import stankin.preprocessor.validation.ProjectValidator;

import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectValidator validator;

    public List<String> validateAndReturnErrors(StructureInput input) {
        return validator.validate(input);
    }

}
