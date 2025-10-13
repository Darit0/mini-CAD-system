package stankin.preprocessor.dto;

// стержень
public class Rod {

    private int id;             //  номер стержня
    private double length;      // Li длина стержня >0
    private double area;        // Ai площадь поперечного сечения >0
    private double elasticModulus; // Ei модуль упругости >0
    private double allowableStress; // [σ]i  допускаемое напряжение >0
    private double distributedLoad; // qi распределенная нагрузка ( < 0 сжатие, > 0 растяжение, = 0 отсутствует)


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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
}
