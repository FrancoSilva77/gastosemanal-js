// Variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

// Leer los datos del formulario
const nombreInput = document.querySelector('#gasto');
const cantidadInput = document.querySelector('#cantidad');

let editando;

// Eventos
eventListeners();
function eventListeners() {
  document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

  nombreInput.addEventListener('input', datosGasto);
  cantidadInput.addEventListener('input', datosGasto);

  formulario.addEventListener('submit', agregarGasto);
}

// Objeto principal
const gastoObj = {
  nombre: '',
  cantidad: '',
};

// Clases
class Presupuesto {
  constructor(presupuesto) {
    this.presupuesto = Number(presupuesto);
    this.restante = Number(presupuesto);
    this.gastos = [];
  }

  nuevoGasto(gasto) {
    this.gastos = [...this.gastos, gasto];
    this.calcularReastante();
  }

  calcularReastante() {
    const gastado = this.gastos.reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    );
    this.restante = this.presupuesto - gastado;
  }

  eliminarGasto(id) {
    this.gastos = this.gastos.filter((gasto) => gasto.id !== id);

    this.calcularReastante();
  }
  editarGasto(gastoActualizado) {
    this.gastos = this.gastos.map((gasto) =>
      gasto.id === gastoActualizado.id ? gastoActualizado : gasto
    );
    this.calcularReastante();
  }
}

class UI {
  insertarPresupuesto(cantidad) {
    // Extrayendo los valores
    const { presupuesto, restante } = cantidad;

    // Agegar al HTML
    document.querySelector('#total').textContent = presupuesto;
    document.querySelector('#restante').textContent = restante;
  }

  imprimirAlerta(mensaje, tipo) {
    // Crear el div
    const divMensaje = document.createElement('div');
    divMensaje.classList.add('text-center', 'alert');

    if (tipo === 'error') {
      divMensaje.classList.add('alert-danger');
    } else {
      divMensaje.classList.add('alert-success');
    }

    // Mensaje de error
    divMensaje.textContent = mensaje;

    // Insertar en el HTML
    document.querySelector('.primario').insertBefore(divMensaje, formulario);

    setTimeout(() => {
      divMensaje.remove();
    }, 2000);
  }

  mostrarGastos(gastos) {
    this.limpiarHTML();

    // Iterar sobre los gastos
    gastos.forEach((gasto) => {
      const { cantidad, nombre, id } = gasto;

      // Crear un li
      const nuevoGasto = document.createElement('li');
      nuevoGasto.className =
        'list-group-item d-flex justify-content-between align-items-center';
      nuevoGasto.dataset.id = id;
      console.log(nuevoGasto);

      // Agregar el html del gasto
      nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${cantidad} </span>
      `;

      // bOTON PARA BORRAR EL GASTO
      const btnBorrar = document.createElement('button');
      btnBorrar.textContent = 'Eliminar x';
      btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');

      // Boton para editar gasto
      const btnEditar = document.createElement('button');
      btnEditar.classList.add('btn', 'btn-info');
      btnEditar.innerHTML = `Editar`;

      btnEditar.onclick = () => cargarEdicion(gasto);

      nuevoGasto.appendChild(btnEditar);

      btnBorrar.onclick = () => {
        eliminarGasto(id);
      };
      nuevoGasto.appendChild(btnBorrar);

      // Agregar el html

      gastoListado.appendChild(nuevoGasto);
    });
  }

  actualizarRestante(restante) {
    document.querySelector('#restante').textContent = restante;
  }

  comprobarPresupuesto(presupuestoObj) {
    const { presupuesto, restante } = presupuestoObj;
    const restanteDiv = document.querySelector('.restante');

    // Comprobar 25%
    if (presupuesto / 4 > restante) {
      restanteDiv.classList.remove('alert-success', 'alert-warning');
      restanteDiv.classList.add('alert-danger');
    } else if (presupuesto / 2 > restante) {
      restanteDiv.classList.remove('alert-success');
      restanteDiv.classList.add('alert-warning');
    } else {
      restanteDiv.classList.remove('alert-danger', 'alert-warning');
      restanteDiv.classList.add('alert-success');
    }

    // Si el total es 0 o menor
    if (restante <= 0) {
      ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
      formulario.querySelector('button[type="submit"]').disabled = true;
    } else {
      formulario.querySelector('button[type="submit"]').disabled = false;
    }
  }

  limpiarHTML() {
    while (gastoListado.firstChild) {
      gastoListado.removeChild(gastoListado.firstChild);
    }
  }
}

// Instanciar
const ui = new UI();
let presupuesto;

function reiniciarObjeto() {
  gastoObj.nombre = '';
  gastoObj.cantidad = '';
}

// Funciones
function preguntarPresupuesto() {
  const presupuestoUsuario = prompt('Cual es tu presupuesto?');

  if (
    presupuestoUsuario === '' ||
    presupuestoUsuario === null ||
    isNaN(presupuestoUsuario) ||
    presupuestoUsuario <= 0
  ) {
    window.location.reload();
  }

  // Presupuesto valido
  presupuesto = new Presupuesto(presupuestoUsuario);
  ui.insertarPresupuesto(presupuesto);
}

function datosGasto(e) {
  // gastoObj[e.target.name] = e.target.value;
  gastoObj.nombre = nombreInput.value;
  gastoObj.cantidad = +cantidadInput.value;
}

// Agregar gastos
function agregarGasto(e) {
  e.preventDefault();
  const { cantidad } = gastoObj;

  if (Object.values(gastoObj).includes('')) {
    ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
    return;
  } else if (cantidad <= 0 || isNaN(cantidad)) {
    ui.imprimirAlerta('Cantidad no valida', 'error');
    return;
  }

  // Generar un objeto con el gasto
  // const gasto = { nombre, cantidad, id: Date.now() };

  // Agrega un nuevo gasto
  if (editando) {
    console.log('editando');
    presupuesto.editarGasto({ ...gastoObj });
    editando = false;
  } else {
    gastoObj.id = Date.now();
    presupuesto.nuevoGasto({ ...gastoObj });

    ui.imprimirAlerta('Gasto agregado correctamente');
  }

  // Reiniciar objeto
  reiniciarObjeto();

  // Imprimir los gastos
  const { gastos, restante } = presupuesto;
  ui.mostrarGastos(gastos);
  ui.actualizarRestante(restante);
  ui.comprobarPresupuesto(presupuesto);

  // Reinicia el formulario
  formulario.reset();
}

function eliminarGasto(id) {
  // Elimina gastos del objeto
  presupuesto.eliminarGasto(id);

  // Elimina los gastos
  const { gastos, restante } = presupuesto;
  ui.mostrarGastos(gastos);

  ui.actualizarRestante(restante);
  ui.comprobarPresupuesto(presupuesto);
}

function cargarEdicion(gasto) {
  const { nombre, cantidad, id } = gasto;

  // Llenar los inputs
  nombreInput.value = nombre;
  cantidadInput.value = cantidad;

  // LLenar el objeto
  gastoObj.nombre = nombre;
  gastoObj.cantidad = cantidad;
  gastoObj.id = id;

  formulario.querySelector('button[type="submit"]').textContent =
    'Guardar Cambios';

  editando = true;
}
