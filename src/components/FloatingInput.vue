<template>
  <div class="floating-group">
    <input 
      :id="id"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="floating-input" 
      placeholder=" " 
      v-bind="$attrs"
    />
    <label :for="id" class="floating-label">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: 'FloatingInput',
  inheritAttrs: false,
  props: {
    modelValue: [String, Number],
    label: { type: String, required: true },
    id: { type: String, required: true }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>

.floating-group {
  position: relative;
  margin-bottom: 15px;
  height: 48px; 
}


.floating-input {
  width: 100%;
  height: 100%;
  padding: 12px 14px;
  font-size: 1rem;
  border: 1px solid var(--color-border, #ced4da);
  border-radius: 6px;
  outline: none;
  background-color: transparent;
  transition: border-color 0.2s;
  color: #333;
  
  margin: 0 !important; 
  box-sizing: border-box;
}

.floating-label {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  
  margin: 0 !important;
  padding: 0 4px !important;
  display: inline-block !important;
  
  background-color: var(--color-white, #ffffff); 
  color: var(--color-secondary, #6c757d);
  font-size: 1rem;
  pointer-events: none;
  transition: 0.2s ease all;
  z-index: 5;
}

.floating-input:focus ~ .floating-label,
.floating-input:not(:placeholder-shown) ~ .floating-label {
  top: 0;
  font-size: 0.85rem;
  color: var(--color-primary, #007bff);
  font-weight: 600;
}

.floating-input:focus {
  border-color: var(--color-primary, #007bff);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.floating-input.error {
  border-color: var(--color-danger, #dc3545);
}
.floating-input.error ~ .floating-label {
  color: var(--color-danger, #dc3545);
}
</style>