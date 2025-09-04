import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss']
})
export class QuickActionsComponent {
  @Output() requestLeave = new EventEmitter<void>();
  @Output() checkBalance = new EventEmitter<void>();
  @Output() generateReport = new EventEmitter<void>();
  @Output() openSettings = new EventEmitter<void>();

  onRequestLeave() {
    this.requestLeave.emit();
  }

  onCheckBalance() {
    this.checkBalance.emit();
  }

  onGenerateReport() {
    this.generateReport.emit();
  }

  onOpenSettings() {
    this.openSettings.emit();
  }
}