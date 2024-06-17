import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  constructor(private messageService: MessageService) {}

  showSuccessMessage(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 2000,
    });
  }

  showErrorMessage(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 2000,
    });
  }

  showInfoMessage(message: string) {
    this.messageService.add({
      severity: 'info',
      summary: 'Info Message',
      detail: message,
      life: 2000,
    });
  }
}
