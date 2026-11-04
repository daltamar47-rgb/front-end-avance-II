// SECCIÓN: DATOS
let habitaciones = [
    { id: 1, codigo: 'H-1', zona: 'Cartago centro', precio: 85500, capacidad: 1, servicios: ['Wifi'] },
    { id: 2, codigo: 'H-2', zona: 'San Pedro', precio: 132000, capacidad: 2, servicios: ['Wifi', 'Baño privado'] },
    { id: 3, codigo: 'H-5', zona: 'Heredia', precio: 118750, capacidad: 3, servicios: ['Wifi', 'Parqueo', 'Amueblada'] }
];

let clientes = [
    { id: 1, cedula: '1-0845-0231', nombre: 'Juan', apellidos: 'Pérez Mora', telefono: '8888-1234', correo: 'juan@gmail.com' },
    { id: 2, cedula: '2-0412-0765', nombre: 'Ana', apellidos: 'Rodríguez', telefono: '7000-5678', correo: 'ana@gmail.com' },
    { id: 3, cedula: '3-0377-0498', nombre: 'Luis', apellidos: 'Castro Vega', telefono: '6123-4567', correo: 'luis@gmail.com' }
];

// fechaFin vacía = alquiler activo
let alquileres = [
    { id: 1, idCliente: 1, idHabitacion: 2, fechaInicio: '2026-09-01', fechaFin: '', monto: 128000 },
    { id: 2, idCliente: 2, idHabitacion: 1, fechaInicio: '2026-03-01', fechaFin: '2026-08-31', monto: 85500 }
];

let filtroHabitaciones = 'todas';
let filtroAlquileres = 'todos';

// SECCIÓN: FUNCIONES DE APOYO
const clientePorId = (id) => {
    return clientes.filter((cliente) => { return cliente.id == id; })[0];
};

const habitacionPorId = (id) => {
    return habitaciones.filter((habitacion) => { return habitacion.id == id; })[0];
};

const clienteActual = (idHabitacion) => {
    const activos = alquileres.filter((alquiler) => {
        return alquiler.idHabitacion == idHabitacion && alquiler.fechaFin == '';
    });

    if(activos.length > 0) {
        return clientePorId(activos[0].idCliente);
    }

    return null;
};

const habitacionesDisponibles = () => {
    return habitaciones.filter((habitacion) => { return clienteActual(habitacion.id) == null; });
};

const textoServicios = (servicios) => {
    let texto = '';

    servicios.forEach((servicio) => {
        if(texto != '') {
            texto += ', ';
        }
        texto += servicio;
    });

    return texto;
};

const serviciosDelFormulario = (object) => {
    const servicios = [];

    if(object.wifi) {
        servicios.push('Wifi');
    }
    if(object.bano) {
        servicios.push('Baño privado');
    }
    if(object.amueblada) {
        servicios.push('Amueblada');
    }
    if(object.parqueo) {
        servicios.push('Parqueo');
    }

    return servicios;
};

// SECCIÓN: MENÚ
const enlacesMenu = document.querySelectorAll('.menu-principal a');
const modulos = document.querySelectorAll('.modulo');

enlacesMenu.forEach((enlace) => {
    enlace.addEventListener('click', (e) => {
        e.preventDefault();

        modulos.forEach((modulo) => {
            modulo.classList.add('oculto');
        });

        enlacesMenu.forEach((otro) => {
            otro.classList.remove('activo');
        });

        document.querySelector('#' + e.target.dataset.seccion).classList.remove('oculto');
        e.target.classList.add('activo');
    });
});

// SECCIÓN: HABITACIONES
const tbodyHabitaciones = document.querySelector('#cuerpoHabitaciones');

const filtrarHabitaciones = () => {
    if(filtroHabitaciones == 'disponibles') {
        return habitacionesDisponibles();
    }
    if(filtroHabitaciones == 'ocupadas') {
        return habitaciones.filter((habitacion) => { return clienteActual(habitacion.id) != null; });
    }
    return habitaciones;
};

const mostrarHabitaciones = (filtrados) => {
    tbodyHabitaciones.innerHTML = '';

    const lista = (filtrados != null) ? filtrados : habitaciones;

    lista.forEach((habitacion) => {
        const { codigo, zona, precio, capacidad, servicios } = habitacion;
        const cliente = clienteActual(habitacion.id);

        let estado = '<strong class="estado disponible">Disponible</strong>';
        let nombreCliente = '<em class="sin-dato">Sin asignar</em>';

        if(cliente != null) {
            estado = '<strong class="estado ocupada">Ocupada</strong>';
            nombreCliente = cliente.nombre + ' ' + cliente.apellidos;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${codigo}</td>
                    <td>${zona}</td>
                    <td>₡${precio}</td>
                    <td>${capacidad}</td>
                    <td>${textoServicios(servicios)}</td>
                    <td>${estado}</td>
                    <td>${nombreCliente}</td>`;

        tbodyHabitaciones.append(tr);
    });

    const disponibles = habitacionesDisponibles().length;
    document.querySelector('#totalHabitaciones').innerText = habitaciones.length;
    document.querySelector('#totalDisponibles').innerText = disponibles;
    document.querySelector('#totalOcupadas').innerText = habitaciones.length - disponibles;

    const estadoVacio = document.querySelector('#vacioHabitaciones');
    const tabla = document.querySelector('#tablaHabitaciones');

    if(lista.length > 0) {
        estadoVacio.classList.add('oculto');
        tabla.classList.remove('oculto');
    } else {
        estadoVacio.classList.remove('oculto');
        tabla.classList.add('oculto');
    }
};

document.querySelector('#formHabitacion').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const object = Object.fromEntries(data);

    console.log(object);

    if(object.codigo == '' || object.zona == '' || object.precio == '' || object.capacidad == '') {

        Swal.fire({
            title: "Validaciones",
            text: "Todos los campos son requeridos",
            icon: "error"
        });

    } else {
        habitaciones.push({
            id: habitaciones.length + 1,
            codigo: object.codigo,
            zona: object.zona,
            precio: parseInt(object.precio),
            capacidad: parseInt(object.capacidad),
            servicios: serviciosDelFormulario(object)
        });

        mostrarHabitaciones(filtrarHabitaciones());
        llenarSelects();
        e.target.reset();

        Swal.fire({
            title: "Proceso completado",
            text: "Habitación registrada correctamente",
            icon: "success"
        });
    }
});

const filtrosHabitaciones = document.querySelectorAll('#habitaciones .btn-filtro');

filtrosHabitaciones.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        filtrosHabitaciones.forEach((otro) => {
            otro.classList.remove('activo');
        });

        event.target.classList.add('activo');
        filtroHabitaciones = event.target.dataset.filtro;
        mostrarHabitaciones(filtrarHabitaciones());
    });
});

// SECCIÓN: CLIENTES
const tbodyClientes = document.querySelector('#cuerpoClientes');
const buscarCliente = document.querySelector('#buscarCliente');

const filtrarClientes = () => {
    const texto = buscarCliente.value.toLocaleLowerCase();

    return clientes.filter((cliente) => {
        const completo = cliente.nombre + ' ' + cliente.apellidos + ' ' + cliente.cedula;
        return completo.toLocaleLowerCase().includes(texto);
    });
};

const mostrarClientes = (filtrados) => {
    tbodyClientes.innerHTML = '';

    const lista = (filtrados != null) ? filtrados : clientes;

    lista.forEach((cliente) => {
        const { cedula, nombre, apellidos, telefono, correo } = cliente;

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${cedula}</td>
                    <td>${nombre}</td>
                    <td>${apellidos}</td>
                    <td>${telefono}</td>
                    <td>${correo}</td>`;

        tbodyClientes.append(tr);
    });

    document.querySelector('#totalClientes').innerText = clientes.length;

    const estadoVacio = document.querySelector('#vacioClientes');
    const tabla = document.querySelector('#tablaClientes');

    if(lista.length > 0) {
        estadoVacio.classList.add('oculto');
        tabla.classList.remove('oculto');
    } else {
        estadoVacio.classList.remove('oculto');
        tabla.classList.add('oculto');
    }
};

document.querySelector('#formCliente').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const object = Object.fromEntries(data);

    console.log(object);

    if(object.cedula == '' || object.nombre == '' || object.apellidos == '' || object.telefono == '' || object.correo == '') {

        Swal.fire({
            title: "Validaciones",
            text: "Todos los campos son requeridos",
            icon: "error"
        });

    } else {
        clientes.push({
            id: clientes.length + 1,
            cedula: object.cedula,
            nombre: object.nombre,
            apellidos: object.apellidos,
            telefono: object.telefono,
            correo: object.correo
        });

        mostrarClientes(filtrarClientes());
        llenarSelects();
        e.target.reset();

        Swal.fire({
            title: "Proceso completado",
            text: "Cliente registrado correctamente",
            icon: "success"
        });
    }
});

buscarCliente.addEventListener('input', () => {
    mostrarClientes(filtrarClientes());
});

// SECCIÓN: ALQUILERES
const tbodyAlquileres = document.querySelector('#cuerpoAlquileres');
const selectCliente = document.querySelector('#selectCliente');
const selectHabitacion = document.querySelector('#selectHabitacion');
const fechaSalida = document.querySelector('#fechaSalida');

const llenarSelects = () => {
    selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';

    clientes.forEach((cliente) => {
        selectCliente.innerHTML += `<option value="${cliente.id}">${cliente.nombre} ${cliente.apellidos}</option>`;
    });

    selectHabitacion.innerHTML = '<option value="">Seleccione una habitación</option>';

    habitacionesDisponibles().forEach((habitacion) => {
        selectHabitacion.innerHTML += `<option value="${habitacion.id}">${habitacion.codigo} - ${habitacion.zona} - ₡${habitacion.precio}</option>`;
    });
};

const filtrarAlquileres = () => {
    if(filtroAlquileres == 'activos') {
        return alquileres.filter((alquiler) => { return alquiler.fechaFin == ''; });
    }
    if(filtroAlquileres == 'finalizados') {
        return alquileres.filter((alquiler) => { return alquiler.fechaFin != ''; });
    }
    return alquileres;
};

const finalizarAlquiler = (event) => {
    const idAlquiler = event.target.dataset.id;
    const alquilerBuscado = alquileres.filter((alquiler) => { return alquiler.id == idAlquiler; })[0];

    if(fechaSalida.value == '') {

        Swal.fire({
            title: "Validaciones",
            text: "La fecha de salida es requerida",
            icon: "error"
        });

    } else {
        alquilerBuscado.fechaFin = fechaSalida.value;

        mostrarHabitaciones(filtrarHabitaciones());
        mostrarAlquileres(filtrarAlquileres());
        llenarSelects();
        fechaSalida.value = '';

        Swal.fire({
            title: "Proceso completado",
            text: "Alquiler finalizado correctamente",
            icon: "success"
        });
    }
};

const mostrarAlquileres = (filtrados) => {
    tbodyAlquileres.innerHTML = '';

    const lista = (filtrados != null) ? filtrados : alquileres;

    lista.forEach((alquiler) => {
        const { id, fechaInicio, fechaFin, monto } = alquiler;
        const habitacion = habitacionPorId(alquiler.idHabitacion);
        const cliente = clientePorId(alquiler.idCliente);

        let fin = fechaFin;
        let estado = '<strong class="estado finalizado">Finalizado</strong>';
        let accion = '<em class="sin-dato">Sin acciones</em>';

        if(fechaFin == '') {
            fin = '<em class="sin-dato">En curso</em>';
            estado = '<strong class="estado activo">Activo</strong>';
            accion = `<button type="button" class="btn btn-secundario btn-finalizar" data-id="${id}">Finalizar</button>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${habitacion.codigo}</td>
                    <td>${cliente.nombre} ${cliente.apellidos}</td>
                    <td>${fechaInicio}</td>
                    <td>${fin}</td>
                    <td>₡${monto}</td>
                    <td>${estado}</td>
                    <td>${accion}</td>`;

        tbodyAlquileres.append(tr);
    });

    const estadoVacio = document.querySelector('#vacioAlquileres');
    const tabla = document.querySelector('#tablaAlquileres');

    if(lista.length > 0) {
        estadoVacio.classList.add('oculto');
        tabla.classList.remove('oculto');
    } else {
        estadoVacio.classList.remove('oculto');
        tabla.classList.add('oculto');
    }

    document.querySelectorAll('.btn-finalizar').forEach((btn) => {
        btn.addEventListener('click', finalizarAlquiler);
    });
};

document.querySelector('#formAlquiler').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const object = Object.fromEntries(data);

    console.log(object);

    if(object.cliente == '' || object.habitacion == '' || object.fechaInicio == '' || object.monto == '') {

        Swal.fire({
            title: "Validaciones",
            text: "Todos los campos son requeridos",
            icon: "error"
        });

    } else {
        alquileres.push({
            id: alquileres.length + 1,
            idCliente: parseInt(object.cliente),
            idHabitacion: parseInt(object.habitacion),
            fechaInicio: object.fechaInicio,
            fechaFin: '',
            monto: parseInt(object.monto)
        });

        e.target.reset();
        mostrarHabitaciones(filtrarHabitaciones());
        mostrarAlquileres(filtrarAlquileres());
        llenarSelects();

        Swal.fire({
            title: "Proceso completado",
            text: "Habitación asignada correctamente",
            icon: "success"
        });
    }
});

const filtrosAlquileres = document.querySelectorAll('#alquileres .btn-filtro');

filtrosAlquileres.forEach((btn) => {
    btn.addEventListener('click', (event) => {
        filtrosAlquileres.forEach((otro) => {
            otro.classList.remove('activo');
        });

        event.target.classList.add('activo');
        filtroAlquileres = event.target.dataset.filtro;
        mostrarAlquileres(filtrarAlquileres());
    });
});

// SECCIÓN: RECOMENDADOR
const tbodyRecomendador = document.querySelector('#cuerpoRecomendador');

const mostrarRecomendaciones = (filtrados) => {
    tbodyRecomendador.innerHTML = '';

    filtrados.forEach((habitacion) => {
        const { codigo, zona, precio, capacidad, servicios } = habitacion;

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${codigo}</td>
                    <td>${zona}</td>
                    <td>₡${precio}</td>
                    <td>${capacidad}</td>
                    <td>${textoServicios(servicios)}</td>`;

        tbodyRecomendador.append(tr);
    });

    const estadoVacio = document.querySelector('#vacioRecomendador');
    const tabla = document.querySelector('#tablaRecomendador');

    if(filtrados.length > 0) {
        estadoVacio.classList.add('oculto');
        tabla.classList.remove('oculto');
    } else {
        estadoVacio.classList.remove('oculto');
        tabla.classList.add('oculto');
    }
};

document.querySelector('#formRecomendador').addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const object = Object.fromEntries(data);

    console.log(object);

    if(object.presupuesto == '' || object.personas == '') {

        Swal.fire({
            title: "Validaciones",
            text: "El presupuesto y las personas son requeridos",
            icon: "error"
        });

    } else {
        const requeridos = serviciosDelFormulario(object);

        const coinciden = habitacionesDisponibles().filter((habitacion) => {
            const faltantes = requeridos.filter((servicio) => { return habitacion.servicios.includes(servicio) == false; });
            return habitacion.precio <= parseInt(object.presupuesto) && habitacion.capacidad >= parseInt(object.personas) && faltantes.length == 0;
        });

        mostrarRecomendaciones(coinciden);
    }
});

// SECCIÓN: INICIO
document.addEventListener('DOMContentLoaded', () => {

    mostrarHabitaciones();
    mostrarClientes();
    mostrarAlquileres();
    llenarSelects();

});
