function runNR() {
    const expr = document.getElementById("func").value;
    const x0 = parseFloat(document.getElementById("x0").value);
    const tol = parseFloat(document.getElementById("tol").value);
    const maxIter = parseInt(document.getElementById("maxIter").value);

    let f = x => math.evaluate(expr, { x });
    let df = math.derivative(expr, 'x').toString();
    let f1 = x => math.evaluate(df, { x });

    let xi = x0;
    let historial = [];

    for (let i = 0; i < maxIter; i++) {
        let fxi = f(xi);
        let f1xi = f1(xi);
        if (Math.abs(f1xi) < 1e-12) { alert("Derivada ~0, se detiene"); break; }
        let xi1 = xi - fxi / f1xi;
        let err = Math.abs(xi1 - xi);

        historial.push({ iter: i + 1, xi, fxi, f1xi, xi1, err });
        if (err < tol) { xi = xi1; break; }
        xi = xi1;
    }

    // Tabla
    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";
    historial.forEach(r => {
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${r.iter}</td><td>${r.xi.toFixed(6)}</td><td>${r.fxi.toExponential(3)}</td>
                  <td>${r.f1xi.toExponential(3)}</td><td>${r.xi1.toFixed(6)}</td>
                  <td>${r.err.toExponential(3)}</td>`;
        tbody.appendChild(tr);
    });

    // Graficar función
    let xs = [], ys = [];
    for (let x = x0 - 5; x <= x0 + 5; x += 0.05) { xs.push(x); ys.push(f(x)); }
    Plotly.newPlot("graficaFuncion", [
        { x: xs, y: ys, type: 'scatter', name: 'f(x)' },
        { x: historial.map(h => h.xi1), y: historial.map(h => f(h.xi1)), mode: 'markers', name: 'aprox' }
    ], { title: "f(x)" });

    // Error
    Plotly.newPlot("graficaError", [
        { x: historial.map(h => h.iter), y: historial.map(h => h.err), mode: 'lines+markers' }
    ], { title: "Error por iteración" });
}