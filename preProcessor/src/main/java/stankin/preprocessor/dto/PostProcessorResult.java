package stankin.preprocessor.dto;

import java.util.List;

public class PostProcessorResult {
    private List<Double> axialForces;       // N(x)
    private List<Double> normalStresses;    // σ(x)
    private List<Double> displacements;     // u(x)
    private List<Double> xCoordinates;      // локальные координаты по длине конструкции
}