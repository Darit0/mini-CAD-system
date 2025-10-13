package stankin.preprocessor.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;


// структура
public class StructureInput {

    @NotEmpty(message = "Список стержней не может быть пустым")
    @Valid
    private List<Rod> rods;

    @NotEmpty(message = "Список узлов не может быть пустым")
    @Valid
    private List<Node> nodes;

    public List<Rod> getRods() {
        return rods;
    }

    public void setRods(List<Rod> rods) {
        this.rods = rods;
    }

    public List<Node> getNodes() {
        return nodes;
    }

    public void setNodes(List<Node> nodes) {
        this.nodes = nodes;
    }

}