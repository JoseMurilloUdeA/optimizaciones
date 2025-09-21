function runNewton() {
    const expr = document.getElementById("func").value;
    const x0 = parseFloat(document.getElementById("x0").value);
    const tol = parseFloat(document.getElementById("tol").value);
    const maxIter = parseInt(document.getElementById("maxIter").value);
    const modo = document.getElementById("modo").value;
    
    let f = x => math.evaluate(expr, { x });
    let f1expr = math.derivative(expr, 'x').toString();
    let f2expr = math.derivative(f1expr, 'x').toString();
    let f1 = x => math.evaluate(f1expr, { x });
    let f2 = x => math.evaluate(f2expr, { x });
    
    let xi = x0;
    let historial = [];
    let convergencia = false;
    let valorOptimo = null;
    
    for (let i = 0; i < maxIter; i++) {
        let f1xi = f1(xi);
        let f2xi = f2(xi);
        
        if (Math.abs(f2xi) < 1e-12) { 
            alert("f''(x) ≈ 0, el método se detiene"); 
            break; 
        }
        
        let xi1 = xi - f1xi / f2xi;
        let err = Math.abs(xi1 - xi);
        
        historial.push({ iter: i + 1, xi, f1xi, f2xi, xi1, err });
        
        if (err < tol) { 
            valorOptimo = xi1;
            convergencia = true;
            break; 
        }
        xi = xi1;
    }
    
    // Si no convergió pero llegó al máximo de iteraciones, tomar el último valor
    if (!convergencia && historial.length > 0) {
        valorOptimo = historial[historial.length - 1].xi1;
    }
    
    // Mostrar resultado
    mostrarResultado(valorOptimo, convergencia, historial.length, f, f1, f2, expr, f1expr, f2expr, modo);
    
    // Tabla
    const tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";
    historial.forEach(r => {
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${r.iter}</td>
                       <td>${r.xi.toFixed(6)}</td>
                       <td>${r.f1xi.toExponential(3)}</td>
                       <td>${r.f2xi.toExponential(3)}</td>
                       <td>${r.xi1.toFixed(6)}</td>
                       <td>${r.err.toExponential(3)}</td>`;
        tbody.appendChild(tr);
    });
    
    // Graficar función
    let xs = [], ys = [];
    for (let x = x0 - 5; x <= x0 + 5; x += 0.05) { 
        xs.push(x); 
        ys.push(f(x)); 
    }
    
    let puntosOptimos = historial.map(h => ({ x: h.xi1, y: f(h.xi1) }));
    
    Plotly.newPlot("graficaFuncion", [
        { x: xs, y: ys, type: 'scatter', name: 'f(x)' },
        { x: puntosOptimos.map(p => p.x), y: puntosOptimos.map(p => p.y), mode: 'markers', name: 'aproximaciones', marker: {color: 'red', size: 8} }
    ], { title: "Función f(x) y aproximaciones del óptimo" });
    
    // Gráfica de error
    Plotly.newPlot("graficaError", [
        { x: historial.map(h => h.iter), y: historial.map(h => h.err), mode: 'lines+markers', name: 'Error absoluto' }
    ], { title: "Error por iteración", yaxis: { type: 'log' } });
}

function mostrarResultado(valorOptimo, convergencia, iteraciones, funcionF, funcionF1, funcionF2, expresion, expr1, expr2, modo) {
    const resultadoDiv = document.getElementById("resultado");
    const textoResultado = document.getElementById("textoResultado");
    const verificacion = document.getElementById("verificacion");
    const tipoOptimo = document.getElementById("tipoOptimo");
    
    if (valorOptimo !== null) {
        let valorFuncion = funcionF(valorOptimo);
        let derivada1 = funcionF1(valorOptimo);
        let derivada2 = funcionF2(valorOptimo);
        
        if (convergencia) {
            textoResultado.innerHTML = `<strong>VALOR ÓPTIMO: x* = ${valorOptimo.toFixed(8)}</strong><br>
                                       <strong>Valor de la función: f(x*) = ${valorFuncion.toFixed(8)}</strong><br>
                                       Convergencia alcanzada en ${iteraciones} iteraciones.`;
        } else {
            textoResultado.innerHTML = `<strong>APROXIMACIÓN DEL ÓPTIMO: x* = ${valorOptimo.toFixed(8)}</strong><br>
                                       <strong>Valor de la función: f(x*) = ${valorFuncion.toFixed(8)}</strong><br>
                                       No se alcanzó la convergencia en ${iteraciones} iteraciones.`;
        }
        
        verificacion.innerHTML = `<strong>Verificación de condiciones:</strong><br>
                                 f'(${valorOptimo.toFixed(6)}) = ${derivada1.toExponential(6)} ≈ 0<br>
                                 f''(${valorOptimo.toFixed(6)}) = ${derivada2.toFixed(6)}<br>
                                 <strong>Función:</strong> f(x) = ${expresion}`;
        
        // Determinar tipo de óptimo basado en la segunda derivada
        let tipoTexto = "";
        if (derivada2 > 0) {
            tipoTexto = "<strong>MÍNIMO LOCAL</strong> (f''(x*) > 0)";
        } else if (derivada2 < 0) {
            tipoTexto = "<strong>MÁXIMO LOCAL</strong> (f''(x*) < 0)";
        } else {
            tipoTexto = "<strong>PUNTO DE INFLEXIÓN</strong> (f''(x*) = 0) - Se requiere análisis adicional";
        }
        
        // Verificar si el resultado coincide con lo solicitado
        if ((modo === "max" && derivada2 < 0) || (modo === "min" && derivada2 > 0)) {
            tipoTexto += " (Coincide con lo solicitado)";
        } else if ((modo === "max" && derivada2 > 0) || (modo === "min" && derivada2 < 0)) {
            tipoTexto += " (No coincide con lo solicitado - prueba otro valor inicial)";
        }
        
        tipoOptimo.innerHTML = tipoTexto;
        
        resultadoDiv.style.display = "block";
    } else {
        textoResultado.innerHTML = "<strong>No se pudo encontrar el valor óptimo</strong><br>El método falló.";
        verificacion.innerHTML = "";
        tipoOptimo.innerHTML = "";
        resultadoDiv.style.display = "block";
    }
}