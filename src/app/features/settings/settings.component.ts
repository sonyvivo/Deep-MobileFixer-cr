import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  // PIN Form
  oldPin = '';
  newPin = '';

  // Data Form
  importFile: File | null = null;

  // Confirm State
  isConfirmClearOpen = false;

  // Toast
  toastMessage = '';
  toastType = '';



  constructor(
    private authService: AuthService,
    private dataService: DataService
  ) {
  }

  // ... Pin and Data logic ...



  updatePin() {
    if (this.authService.changePin(this.oldPin, this.newPin)) {
      this.showToast('PIN Updated Successfully', 'success');
      this.oldPin = '';
      this.newPin = '';
    } else {
      this.showToast('Incorrect Old PIN', 'error');
    }
  }

  downloadBackup() {
    const json = this.dataService.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DeepMobileBackup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    this.showToast('Backup Downloaded', 'success');
  }

  onFileSelected(event: any) {
    this.importFile = event.target.files[0];
  }

  restoreData() {
    if (this.importFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.dataService.importData(e.target.result)) {
          this.showToast('Data Restored Successfully', 'success');
          this.importFile = null;
          // Reset file input handled by UI redraw or manually
        } else {
          this.showToast('Invalid Backup File', 'error');
        }
      };
      reader.readAsText(this.importFile);
    }
  }

  confirmClear() {
    this.isConfirmClearOpen = true;
  }

  onClearConfirmed() {
    this.dataService.clearAllData();
    this.isConfirmClearOpen = false;
    this.showToast('All Data Cleared', 'success');
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = '';
    }, 3000);
  }
}
