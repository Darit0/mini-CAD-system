package stankin.saprcadbackend.service.postprocessor;

import org.springframework.stereotype.Service;
import stankin.saprcadbackend.dto.calculate.DisplacementVector;
import stankin.saprcadbackend.dto.result.FullResult;
import stankin.saprcadbackend.dto.result.PolynomialCoeffs;
import stankin.saprcadbackend.dto.result.ResultOutput;
import stankin.saprcadbackend.dto.structure.Node;
import stankin.saprcadbackend.dto.structure.Rod;
import stankin.saprcadbackend.dto.structure.StructureInput;

import java.util.ArrayList;
import java.util.List;

@Service
public class ResultService {
    public FullResult calculateNds(StructureInput input, DisplacementVector delta) {
        List<Rod> rods = input.getRods();
        List<Node> nodes = input.getNodes();
        List<Double> displacements = delta.getDisplacements();

        List<ResultOutput> rodResults = new ArrayList<>();

        for (int i = 0; i < rods.size(); i++) {
            Rod rod = rods.get(i);
            Node leftNode = nodes.get(i);
            Node rightNode = nodes.get(i + 1);

            double delta0 = displacements.get(i);       // ∆_i
            double delta1 = displacements.get(i + 1);   // ∆_{i+1}

            double L = rod.getLength();
            double A = rod.getArea();
            double E = rod.getElasticModulus();
            double q = rod.getDistributedLoad();

            // Коэффициенты для Nx(x) = a0 + a1 * x
            double a0 = ((E*A)/L)*(delta1 - delta0) + ((q*L)/2);
            double a1 = ((q*L)/2)*(-2/L);

            // Коэффициенты для ux(x) = b0 + b1 * x + b2 * x^2
            double b0 = delta0;
            double b1 = (delta1- delta0)/L + (q*L*L)/(2*E*A*L);
            double b2 = ((q*L*L)/(2*E*A*L)) * (-1/L);

            // Коэффициенты для σx(x) = c0 + c1 * x
            double c0 = a0/A;
            double c1 = a1/A;

            // Максимальное |σx| на стержне: проверяем концы x=0 и x=L, поскольку это прямая в любом случае
            double sigma0 = c0;                  // σ(0)
            double sigmaL = c0 + c1 * L;         // σ(L)
            double maxStress = Math.max(Math.abs(sigma0), Math.abs(sigmaL));

            // Сборка данных в объект
            ResultOutput resultOutput = new ResultOutput();
            resultOutput.setRodId(rod.getId());
            resultOutput.setLength(L);
            resultOutput.setArea(A);
            resultOutput.setElasticModulus(E);
            resultOutput.setAllowableStress(rod.getAllowableStress()); // [σ]i
            resultOutput.setDistributedLoad(q);

            // Узлы, к которым привязан
            resultOutput.setNodeRelatedTo(List.of(leftNode, rightNode));

            // Коэффициенты
            resultOutput.setAxialForceCoeffs(new PolynomialCoeffs(a0, a1));           // линейная функция
            resultOutput.setDisplacementCoeffs(new PolynomialCoeffs(b0, b1, b2));     // квадратичная функция
            resultOutput.setStressCoeffs(new PolynomialCoeffs(c0, c1));               // линейная функция

            resultOutput.setMaxStressOnTheRod(maxStress);

            rodResults.add(resultOutput);
        }

        FullResult full = new FullResult();
        full.setDisplacements(displacements);
        full.setResultOutput(rodResults);
        return full;
    }
}
