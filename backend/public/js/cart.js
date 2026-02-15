document.addEventListener('DOMContentLoaded', () => {
  console.log('🛒 Cart.js loaded');
  
  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  console.log('🔍 Found', addToCartButtons.length, 'add-to-cart buttons');
  
  addToCartButtons.forEach(btn => {
    console.log('➕ Attaching click listener to button:', btn.dataset.productId);
    btn.addEventListener('click', async function() {
      console.log('🖱️ Button clicked! Product ID:', this.dataset.productId);
      const productId = this.dataset.productId;
      
      try {
        console.log('📤 Sending request to add product:', productId);
        this.disabled = true;
        this.textContent = 'Agregando...';
        
        const result = await apiCall('/api/cart/add', 'POST', { productId, quantity: 1 });
        console.log('✅ Product added successfully:', result);
        
        updateCartCount(result.cartCount);
        showNotification('Producto agregado al carrito', 'success');
        
        this.textContent = 'Agregado ✓';
        setTimeout(() => {
          this.textContent = 'Agregar';
          this.disabled = false;
        }, 2000);
      } catch (error) {
        console.error('❌ Error adding to cart:', error);
        showNotification(error.message || 'Error al agregar al carrito', 'error');
        this.textContent = 'Agregar';
        this.disabled = false;
      }
    });
  });

  // Update quantity buttons
  document.querySelectorAll('.update-quantity-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const productId = this.dataset.productId;
      const action = this.dataset.action;
      const quantityDisplay = this.parentElement.querySelector('.quantity-display');
      const currentQuantity = parseInt(quantityDisplay.textContent);
      
      let newQuantity = action === 'increase' ? currentQuantity + 1 : currentQuantity - 1;
      
      if (newQuantity < 1) {
        if (confirm('¿Deseas eliminar este producto del carrito?')) {
          newQuantity = 0;
        } else {
          return;
        }
      }
      
      try {
        const result = await apiCall('/api/cart/update', 'PUT', { productId, quantity: newQuantity });
        
        if (newQuantity === 0) {
          this.closest('.cart-item').remove();
        } else {
          quantityDisplay.textContent = newQuantity;
          const subtotalDisplay = this.closest('.cart-item').querySelector('.subtotal-display');
          subtotalDisplay.textContent = `$${result.item.subtotal.toFixed(2)}`;
        }
        
        updateCartCount(result.cartCount);
        updateCartTotal(result.total);
        showNotification('Carrito actualizado', 'success');
      } catch (error) {
        showNotification(error.message || 'Error al actualizar el carrito', 'error');
      }
    });
  });

  // Remove from cart buttons
  document.querySelectorAll('.remove-from-cart-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      if (!confirm('¿Deseas eliminar este producto del carrito?')) {
        return;
      }
      
      const productId = this.dataset.productId;
      
      try {
        const result = await apiCall('/api/cart/remove', 'DELETE', { productId });
        
        this.closest('.cart-item').remove();
        updateCartCount(result.cartCount);
        updateCartTotal(result.total);
        showNotification('Producto eliminado del carrito', 'success');
        
        if (result.cartCount === 0) {
          location.reload();
        }
      } catch (error) {
        showNotification(error.message || 'Error al eliminar del carrito', 'error');
      }
    });
  });

  // Clear cart button
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', async function() {
      if (!confirm('¿Deseas vaciar todo el carrito?')) {
        return;
      }
      
      try {
        await apiCall('/api/cart/clear', 'DELETE');
        location.reload();
      } catch (error) {
        showNotification(error.message || 'Error al vaciar el carrito', 'error');
      }
    });
  }
});

function updateCartTotal(total) {
  const totalDisplay = document.getElementById('cart-total');
  if (totalDisplay) {
    totalDisplay.textContent = `$${total.toFixed(2)}`;
  }
}
