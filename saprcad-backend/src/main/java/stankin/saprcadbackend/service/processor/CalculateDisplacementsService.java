package stankin.saprcadbackend.service.processor;

import org.ejml.simple.SimpleMatrix;
import org.springframework.stereotype.Service;
import stankin.saprcadbackend.dto.calculate.DisplacementVector;
import stankin.saprcadbackend.dto.structure.Rod;
import stankin.saprcadbackend.dto.structure.StructureInput;


import java.util.ArrayList;
import java.util.List;

@Service
public class CalculateDisplacementsService {

    public DisplacementVector calculateDisplacements(StructureInput input) {
        int n = input.getNodes().size(); // количество узлов = размерность задачи

        // Глобальная матрица жёсткости A (n x n)
        double[][] A = new double[n][n];
        // Вектор нагрузок F (размер n)
        double[] b = new double[n];

        // Этап 1: Сборка A и F от стержней
        for (int i = 0; i < input.getRods().size(); i++) {
            Rod rod = input.getRods().get(i);
            double k = rod.getElasticModulus() * rod.getArea() / rod.getLength(); // жёсткость стержня EA/L

            // Стержень i соединяет узлы i и i+1
            int nodeA = i;
            int nodeB = i + 1;

            // Добавляем в глобальную матрицу жёсткости
            A[nodeA][nodeA] += k;
            A[nodeA][nodeB] -= k;
            A[nodeB][nodeA] -= k;
            A[nodeB][nodeB] += k;

            // Эквивалентные узловые силы от равномерной погонной нагрузки qi:
            // Для стержня: F_A += qi * L / 2, F_B += qi * L / 2
            double equivForce = rod.getDistributedLoad() * rod.getLength() / 2.0;
            b[nodeA] += equivForce;
            b[nodeB] += equivForce;
        }

        // Этап 2: Добавляем сосредоточенные силы Fj
        for (int j = 0; j < input.getNodes().size(); j++) {
            b[j] += input.getNodes().get(j).getExternalForce();
        }

        // Этап 3: Учёт граничных условий (isFixed)
        List<Integer> freeNodes = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if (!input.getNodes().get(i).isFixed()) {
                freeNodes.add(i);
            }
        }

        int m = freeNodes.size();
        if (m == 0) {
            // Все узлы закреплены → все перемещения = 0
            List<Double> zeroDelta = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                zeroDelta.add(0.0);
            }
            return new DisplacementVector(zeroDelta);
        }

        // Формируем сокращённую матрицу A_reduced и вектор F_reduced
        double[][] K_reduced = new double[m][m];
        double[] F_reduced = new double[m];

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < m; j++) {
                K_reduced[i][j] = A[freeNodes.get(i)][freeNodes.get(j)];
            }
            F_reduced[i] = b[freeNodes.get(i)];
        }

        // Этап 4: Решаем A_reduced * ∆_free = F_reduced
        SimpleMatrix Kmat = new SimpleMatrix(K_reduced);
        SimpleMatrix Fvec = new SimpleMatrix(F_reduced.length, 1, true, F_reduced);

        SimpleMatrix deltaFree = Kmat.solve(Fvec); // ∆ для свободных узлов

        // Этап 5: Формируем полный вектор ∆ (с нулями в закреплённых узлах)
        double[] fullDelta = new double[n];
        for (int i = 0; i < n; i++) {
            if (input.getNodes().get(i).isFixed()) {
                fullDelta[i] = 0.0;
            }
        }
        for (int i = 0; i < m; i++) {
            fullDelta[freeNodes.get(i)] = deltaFree.get(i, 0);
        }

        List<Double> deltaList = new ArrayList<>();
        for (double d : fullDelta) deltaList.add(d);

        return new DisplacementVector(deltaList);


    }
}
