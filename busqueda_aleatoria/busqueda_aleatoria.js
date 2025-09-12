let datosTabla = [];
let mejorValor = null;
let mejorX = null;
let mejorY = null;
let historialMejor = [];
let historialError = [];

function evaluarFuncion(expresion, x, y) {
    try {
        // Reemplazar variables en la expresión
        let expr = expresion.replace(/x/g, `(${x})`);
        expr = expr.replace(/y/g, `(${y})`);

        // Reemplazar operadores matemáticos
        expr = expr.replace(/\^/g, '**');
        expr = expr.replace(/sin/g, 'Math.sin');
        expr = expr.replace(/cos/g, 'Math.cos');
        expr = expr.replace(/tan/g, 'Math.tan');
        expr = expr.replace(/log/g, 'Math.log');
        expr = expr.replace(/exp/g, 'Math.exp');
        expr = expr.replace(/sqrt/g, 'Math.sqrt');

        return eval(expr);
    } catch (error) {
        throw new Error('Error en la evaluación de la función: ' + error.message);
    }
}

function generarNumeroAleatorio() {
    return Math.random();
}

function ejecutarBusquedaAleatoria() {
    try {
        // Obtener parámetros
        const funcion = document.getElementById('funcion').value;
        const xl = parseFloat(document.getElementById('xl').value);
        const xu = parseFloat(document.getElementById('xu').value);
        const yl = parseFloat(document.getElementById('yl').value);
        const yu = parseFloat(document.getElementById('yu').value);
        const iteraciones = parseInt(document.getElementById('iteraciones').value);
        const tipoOpt = document.getElementById('tipoOptimizacion').value;

        // Limpiar datos anteriores
        datosTabla = [];
        mejorValor = tipoOpt === 'max' ? -Infinity : Infinity;
        mejorX = null;
        mejorY = null;
        historialMejor = [];
        historialError = [];

        // Ejecutar búsqueda aleatoria
        for (let i = 1; i <= iteraciones; i++) {
            // Generar números aleatorios
            const rx = generarNumeroAleatorio();
            const ry = generarNumeroAleatorio();

            // Calcular x e y usando las fórmulas
            const x = xl + (xu - xl) * rx;
            const y = yl + (yu - yl) * ry;

            // Evaluar función
            const fx = evaluarFuncion(funcion, x, y);

            // Verificar si es mejor
            let esMejor = false;
            if (tipoOpt === 'max' && fx > mejorValor) {
                mejorValor = fx;
                mejorX = x;
                mejorY = y;
                esMejor = true;
            } else if (tipoOpt === 'min' && fx < mejorValor) {
                mejorValor = fx;
                mejorX = x;
                mejorY = y;
                esMejor = true;
            }

            // Calcular error relativo
            let errorRelativo = 0;
            if (i > 1) {
                const valorAnterior = historialMejor[historialMejor.length - 1];
                if (Math.abs(mejorValor) > 1e-10) {
                    errorRelativo = Math.abs((mejorValor - valorAnterior) / mejorValor) * 100;
                }
            }

            // Guardar datos
            datosTabla.push({
                i: i,
                x: x,
                y: y,
                fx: fx,
                mejor: mejorValor,
                error: errorRelativo,
                esMejor: esMejor
            });

            historialMejor.push(mejorValor);
            historialError.push(errorRelativo);
        }

        mostrarResultados();

    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function mostrarResultados() {
    // Mostrar resumen
    const tipoOpt = document.getElementById('tipoOptimizacion').value;
    const resumen = document.getElementById('resumen');
    resumen.innerHTML = `
                <p><strong>${tipoOpt === 'max' ? 'Máximo' : 'Mínimo'} encontrado:</strong></p>
                <p>f(${mejorX.toFixed(6)}, ${mejorY.toFixed(6)}) = ${mejorValor.toFixed(6)}</p>
                <p>x = ${mejorX.toFixed(6)}</p>
                <p>y = ${mejorY.toFixed(6)}</p>
            `;

    // Llenar tabla (últimas 20 iteraciones)
    const tbody = document.getElementById('tabla-body');
    tbody.innerHTML = '';
    const ultimasDatos = datosTabla.slice(-20);

    ultimasDatos.forEach(dato => {
        const row = tbody.insertRow();
        row.style.backgroundColor = dato.esMejor ? '#e6ffe6' : '';

        row.insertCell().textContent = dato.i;
        row.insertCell().textContent = dato.x.toFixed(6);
        row.insertCell().textContent = dato.y.toFixed(6);
        row.insertCell().textContent = dato.fx.toFixed(6);
        row.insertCell().textContent = dato.mejor.toFixed(6);
        row.insertCell().textContent = dato.error.toFixed(4);
    });

    // Crear gráficas
    crearGraficaFuncion();
    crearGraficaError();

    // Mostrar resultados
    document.getElementById('resultados').style.display = 'block';
}

function crearGraficaFuncion() {
    const funcion = document.getElementById('funcion').value;
    const xl = parseFloat(document.getElementById('xl').value);
    const xu = parseFloat(document.getElementById('xu').value);
    const yl = parseFloat(document.getElementById('yl').value);
    const yu = parseFloat(document.getElementById('yu').value);

    // Crear malla para la superficie
    const xVals = [];
    const yVals = [];
    const zVals = [];

    const steps = 50;
    const dx = (xu - xl) / steps;
    const dy = (yu - yl) / steps;

    for (let i = 0; i <= steps; i++) {
        xVals.push(xl + i * dx);
        yVals.push(yl + i * dy);
    }

    for (let i = 0; i <= steps; i++) {
        const row = [];
        for (let j = 0; j <= steps; j++) {
            try {
                const z = evaluarFuncion(funcion, xVals[j], yVals[i]);
                row.push(z);
            } catch (e) {
                row.push(0);
            }
        }
        zVals.push(row);
    }

    // Superficie de la función
    const superficie = {
        x: xVals,
        y: yVals,
        z: zVals,
        type: 'surface',
        name: 'f(x,y)',
        colorscale: 'Viridis'
    };

    // Punto óptimo
    const puntoOptimo = {
        x: [mejorX],
        y: [mejorY],
        z: [mejorValor],
        mode: 'markers',
        type: 'scatter3d',
        marker: {
            color: 'red',
            size: 8
        },
        name: 'Óptimo encontrado'
    };

    // Algunos puntos evaluados
    const ultimosPuntos = datosTabla.slice(-100);
    const puntosEvaluados = {
        x: ultimosPuntos.map(d => d.x),
        y: ultimosPuntos.map(d => d.y),
        z: ultimosPuntos.map(d => d.fx),
        mode: 'markers',
        type: 'scatter3d',
        marker: {
            color: 'blue',
            size: 2,
            opacity: 0.6
        },
        name: 'Puntos evaluados (últimos 100)'
    };

    const layout = {
        title: 'Función y Puntos Evaluados',
        scene: {
            xaxis: { title: 'x' },
            yaxis: { title: 'y' },
            zaxis: { title: 'f(x,y)' }
        }
    };

    Plotly.newPlot('grafica-funcion', [superficie, puntoOptimo, puntosEvaluados], layout);
}

function crearGraficaError() {
    const iteraciones = Array.from({ length: historialError.length }, (_, i) => i + 1);

    const traceError = {
        x: iteraciones,
        y: historialError,
        mode: 'lines',
        type: 'scatter',
        name: 'Error Relativo (%)',
        line: { color: 'red' }
    };

    const traceMejor = {
        x: iteraciones,
        y: historialMejor,
        mode: 'lines',
        type: 'scatter',
        name: 'Mejor Valor',
        yaxis: 'y2',
        line: { color: 'blue' }
    };

    const layout = {
        title: 'Convergencia del Algoritmo',
        xaxis: { title: 'Iteración' },
        yaxis: {
            title: 'Error Relativo (%)',
            side: 'left'
        },
        yaxis2: {
            title: 'Mejor Valor de f(x,y)',
            side: 'right',
            overlaying: 'y'
        }
    };

    Plotly.newPlot('grafica-error', [traceError, traceMejor], layout);
}

function limpiarResultados() {
    document.getElementById('resultados').style.display = 'none';
    datosTabla = [];
    mejorValor = null;
    mejorX = null;
    mejorY = null;
    historialMejor = [];
    historialError = [];
}