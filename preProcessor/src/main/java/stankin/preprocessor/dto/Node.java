package stankin.preprocessor.dto;

// узел
public class Node {

    private int id; // номер узла
    private boolean isFixed; // жесткая опора (= true есть запрещает перемещение, = false отсутствует)
    private double externalForce; // F_j сосредоточенная нагрузка ( < 0 сжатие, > 0 растяжение, = 0 отсутствует)

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public boolean isFixed() {
        return isFixed;
    }

    public void setFixed(boolean fixed) {
        isFixed = fixed;
    }

    public double getExternalForce() {
        return externalForce;
    }

    public void setExternalForce(double externalForce) {
        this.externalForce = externalForce;
    }


}