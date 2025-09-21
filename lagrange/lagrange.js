// Función para calcular derivadas y mostrar el sistema
function calcularSistema() {
    const fExpr = document.getElementById("funcObjetivo").value;
    const gExpr = document.getElementById("restriccion").value;

    try {
        // Calcular derivadas parciales
        const fx = math.derivative(fExpr, 'x').toString();
        const fy = math.derivative(fExpr, 'y').toString();
        const gx = math.derivative(gExpr, 'x').toString();
        const gy = math.derivative(gExpr, 'y').toString();

        // Mostrar sistema
        document.getElementById("sistema").innerHTML = `
                    <p><strong>Derivadas de f(x,y):</strong></p>
                    <p>f_x = ${fx}</p>
                    <p>f_y = ${fy}</p>
                    
                    <p><strong>Derivadas de g(x,y):</strong></p>
                    <p>g_x = ${gx}</p>
                    <p>g_y = ${gy}</p>
                    
                    <p><strong>Sistema de ecuaciones:</strong></p>
                    <p>1) ${fx} = λ(${gx})</p>
                    <p>2) ${fy} = λ(${gy})</p>
                    <p>3) ${gExpr} = 0</p>
                `;

        return { fx, fy, gx, gy, fExpr, gExpr };
    } catch (error) {
        document.getElementById("sistema").innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        return null;
    }
}

// Resolver el sistema numéricamente (aproximado)
function resolverLagrange() {
    const derivadas = calcularSistema();
    if (!derivadas) return;

    // Para el problema específico, intentar resolver numéricamente
    const puntosEncontrados = [];

    // Búsqueda por barrido (método rudimentario pero funcional)
    const rangoX = [-5, 5];
    const rangoY = [-5, 5];
    const precision = 0.1;
    const tolerancia = 0.1;

    for (let x = rangoX[0]; x <= rangoX[1]; x += precision) {
        for (let y = rangoY[0]; y <= rangoY[1]; y += precision) {
            try {
                // Evaluar la restricción
                const gVal = math.evaluate(derivadas.gExpr, { x, y });

                if (Math.abs(gVal) < tolerancia) {
                    // Este punto está cerca de satisfacer g(x,y) = 0
                    const fx = math.evaluate(derivadas.fx, { x, y });
                    const fy = math.evaluate(derivadas.fy, { x, y });
                    const gx = math.evaluate(derivadas.gx, { x, y });
                    const gy = math.evaluate(derivadas.gy, { x, y });

                    // Verificar si las condiciones de Lagrange se cumplen aproximadamente
                    if (Math.abs(gx) > 0.01 && Math.abs(gy) > 0.01) {
                        const lambda1 = fx / gx;
                        const lambda2 = fy / gy;

                        if (Math.abs(lambda1 - lambda2) < 0.5) {
                            const fVal = math.evaluate(derivadas.fExpr, { x, y });
                            puntosEncontrados.push({
                                x: x,
                                y: y,
                                lambda: (lambda1 + lambda2) / 2,
                                fVal: fVal,
                                gVal: gVal
                            });
                        }
                    }
                }
            } catch (e) {
                continue;
            }
        }
    }

    // Eliminar puntos duplicados
    const puntosUnicos = [];
    puntosEncontrados.forEach(p1 => {
        let esDuplicado = false;
        puntosUnicos.forEach(p2 => {
            if (Math.abs(p1.x - p2.x) < 0.3 && Math.abs(p1.y - p2.y) < 0.3) {
                esDuplicado = true;
            }
        });
        if (!esDuplicado) {
            puntosUnicos.push(p1);
        }
    });

    mostrarResultados(puntosUnicos);
}

// Resolver manualmente el problema específico
function resolverManual() {
    try {
        // Resolver y = (12x - 19)/32 y sustituir en g(x,y) = 0
        const puntosExactos = [];

        // Resolver 2x² + 4y² - x + 4y = 0 con y = (12x - 19)/32
        // Esto da una ecuación cuadrática en x

        // Implementación numérica para encontrar las raíces
        for (let x = -5; x <= 5; x += 0.001) {
            const y = (12 * x - 19) / 32;
            const g = 2 * x * x + 4 * y * y - x + 4 * y;

            if (Math.abs(g) < 0.001) {
                const f = 4 * x + 3 * y;
                const lambda = 4 / (4 * x - 1);

                puntosExactos.push({
                    x: Math.round(x * 1000) / 1000,
                    y: Math.round(y * 1000) / 1000,
                    lambda: Math.round(lambda * 1000) / 1000,
                    fVal: Math.round(f * 1000) / 1000,
                    gVal: Math.round(g * 1000000) / 1000000
                });
            }
        }

        // Eliminar duplicados
        const puntosUnicos = [];
        puntosExactos.forEach(p1 => {
            let esDuplicado = false;
            puntosUnicos.forEach(p2 => {
                if (Math.abs(p1.x - p2.x) < 0.01 && Math.abs(p1.y - p2.y) < 0.01) {
                    esDuplicado = true;
                }
            });
            if (!esDuplicado) {
                puntosUnicos.push(p1);
            }
        });

        mostrarResultados(puntosUnicos, true);

    } catch (error) {
        alert("Error en resolución manual: " + error.message);
    }
}

// Mostrar resultados
function mostrarResultados(puntos, esManual = false) {
    const resultadoDiv = document.getElementById("resultado");
    const puntosDiv = document.getElementById("puntosCriticos");

    if (puntos.length === 0) {
        puntosDiv.innerHTML = "<p>❌ No se encontraron puntos críticos con el método utilizado.</p>";
    } else {
        let html = `<p><strong>${esManual ? '🎯 Solución Manual:' : '🔍 Búsqueda Numérica:'}</strong> Se encontraron ${puntos.length} punto(s) crítico(s):</p>`;

        puntos.forEach((punto, i) => {
            html += `
                        <div style="background-color: white; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007acc;">
                            <h4>Punto ${i + 1}:</h4>
                            <p><strong>Coordenadas:</strong> (${punto.x.toFixed(6)}, ${punto.y.toFixed(6)})</p>
                            <p><strong>Valor de f(x,y):</strong> ${punto.fVal.toFixed(6)}</p>
                            <p><strong>Multiplicador λ:</strong> ${punto.lambda.toFixed(6)}</p>
                            <p><strong>Verificación g(x,y):</strong> ${punto.gVal.toFixed(8)} ≈ 0</p>
                        </div>
                    `;
        });

        puntosDiv.innerHTML = html;
    }

    resultadoDiv.style.display = "block";

    // Graficar automáticamente los puntos encontrados
    graficar(puntos);
}

// Función de graficación
function graficar(puntosDestacados = []) {
    const fExpr = document.getElementById("funcObjetivo").value;
    const gExpr = document.getElementById("restriccion").value;
    const rangoXStr = document.getElementById("rangoX").value.split(',');
    const rangoYStr = document.getElementById("rangoY").value.split(',');

    const xMin = parseFloat(rangoXStr[0]);
    const xMax = parseFloat(rangoXStr[1]);
    const yMin = parseFloat(rangoYStr[0]);
    const yMax = parseFloat(rangoYStr[1]);

    try {
        // Crear malla para gráficas
        const resolution = 100;
        const x = [];
        const y = [];
        const z = [];
        const gContour = [];

        for (let i = 0; i <= resolution; i++) {
            const xi = xMin + (xMax - xMin) * i / resolution;
            x.push(xi);

            const zRow = [];
            const gRow = [];
            const yRow = [];

            for (let j = 0; j <= resolution; j++) {
                const yj = yMin + (yMax - yMin) * j / resolution;
                if (i === 0) y.push(yj);
                yRow.push(yj);

                try {
                    const fVal = math.evaluate(fExpr, { x: xi, y: yj });
                    const gVal = math.evaluate(gExpr, { x: xi, y: yj });
                    zRow.push(fVal);
                    gRow.push(gVal);
                } catch (e) {
                    zRow.push(null);
                    gRow.push(null);
                }
            }
            z.push(zRow);
            gContour.push(gRow);
        }

        // Gráfica 2D con curvas de nivel y restricción
        const traces2D = [
            {
                z: z,
                x: x,
                y: y,
                type: 'contour',
                name: 'f(x,y)',
                colorscale: 'Viridis',
                contours: {
                    showlabels: true
                }
            },
            {
                z: gContour,
                x: x,
                y: y,
                type: 'contour',
                name: 'g(x,y) = 0',
                showscale: false,
                contours: {
                    start: 0,
                    end: 0,
                    size: 1,
                    coloring: 'lines'
                },
                line: { color: 'red', width: 3 }
            }
        ];

        // Agregar puntos críticos si los hay
        if (puntosDestacados.length > 0) {
            traces2D.push({
                x: puntosDestacados.map(p => p.x),
                y: puntosDestacados.map(p => p.y),
                mode: 'markers',
                name: 'Puntos Críticos',
                marker: {
                    color: 'orange',
                    size: 12,
                    symbol: 'star'
                }
            });
        }

        Plotly.newPlot("grafica2D", traces2D, {
            title: "Curvas de Nivel de f(x,y) y Restricción g(x,y)=0",
            xaxis: { title: 'x' },
            yaxis: { title: 'y' }
        });

        // Gráfica 3D
        const trace3D = {
            z: z,
            x: x,
            y: y,
            type: 'surface',
            name: 'f(x,y)',
            colorscale: 'Viridis'
        };

        const traces3D = [trace3D];

        // Agregar puntos críticos en 3D
        if (puntosDestacados.length > 0) {
            traces3D.push({
                x: puntosDestacados.map(p => p.x),
                y: puntosDestacados.map(p => p.y),
                z: puntosDestacados.map(p => p.fVal),
                mode: 'markers',
                type: 'scatter3d',
                name: 'Puntos Críticos',
                marker: {
                    color: 'red',
                    size: 8
                }
            });
        }

        Plotly.newPlot("grafica3D", traces3D, {
            title: "Superficie f(x,y) = 4x + 3y",
            scene: {
                xaxis: { title: 'x' },
                yaxis: { title: 'y' },
                zaxis: { title: 'f(x,y)' }
            }
        });

    } catch (error) {
        alert("Error al graficar: " + error.message);
    }
}

// Inicializar al cargar la página
window.onload = function () {
    calcularSistema();
};