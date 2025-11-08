package stankin.saprcadbackend.dto.result;

import stankin.saprcadbackend.dto.structure.Node;

import java.util.List;

public class ResultOutput {
    private int rodId;
    private double length;
    private double area;
    private double elasticModulus;
    private double allowableStress;   // [σ]i — скаляр, из входных данных
    private double distributedLoad;   // qi

    private List<Node> nodeRelatedTo; // два узла (левый и правый)

    // Коэффициенты уравнений для создания эпюр
    private PolynomialCoeffs axialForceCoeffs;      // Nx(x) = a0 + a1*x
    private PolynomialCoeffs displacementCoeffs;    // Ux(x) = b0 + b1*x + b2*x²
    private PolynomialCoeffs stressCoeffs;          // σx(x) = c0 + c1*x

    private double maxStressOnTheRod;  // max |σx(x)| на стержне

    public PolynomialCoeffs getAxialForceCoeffs() {
        return axialForceCoeffs;
    }

    public void setAxialForceCoeffs(PolynomialCoeffs axialForceCoeffs) {
        this.axialForceCoeffs = axialForceCoeffs;
    }

    public PolynomialCoeffs getDisplacementCoeffs() {
        return displacementCoeffs;
    }

    public void setDisplacementCoeffs(PolynomialCoeffs displacementCoeffs) {
        this.displacementCoeffs = displacementCoeffs;
    }

    public PolynomialCoeffs getStressCoeffs() {
        return stressCoeffs;
    }

    public void setStressCoeffs(PolynomialCoeffs stressCoeffs) {
        this.stressCoeffs = stressCoeffs;
    }

    public int getRodId() {
        return rodId;
    }

    public void setRodId(int rodId) {
        this.rodId = rodId;
    }

    public double getLength() {
        return length;
    }

    public void setLength(double length) {
        this.length = length;
    }

    public double getArea() {
        return area;
    }

    public void setArea(double area) {
        this.area = area;
    }

    public double getElasticModulus() {
        return elasticModulus;
    }

    public void setElasticModulus(double elasticModulus) {
        this.elasticModulus = elasticModulus;
    }

    public double getAllowableStress() {
        return allowableStress;
    }

    public void setAllowableStress(double allowableStress) {
        this.allowableStress = allowableStress;
    }

    public double getDistributedLoad() {
        return distributedLoad;
    }

    public void setDistributedLoad(double distributedLoad) {
        this.distributedLoad = distributedLoad;
    }

    public List<Node> getNodeRelatedTo() {
        return nodeRelatedTo;
    }

    public void setNodeRelatedTo(List<Node> nodeRelatedTo) {
        this.nodeRelatedTo = nodeRelatedTo;
    }

    public double getMaxStressOnTheRod() {
        return maxStressOnTheRod;
    }

    public void setMaxStressOnTheRod(double maxStressOnTheRod) {
        this.maxStressOnTheRod = maxStressOnTheRod;
    }


}
