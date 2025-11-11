package stankin.saprcadbackend.dto.result;

import java.util.List;

// DTO оболочка для вывода конечных расчетов "Фасад" данных
public class FullResult {
    private List<Double> displacements;   // вектор ∆ из процессора
    private List<ResultOutput> resultOutput; // по одному на стержень

    public FullResult() {}

    public FullResult(List<Double> displacements, List<ResultOutput> resultOutput) {
        this.displacements = displacements;
        this.resultOutput = resultOutput;
    }

    public List<Double> getDisplacements() {
        return displacements;
    }

    public void setDisplacements(List<Double> displacements) {
        this.displacements = displacements;
    }

    public List<ResultOutput> getResultOutput() {
        return resultOutput;
    }

    public void setResultOutput(List<ResultOutput> resultOutput) {
        this.resultOutput = resultOutput;
    }
}
