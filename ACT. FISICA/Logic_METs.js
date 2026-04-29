let dashboardItems = [];

// 1. Cargar Categorías al iniciar
document.addEventListener('DOMContentLoaded', () => {
    const catSelect = document.getElementById('cat_select');
    
    // Extrae categorías únicas de tu variable dbMet
    const categorias = [...new Set(dbMet.map(item => item.cat))];
    
    categorias.sort().forEach(cat => {
        if(cat) {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            catSelect.appendChild(opt);
        }
    });
});

// 2. Filtrar actividades cuando cambias la categoría
function actualizarActividades() {
    const catSeleccionada = document.getElementById('cat_select').value;
    const actSelect = document.getElementById('act_select');
    
    // Limpia los campos automáticos y la lista previa
    document.getElementById('auto_codigo').value = "---";
    document.getElementById('auto_met').value = "---";
    actSelect.innerHTML = '<option value="">-- Seleccionar Actividad --</option>';

    if (!catSeleccionada) {
        actSelect.disabled = true;
        return;
    }

    // Filtra en tu base de datos dbMet
    const filtradas = dbMet.filter(a => a.cat === catSeleccionada);
    
    filtradas.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.cod;
        opt.textContent = a.act;
        opt.dataset.met = a.met; // Guarda el MET oculto en la opción
        actSelect.appendChild(opt);
    });
    
    actSelect.disabled = false;
}

// 3. Mostrar Código y MET apenas se elija la actividad
function rellenarDatosAuto() {
    const actSelect = document.getElementById('act_select');
    const selectedOption = actSelect.options[actSelect.selectedIndex];

    if (actSelect.value !== "") {
        document.getElementById('auto_codigo').value = actSelect.value;
        document.getElementById('auto_met').value = selectedOption.dataset.met;
    } else {
        document.getElementById('auto_codigo').value = "---";
        document.getElementById('auto_met').value = "---";
    }
}

// 4. Función del botón para calcular y mandar al Dashboard
function agregarAlDashboard() {
    const peso = parseFloat(document.getElementById('input_peso').value);
    const tiempo = parseFloat(document.getElementById('input_tiempo').value);
    const met = parseFloat(document.getElementById('auto_met').value);
    const cod = document.getElementById('auto_codigo').value;
    const actSelect = document.getElementById('act_select');
    
    if (!peso || !tiempo || isNaN(met)) {
        alert("Faltan datos (Peso, Tiempo o Actividad).");
        return;
    }

    const actNombre = actSelect.options[actSelect.selectedIndex].text;
    const kcal = met * peso * (tiempo / 60);
    
    dashboardItems.push({
        id: Date.now(),
        codigo: cod,
        actividad: actNombre,
        met: met,
        calorias: kcal
    });

    actualizarTabla();
}

function actualizarTabla() {
    const tbody = document.querySelector('#tabla-dashboard tbody');
    tbody.innerHTML = "";
    let suma = 0;

    dashboardItems.forEach(item => {
        suma += item.calorias;
        tbody.innerHTML += `
            <tr>
                <td>${item.codigo}</td>
                <td style="text-align:left;">${item.actividad}</td>
                <td>${item.met}</td>
                <td>${item.calorias.toFixed(1)}</td>
                <td><button onclick="borrarItem(${item.id})" style="color:red; border:none; background:none; cursor:pointer;">✖</button></td>
            </tr>
        `;
    });
    document.getElementById('suma-total').textContent = suma.toFixed(1);
}

function borrarItem(id) {
    dashboardItems = dashboardItems.filter(i => i.id !== id);
    actualizarTabla();
}
// Variable global para la suma manual
let acumuladorMets = 0;

function sumarMetManual() {
    const input = document.getElementById('input_suma_manual');
    const valor = parseFloat(input.value);

    if (isNaN(valor) || valor <= 0) {
        alert("Por favor, ingresa un valor MET válido.");
        return;
    }

    // Sumar al total
    acumuladorMets += valor;

    // Actualizar la pantalla
    document.getElementById('total_mets_manual').innerText = acumuladorMets.toFixed(1);

    // Limpiar el cuadrito para el siguiente número
    input.value = "";
    input.focus(); // Deja el cursor listo para escribir otro
}

function resetSumaManual() {
    if (confirm("¿Deseas reiniciar la suma de METs?")) {
        acumuladorMets = 0;
        document.getElementById('total_mets_manual').innerText = "0.0";
    }
}