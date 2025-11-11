package stankin.saprcadbackend.dto.calculate;

import java.util.List;

public class DisplacementVector {
    private List<Double> displacements; // ∆ — перемещения узлов

    public DisplacementVector() {}

    public DisplacementVector(List<Double> displacements) {
        this.displacements = displacements;
    }

    public List<Double> getDisplacements() {
        return displacements;
    }

    public void setDisplacements(List<Double> displacements) {
        this.displacements = displacements;
    }
}