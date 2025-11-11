package stankin.saprcadbackend.service.preprocessor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import stankin.saprcadbackend.dto.structure.StructureInput;


import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectValidator validator;

    public List<String> validateAndReturnErrors(StructureInput input) {
        return validator.validate(input);
    }

}
