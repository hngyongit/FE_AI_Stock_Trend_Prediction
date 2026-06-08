import { useToast } from '@/shared/ui/utils/ThemeProvider';

// Toast is now handled via ThemeProvider's useToast hook.
// This component is kept as a minimal export for backward compatibility.
function Toast() {
  return null;
}

Toast.displayName = 'Toast';

export { Toast, useToast };
