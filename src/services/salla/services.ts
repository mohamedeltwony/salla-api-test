import { SallaApiClient, sallaApi } from './client';
import { SallaNotificationService } from './notifications';

// Initialize services after client is created
function initializeServices() {
  if (!sallaApi.notifications) {
    sallaApi.notifications = new SallaNotificationService(sallaApi);
  }
}

// Initialize services
initializeServices();

// Export the initialized services
export { sallaApi };
export const sallaNotificationService = sallaApi.notifications as SallaNotificationService;