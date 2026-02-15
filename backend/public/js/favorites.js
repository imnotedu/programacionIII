document.addEventListener('DOMContentLoaded', () => {
  // Favorite buttons
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
      const productId = this.dataset.productId;
      const isFavorite = this.dataset.isFavorite === 'true';
      const icon = this.querySelector('svg');
      
      try {
        const result = await apiCall(
          isFavorite ? '/api/favorites/remove' : '/api/favorites/add',
          isFavorite ? 'DELETE' : 'POST',
          { productId }
        );
        
        this.dataset.isFavorite = !isFavorite;
        
        if (!isFavorite) {
          icon.classList.add('fill-red-500', 'text-red-500');
          icon.classList.remove('text-gray-400');
          icon.setAttribute('fill', 'currentColor');
          showNotification('Agregado a favoritos', 'success');
        } else {
          icon.classList.remove('fill-red-500', 'text-red-500');
          icon.classList.add('text-gray-400');
          icon.setAttribute('fill', 'none');
          showNotification('Eliminado de favoritos', 'success');
        }
      } catch (error) {
        showNotification(error.message || 'Error al actualizar favoritos', 'error');
      }
    });
  });
});
