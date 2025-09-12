function falsaPosicion(expr, a, b, tol) {
    const f = x => math.evaluate(expr, { x });
    if (f(a) * f(b) > 0) {
        throw new Error("El intervalo no encierra una raíz (f(a) y f(b) tienen el mismo signo).");
    }

    let historial = [];
    let iter = 0;
    let xrAnterior = null;

    while (true) {
        // Fórmula de la falsa posición
        let xr = b - (f(b) * (a - b)) / (f(a) - f(b));
        let fa = f(a), fb = f(b), fr = f(xr);
        let error = xrAnterior === null ? null : Math.abs(xr - xrAnterior);
        iter++;

        historial.push({
            iter, a, b, xr, fa, fb, fr, producto: fa * fr, error
        });

        if (error !== null && error < tol) break;

        if (fa * fr < 0) {
            b = xr;
        } else {
            a = xr;
        }
        xrAnterior = xr;
    }

    return { raiz: historial[historial.length - 1].xr, iteraciones: iter, historial };
}

function ejecutarFalsaPosicion() {
    const expr = document.getElementById("funcion").value;
    const a = parseFloat(document.getElementById("a").value);
    const b = parseFloat(document.getElementById("b").value);
    const tol = parseFloat(document.getElementById("tol").value);

    try {
        const { raiz, historial } = falsaPosicion(expr, a, b, tol);

        // Llenar tabla
        const tbody = document.querySelector("#tabla tbody");
        tbody.innerHTML = "";
        historial.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${row.iter}</td>
            <td>${row.a.toFixed(6)}</td>
            <td>${row.b.toFixed(6)}</td>
            <td>${row.xr.toFixed(6)}</td>
            <td>${row.fa.toExponential(3)}</td>
            <td>${row.fb.toExponential(3)}</td>
            <td>${row.fr.toExponential(3)}</td>
            <td>${row.producto.toExponential(3)}</td>
            <td>${row.error !== null ? row.error.toExponential(3) : "-"}</td>
          `;
            tbody.appendChild(tr);
        });

        // Gráfica función
        let x_vals = [];
        let y_vals = [];
        for (let x = a - 10; x <= b + 10; x += 0.1) {
            x_vals.push(x);
            y_vals.push(math.evaluate(expr, { x }));
        }

        Plotly.newPlot("graficaFuncion", [
            { x: x_vals, y: y_vals, type: "scatter", name: "f(x)" },
            { x: [raiz], y: [0], mode: "markers", marker: { color: "red", size: 10 }, name: `Raíz ≈ ${raiz.toFixed(4)}` }
        ], { title: "Método de la Falsa Posición" });

        // Gráfica error
        Plotly.newPlot("graficaError", [
            { x: historial.map(r => r.iter), y: historial.map(r => r.error), mode: "lines+markers", name: "Error" }
        ], { title: "Convergencia del error" });
    } catch (err) {
        alert(err.message);
    }
}