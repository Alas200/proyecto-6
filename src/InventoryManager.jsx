import { useReducer, useRef, useCallback, useState, useEffect } from "react";

const initialState = { products: [] };

function reducer(state, action) {
  switch (action.type) {
    case "set_initial":
      return { products: action.products };
    case "add":
      return { 
        products: [...state.products, { 
          id: Date.now(), 
          name: action.name, 
          quantity: 1 
        }] 
      };
    case "increment":
      return { 
        products: state.products.map(p =>
          p.id === action.id ? { ...p, quantity: p.quantity + 1 } : p
        ) 
      };
    case "decrement":
      return { 
        products: state.products.map(p =>
          p.id === action.id && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
        ) 
      };
    case "remove":
      return { 
        products: state.products.filter(p => p.id !== action.id) 
      };
    case "clear":
      return { products: [] };
    default:
      return state;
  }
}

function InventoryManager() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const inputRef = useRef(null);
  
  // Referencia para el input de búsqueda
  const searchInputRef = useRef(null);
  
  // Estado para almacenar el término con el que realmente se filtrará
  const [queryBusqueda, setQueryBusqueda] = useState("");

  // Cargar inventario desde localStorage al iniciar
  useEffect(() => {
    const savedProducts = localStorage.getItem("inventory_products");
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        dispatch({ type: "set_initial", products: parsedProducts });
      } catch (error) {
        console.error("Error al cargar localStorage:", error);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambien los productos
  useEffect(() => {
    localStorage.setItem("inventory_products", JSON.stringify(state.products));
  }, [state.products]);

  const handleAddProduct = () => {
    if (inputRef.current.value.trim() !== "") {
      dispatch({ type: "add", name: inputRef.current.value });
      inputRef.current.value = "";
    }
  };

  // Función que se ejecuta al hacer clic en el botón de buscar
  const handleSearchClick = () => {
    setQueryBusqueda(searchInputRef.current.value);
  };

  // Optimización con useCallback
  const handleIncrement = useCallback((id) => {
    dispatch({ type: "increment", id });
  }, []);

  const handleDecrement = useCallback((id) => {
    dispatch({ type: "decrement", id });
  }, []);

  const handleRemove = useCallback((id) => {
    dispatch({ type: "remove", id });
  }, []);

  const handleClear = () => {
    dispatch({ type: "clear" });
    setQueryBusqueda("");
    if (searchInputRef.current) searchInputRef.current.value = "";
  };

  // Filtrar productos utilizando el valor guardado al dar clic en buscar
  const filteredProducts = state.products.filter((product) =>
    product.name.toLowerCase().includes(queryBusqueda.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Gestor de Inventario</h2>
      
      {/* Input para agregar producto */}
      <div style={{ marginBottom: '10px' }}>
        <input ref={inputRef} type="text" placeholder="Nombre del producto" />
        <button onClick={handleAddProduct}>Agregar Producto</button>
      </div>

      {/* Input y botón de búsqueda */}
      <div style={{ marginBottom: '10px' }}>
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="Buscar producto..." 
        />
        <button onClick={handleSearchClick}>Buscar Producto</button>
      </div>

      {/* Botón para vaciar inventario */}
      {state.products.length > 0 && (
        <button onClick={handleClear} style={{ backgroundColor: '#ff4d4d', color: 'white', marginBottom: '10px', display: 'block' }}>
          Vaciar Inventario
        </button>
      )}

      <ul>
        {filteredProducts.map((product) => (
          <li key={product.id} style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{product.name} - Cantidad: {product.quantity}</span>
            <div>
              <button onClick={() => handleIncrement(product.id)}>+</button>
              <button onClick={() => handleDecrement(product.id)}>-</button>
              <button onClick={() => handleRemove(product.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>

      {filteredProducts.length === 0 && state.products.length > 0 && (
        <p style={{ color: 'gray' }}>No se encontraron productos con ese término.</p>
      )}
    </div>
  );
}

export default InventoryManager;