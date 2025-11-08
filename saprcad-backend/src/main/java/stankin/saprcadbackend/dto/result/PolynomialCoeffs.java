package stankin.saprcadbackend.dto.result;

//универсальный класс для коэффициентов уравнений
public class PolynomialCoeffs {
    private double a0;
    private Double a1; // null, если нет, благодаря обертке Double
    private Double a2; // null, если нет

    public PolynomialCoeffs(double a0, double a1) {
        this.a0 = a0; this.a1 = a1;
    }
    public PolynomialCoeffs(double a0, double a1, double a2) {
        this.a0 = a0; this.a1 = a1; this.a2 = a2;
    }

    public double getA0() {
        return a0;
    }

    public void setA0(double a0) {
        this.a0 = a0;
    }

    public Double getA1() {
        return a1;
    }

    public void setA1(Double a1) {
        this.a1 = a1;
    }

    public Double getA2() {
        return a2;
    }

    public void setA2(Double a2) {
        this.a2 = a2;
    }
}