//Link al JSON
const URLJSON = "js/productos.json"

//Array para guardar mis productos
let carrito = [];

//Identifico mis ids del HTML
let boxProductos = document.querySelector('#boxProductos')
let boxCarrito = document.querySelector('#boxCarrito') 
let productosTotal = document.querySelector('#productosTotal')
let notificacion = document.querySelector('#notificacion')
let nombreUsuario = document.getElementById("usuarioIngresado") 
let vaciarBoxCarrito = document.getElementById("vaciar")


//Agrego los productos al HTML
const agregarProductos = () => {
	//TRAER PRODUCTOS DEL JSON
	$.getJSON(URLJSON,function(respuesta,estado){ 
	
		if(estado === "success") {

			let misProductos = respuesta

			//localStorage.setItem("productos", misProductos)

			for(const prod of misProductos){
				boxProductos.innerHTML += `<div class="col-12 col-md-4 col-lg-3">
												<div class="cardsProductos reseteoFormBtn">
													<img src="${prod.url}"</img>
													<h3>${prod.producto}</h3>
													<div>$<span>${prod.precio}</span></div>
													<button data-id=${prod.id} class="btnComprar btn rounded-pill bg-secondary text-white">Agregar al carrito</button>
												</div>
											</div>`
			}

			let btnComprar = document.querySelectorAll(".btnComprar")

			//Evento para agregar productos al carrito
			btnComprar.forEach((e) => 
				e.addEventListener("click", (e) => {
					
					let productoMostrar = misProductos.find(function(producto){
						return producto.id === Number(e.target.dataset.id)
					})
			
					agregarAlCarrito(productoMostrar)
					
					notificaciones("Producto agregado")
				})											
			)
		}
	})	
}

//Notificación de producto agregado/removido
function notificaciones(texto){
	$("#notificaciones").hide()
	$("#notificaciones").html(`<p class="activar bg-secondary text-white">${texto}</p>`)
	$("#notificaciones").slideDown(300).delay(2000).animate({ width: 'toggle' }, 100)
}

//Función para agregar productos al HTML
const agregarAlCarrito = (elemento) => {

	let crearCarrito = {
		url: elemento.url,
		producto: elemento.producto,
		precioUnitario: elemento.precio, 
		precioTotal: elemento.precio,
		id: elemento.id,
		cantidad: 1
	}

	let identificadorCarrito = carrito.find(
		elemento => elemento.id === crearCarrito.id
	)
		
	if(identificadorCarrito){
		identificadorCarrito.cantidad++
		identificadorCarrito.precioTotal = identificadorCarrito.precioUnitario * identificadorCarrito.cantidad
	} else {
		carrito.push(crearCarrito) 	
	}
	estructuraCarrito()
}

const estructuraCarrito = () => {
	boxCarrito.innerHTML = ""
	if (carrito.length == 0){
		mostrarTextoCarrito()
	} else {
		carrito.forEach((elemento) => { 
			let {url,producto,precioTotal,id,cantidad} = elemento
			
			boxCarrito.innerHTML +=`<tr>
										<td>
											<img src="${url}"></img>
										</td>
										<td><span class="px-1">${producto}</span></td>
										<td><span class="px-2">Unidades: ${cantidad}</span></td>
										<td><span">$${precioTotal}</span></td>
										<td>
											<button class="btnMenos btn rounded-pill bg-secondary text-white" data-id=${id}>Quitar</button>
										</td>
										<td>
											<button class="btnBorrar btn rounded-pill bg-secondary text-white" data-id=${id}>Eliminar</button>
										</td><br>
									</tr>`
		})
		resultadoTotal()
	}
}	

//Eliminar un producto del carrito
const restarProducto = (e) =>{
	//Agarro el id del producto
	let idProducto = Number(e.target.getAttribute("data-id"))


	let borrarProducto = carrito.find(function(producto){
		return producto.id == idProducto
	})	
	
	if(borrarProducto){
		borrarProducto.cantidad--
		borrarProducto.precioTotal = borrarProducto.precioTotal - borrarProducto.precioUnitario
		if(borrarProducto.cantidad === 0) {
			borrarProducto.cantidad = 1;
			borrarProducto.precioTotal = borrarProducto.precioUnitario
		}
	}
	estructuraCarrito()
}

//Quitar el producto del carrito
function quitarProducto(e) {
	let idProducto = Number(e.target.getAttribute("data-id"));

	carrito = carrito.filter((p1) => p1.id != idProducto);

	estructuraCarrito();
}

//Vaciar completamente el carrito
function vaciarCarrito(e){
	e.preventDefault()

	mostrarTextoCarrito()
	carrito = []
	notificaciones("Carrito vacío")
	$('#carritoModal').modal('hide')
	return false
}

//Si hace click en agregar o borrar un producto se ejecuta una u otra función
boxCarrito.addEventListener("click", (e) =>{
	if(e.target.classList.contains("btnMenos")){
		restarProducto(e)
	}
	if(e.target.classList.contains("btnBorrar")){
		quitarProducto(e)
	}
})

//Si hace click en vaciar el carrito se ejecutan las siguientes funciones
vaciarBoxCarrito.addEventListener("click", (e) =>{
		if(e.target.classList.contains("vaciarCarrito")){
		vaciarCarrito(e)
	}
})

//Sumo el total de los productos
const resultadoTotal = (e) => {
		const resultadoTotal = carrito.reduce((acc, item) =>{
			return acc += item.precioTotal
		}, 0)

		productosTotal.innerHTML = `<span class="prodTotal"><strong>Importe total: $${resultadoTotal}</strong></span>`
}

//Mostrar un msj cuando el carrito esta vacío
const mostrarTextoCarrito = (e) => {
	boxCarrito.innerHTML =`<div class="notificacionCarrito">Agregue productos a su carrito.</div>`

	productosTotal.innerHTML = ``
}

//Muestro el modal del envío sólo si hay productos en el carrito
$("#comprarCarrito").click(function (e){
	e.preventDefault()

	if(carrito.length == 0) {
		Swal.fire({
			position: 'center',
			icon: 'error',
			title: 'Carrito vacío',
			showConfirmButton: false,
			timer: 1000
		})
	} else {
		$("#carritoModal").modal('hide')
		$("#datosEnvioModal").modal('show')
	}
})

//Si completo los datos de envío muestro el modal del pago
$("#datosEnvioForm").click(function (e){ 
	if ($("#nombre").val() != "" && $("#apellido").val() != "" && $("#provincia").val() != "" && 
	$("#localidad").val() != "" && $("#direccion").val() != "" && $("#codigoPostal").val() != "") {
		
		e.preventDefault()
		$('#datosEnvioModal').modal('hide')
		$('#datosPagoModal').modal('show')
		
	} else {
		Swal.fire({
			position: 'center',
			icon: 'error',
			title: 'Complete los datos solicitados',
			showConfirmButton: false,
			timer: 1200
		})
	}
})
//Si los datos de pago estan completos muestro el alerta de confirmación
$("#datosPagoForm").click(function (e){
	if ($("#tarjetaNumero").val() != "" && $("#nombreTarjeta").val() != "" && $("#mesTarjeta").val() != "" && 
	$("#anioTarjeta").val() != "" && $("#codigoTarjeta").val() != "") {
		
		e.preventDefault()
		$('#datosPagoModal').modal('hide')

		Swal.fire({
			position: 'center',
			icon: 'success',
			title: 'Compra realizada',
			showConfirmButton: false,
			timer: 1200
		})

		//textoVaciarCarrito(e)
		carrito = []
		mostrarTextoCarrito()
		$("#formularioCompra").trigger("reset")
		$("#formularioPago").trigger("reset")

	} else {
		Swal.fire({
			position: 'center',
			icon: 'error',
			title: 'Complete los datos solicitados',
			showConfirmButton: false,
			timer: 1200
		})
	}
})

//Valido que haya cargado datos en el formulario 
$("#enviarFormContacto").click(function (e) {
	if($("#nombreContacto").val() != "" && $("#inputEmail").val() != "" && 
	$("#asuntoContacto").val() != "" && $("#comentarios").val() != "" ) {
		e.preventDefault()

		Swal.fire({
			position: 'center',
			icon: 'success',
			title: 'Recibimos su consulta, pronto nos comunicaremos.',
			showConfirmButton: true,
		})
		$("#formContacto").trigger("reset")
	} else {
		Swal.fire({
			position: 'center',
			icon: 'error',
			title: 'Complete todos los campos',
			showConfirmButton: false,
			timer: 1200
		})
	}
})

//Ejecuto la funcion para agregar productos cuando se cargo el DOM
document.addEventListener("DOMContentLoaded", () => {
	agregarProductos()
	mostrarTextoCarrito()
})