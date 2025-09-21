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
    let convergencia = false;
    let raizEncontrada = null;
    
    for (let i = 0; i < maxIter; i++) {
        let fxi = f(xi);
        let f1xi = f1(xi);
        
        if (Math.abs(f1xi) < 1e-12) { 
            alert("Derivada ≈ 0, el método se detiene"); 
            break; 
        }
        
        let xi1 = xi - fxi / f1xi;
        let err = Math.abs(xi1 - xi);
        
        historial.push({ iter: i + 1, xi, fxi, f1xi, xi1, err });
        
        if (err < tol) { 
            raizEncontrada = xi1;
            convergencia = true;
            break; 
        }
        xi = xi1;
    }
    
    // Si no convergió pero llegó al máximo de iteraciones, tomar el último valor
    if (!convergencia && historial.length > 0) {
        raizEncontrada = historial[historial.length - 1].xi1;
    }
    
    // Mostrar resultado
    mostrarResultado(raizEncontrada, convergencia, historial.length, f, expr);
    
    // Tabla
    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";
    historial.forEach(r => {
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${r.iter}</td>
                       <td>${r.xi.toFixed(6)}</td>
                       <td>${r.fxi.toExponential(3)}</td>
                       <td>${r.f1xi.toExponential(3)}</td>
                       <td${r.xi1.toFixed(6)}</td>
                       <td${r.err.toExponential(3)}</td>`;
        tbody.appendChild(tr);
    });
    
    // Graficar función
    let xs = [], ys = [];
    for (let x = x0 - 5; x <= x0 + 5; x += 0.05) { 
        xs.push(x); 
        ys.push(f(x)); 
    }
    
    Plotly.newPlot("graficaFuncion", [
        { x: xs, y: ys, type: 'scatter', name: 'f(x)' },
        { x: historial.map(h => h.xi1), y: historial.map(h => f(h.xi1)), mode: 'markers', name: 'aproximaciones', marker: {color: 'red', size: 8} }
    ], { title: "Función f(x) y aproximaciones" });
    
    // Gráfica de error
    Plotly.newPlot("graficaError", [
        { x: historial.map(h => h.iter), y: historial.map(h => h.err), mode: 'lines+markers', name: 'Error absoluto' }
    ], { title: "Error por iteración", yaxis: { type: 'log' } });
}

function mostrarResultado(raiz, convergencia, iteraciones, funcionF, expresion) {
    const resultadoDiv = document.getElementById("resultado");
    const textoResultado = document.getElementById("textoResultado");
    const verificacion = document.getElementById("verificacion");
    
    if (raiz !== null) {
        if (convergencia) {
            textoResultado.innerHTML = `<strong>RAÍZ: x = </strong>${raiz.toFixed(8)}<br>
                                       Iteraciones: ${iteraciones}`;
        } else {
            textoResultado.innerHTML = `<strong>RAÍZ: x = ${raiz.toFixed(8)}</strong><br>
                                       Iteraciones: ${iteraciones}`;
        }   
        
        resultadoDiv.style.display = "block";
    } else {
        textoResultado.innerHTML = "<strong>No se pudo encontrar la raíz</strong><br>El método falló.";
        verificacion.innerHTML = "";
        resultadoDiv.style.display = "block";
    }
}