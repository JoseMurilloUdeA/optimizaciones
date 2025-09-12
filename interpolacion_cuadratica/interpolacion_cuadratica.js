function safeEvalF(expr) {
    // devolvemos una función f(x) que usa math.evaluate
    // permitimos funciones trig y constants de math.js (sin, cos, etc.)
    return function (x) {
        // math.js espera radianes en sin/cos; así está en tu ejemplo.
        return Number(math.evaluate(expr, { x: x }));
    };
}

function formulaX3(f0, f1, f2, x0, x1, x2) {
    // Implementa la fórmula:
    // x3 = [f0*(x1^2 - x2^2) + f1*(x2^2 - x0^2) + f2*(x0^2 - x1^2)] /
    //      [2*f0*(x1 - x2) + 2*f1*(x2 - x0) + 2*f2*(x0 - x1)]
    const num = f0 * (x1 * x1 - x2 * x2) + f1 * (x2 * x2 - x0 * x0) + f2 * (x0 * x0 - x1 * x1);
    const den = 2 * (f0 * (x1 - x2) + f1 * (x2 - x0) + f2 * (x0 - x1));
    return { num, den, x3: num / den };
}

function runInterpolation() {
    const expr = document.getElementById("func").value.trim();
    const x0_init = parseFloat(document.getElementById("x0").value);
    const x1_init = parseFloat(document.getElementById("x1").value);
    const x2_init = parseFloat(document.getElementById("x2").value);
    const tol = Math.abs(parseFloat(document.getElementById("tol").value));
    const maxIter = parseInt(document.getElementById("maxIter").value, 10) || 50;
    const modo = document.getElementById("modo").value; // "max" o "min"

    let f;
    try {
        f = safeEvalF(expr);
        // test eval
        const _ = f(x1_init);
        if (!isFinite(_)) throw new Error("f(x1) no es finita");
    } catch (e) {
        alert("Error al evaluar la función. Revisa la expresión. Ej: 2*sin(x) - x^2/10");
        return;
    }

    // inicializar
    let x0 = x0_init, x1 = x1_init, x2 = x2_init;
    const historial = [];
    let iter = 0;
    let prev_x3 = null;

    // verificar que los 3 puntos no sean iguales
    if (x0 === x1 || x1 === x2 || x0 === x2) {
        alert("x0, x1 y x2 deben ser distintos.");
        return;
    }

    while (iter < maxIter) {
        const f0 = f(x0), f1 = f(x1), f2 = f(x2);
        const { num, den, x3 } = formulaX3(f0, f1, f2, x0, x1, x2);

        // si denominador cercano a 0 -> detener
        if (!isFinite(x3) || Math.abs(den) < 1e-14) {
            alert("Denominador cercano a cero en la fórmula (parada para evitar división por cero).");
            break;
        }

        const f3 = f(x3);
        const error = prev_x3 === null ? Math.abs(x3 - x1) : Math.abs(x3 - prev_x3);

        historial.push({
            iter: iter + 1,
            x0, x1, x2, x3,
            f0, f1, f2, f3,
            error: Math.abs(x3 - x1)
        });

        // Criterio de parada (usado en la UI): |x3 - x1| < tol
        if (Math.abs(x3 - x1) < tol) {
            prev_x3 = x3;
            iter++;
            break;
        }

        // Actualización de puntos:
        // Para máximo: si f3 > f1 --> descartamos extremo opuesto a x3 (si x3>x1 descartamos x0, si x3<x1 descartamos x2) y ponemos x1=x3.
        // Si f3 <= f1 --> descartamos x3 (equivalente a mover el extremo mas cercano a x3 a x3?),
        // Implementación práctica (comportamiento robusto):
        if (modo === "max") {
            if (f3 > f1) {
                // x3 mejor que x1
                if (x3 > x1) {
                    x0 = x1;
                } else {
                    x2 = x1;
                }
                x1 = x3;
            } else {
                // x3 no mejor: reemplazamos el extremo más cercano a x3 por x3
                if (x3 > x1) {
                    x2 = x3;
                } else {
                    x0 = x3;
                }
            }
        } else { // modo = min
            if (f3 < f1) {
                if (x3 > x1) {
                    x0 = x1;
                } else {
                    x2 = x1;
                }
                x1 = x3;
            } else {
                if (x3 > x1) {
                    x2 = x3;
                } else {
                    x0 = x3;
                }
            }
        }

        prev_x3 = x3;
        iter++;
    }

    // Mostrar tabla
    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";
    historial.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${row.iter}</td>
      <td>${row.x0.toFixed(6)}</td>
      <td>${row.x1.toFixed(6)}</td>
      <td>${row.x2.toFixed(6)}</td>
      <td>${row.x3.toFixed(6)}</td>
      <td>${Number(row.f0).toExponential(4)}</td>
      <td>${Number(row.f1).toExponential(4)}</td>
      <td>${Number(row.f2).toExponential(4)}</td>
      <td>${Number(row.f3).toExponential(4)}</td>
      <td>${row.error !== null ? Number(row.error).toExponential(4) : '-'}</td>
    `;
        tbody.appendChild(tr);
    });

    // Resultado final:
    const last = historial[historial.length - 1] || null;
    if (last) {
        const resumen = document.createElement("div");
        resumen.style.marginTop = "10px";
        resumen.innerHTML = `<strong>Resultado aproximado:</strong> x ≈ ${last.x3.toFixed(6)}, f(x) ≈ ${Number(last.f3).toFixed(6)} (iter ${last.iter})`;
        // eliminar resumen viejo si existe
        const old = document.getElementById("resumenInterp");
        if (old) old.remove();
        resumen.id = "resumenInterp";
        document.getElementById("controles").appendChild(resumen);
    }

    // Graficar función (rango centrado en los puntos iniciales/actuales)
    try {
        // definir rango
        let xs = historial.length ? historial.map(h => [h.x0, h.x1, h.x2, h.x3]).flat() : [x0_init, x1_init, x2_init];
        const xmin = Math.min(...xs) - 1;
        const xmax = Math.max(...xs) + 1;
        const x_vals = [];
        const y_vals = [];
        const step = (xmax - xmin) / 800;
        for (let xv = xmin; xv <= xmax; xv += Math.max(step, 1e-3)) {
            x_vals.push(xv);
            y_vals.push(Number(f(xv)));
        }

        const markersX = historial.length ? historial.map(h => h.x3) : [];
        const markersY = historial.length ? historial.map(h => h.f3) : [];

        Plotly.newPlot("graficaFuncion", [
            { x: x_vals, y: y_vals, type: 'scatter', name: 'f(x)' },
            { x: markersX, y: markersY, mode: 'markers', marker: { size: 8 }, name: 'x3 por iter' }
        ], { title: 'f(x) y puntos x3 obtenidos', xaxis: { title: 'x' }, yaxis: { title: 'f(x)' } });
    } catch (e) {
        console.warn("Error graficando función:", e);
    }

    // Graficar error
    try {
        Plotly.newPlot("graficaError", [
            { x: historial.map(h => h.iter), y: historial.map(h => h.error), mode: 'lines+markers', name: '|x3-x1|' }
        ], { title: 'Convergencia del error', xaxis: { title: 'Iter' }, yaxis: { title: '|x3 - x1|' } });
    } catch (e) {
        console.warn("Error graficando error:", e);
    }
}

function resetTable() {
    document.querySelector("#tabla tbody").innerHTML = "";
    const old = document.getElementById("resumenInterp");
    if (old) old.remove();
    Plotly.purge("graficaFuncion");
    Plotly.purge("graficaError");
}