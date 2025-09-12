function razonDorada(expr, xl, xu, tol, maxIter, modo) {
    const f = x => math.evaluate(expr, { x });
    const phi = 0.618; // proporción dorada
    let iter = 0;
    let historial = [];

    while (iter < maxIter && Math.abs(xu - xl) > tol) {
        let d = phi * (xu - xl);
        let x1 = xl + d;
        let x2 = xu - d;
        let f1 = f(x1), f2 = f(x2);

        historial.push({
            iter: iter + 1, xl, xu, x1, x2, f1, f2, intervalo: xu - xl
        });

        if (modo === "max") {
            if (f2 > f1) {
                xu = x1;
            } else {
                xl = x2;
            }
        } else { // buscar mínimo
            if (f2 < f1) {
                xu = x1;
            } else {
                xl = x2;
            }
        }

        iter++;
    }

    let x_opt = (xl + xu) / 2;
    let f_opt = f(x_opt);

    return { x_opt, f_opt, historial };
}

function ejecutarRazonDorada() {
    const expr = document.getElementById("funcion").value;
    const xl = parseFloat(document.getElementById("xl").value);
    const xu = parseFloat(document.getElementById("xu").value);
    const tol = parseFloat(document.getElementById("tol").value);
    const modo = document.getElementById("modo").value;

    try {
        const { x_opt, f_opt, historial } = razonDorada(expr, xl, xu, tol, 100, modo);

        // Llenar tabla
        const tbody = document.querySelector("#tabla tbody");
        tbody.innerHTML = "";
        historial.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${row.iter}</td>
            <td>${row.xl.toFixed(6)}</td>
            <td>${row.xu.toFixed(6)}</td>
            <td>${row.x1.toFixed(6)}</td>
            <td>${row.x2.toFixed(6)}</td>
            <td>${row.f1.toExponential(3)}</td>
            <td>${row.f2.toExponential(3)}</td>
            <td>${row.intervalo.toExponential(3)}</td>
          `;
            tbody.appendChild(tr);
        });

        // Gráfica función
        let x_vals = [];
        let y_vals = [];
        for (let x = xl - 1; x <= xu + 1; x += 0.05) {
            x_vals.push(x);
            y_vals.push(math.evaluate(expr, { x }));
        }

        Plotly.newPlot("graficaFuncion", [
            { x: x_vals, y: y_vals, type: "scatter", name: "f(x)" },
            {
                x: [x_opt], y: [f_opt], mode: "markers", marker: { color: "red", size: 10 },
                name: `${modo === "max" ? "Máximo" : "Mínimo"} ≈ (${x_opt.toFixed(4)}, ${f_opt.toFixed(4)})`
            }
        ], { title: `Método de la Razón Dorada (${modo === "max" ? "Máximo" : "Mínimo"})` });

        // Gráfica error
        Plotly.newPlot("graficaError", [
            { x: historial.map(r => r.iter), y: historial.map(r => r.intervalo), mode: "lines+markers", name: "Error" }
        ], { title: "Convergencia del intervalo" });
    } catch (err) {
        alert(err.message);
    }
}