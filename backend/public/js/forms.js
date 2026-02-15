document.addEventListener('DOMContentLoaded', () => {
  // Form validation
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const inputs = this.querySelectorAll('input[required]');
      let isValid = true;
      
      inputs.forEach(input => {
        const errorEl = input.parentElement.querySelector('.error-message');
        
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('border-destructive');
          if (errorEl) {
            errorEl.textContent = 'Este campo es requerido';
            errorEl.classList.remove('hidden');
          }
        } else {
          input.classList.remove('border-destructive');
          if (errorEl) {
            errorEl.classList.add('hidden');
          }
        }
        
        // Email validation
        if (input.type === 'email' && input.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value)) {
            isValid = false;
            input.classList.add('border-destructive');
            if (errorEl) {
              errorEl.textContent = 'Email inválido';
              errorEl.classList.remove('hidden');
            }
          }
        }
        
        // Password length validation
        if (input.type === 'password' && input.value.trim()) {
          if (input.value.length < 6) {
            isValid = false;
            input.classList.add('border-destructive');
            if (errorEl) {
              errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres';
              errorEl.classList.remove('hidden');
            }
          }
        }
      });
      
      if (!isValid) {
        e.preventDefault();
      }
    });
    
    // Clear error on input
    form.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', function() {
        this.classList.remove('border-destructive');
        const errorEl = this.parentElement.querySelector('.error-message');
        if (errorEl) {
          errorEl.classList.add('hidden');
        }
      });
    });
  });
});
