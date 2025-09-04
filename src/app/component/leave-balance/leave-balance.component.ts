// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-leave-balance',
//   standalone: true, // ✅ Make it standalone
//   imports: [CommonModule, FormsModule], // ✅ These are statically analyzable
//   templateUrl: './leave-balance.component.html',
//   styleUrls: ['./leave-balance.component.scss']
// })
// export class LeaveBalanceComponent {
//   leaveTypes = [
//     { name: 'Vacation', icon: 'umbrella-beach', days: 15, color: 'vacation' },
//     { name: 'Sick Leave', icon: 'procedures', days: 10, color: 'sick' },
//     { name: 'Personal Days', icon: 'user-clock', days: 5, color: 'personal' }
//   ];
//   selectedPeriod = 'This Year';
// }

// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { LeaveService } from '../../../app/pages/leave-apply/services/leave.service'; // Adjust path as needed
// import { LeaveType, LeaveBalance } from '../../../app/pages/leave-apply/models/leave.models'; // Adjust path as needed
// import { AuthService } from '../../../app/services/auth.service'; // Adjust path as needed

// @Component({
//   selector: 'app-leave-balance',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './leave-balance.component.html',
//   styleUrls: ['./leave-balance.component.scss']
// })
// export class LeaveBalanceComponent implements OnInit {
  
//   // Data from API
//   leaveTypes: LeaveType[] = [];
//   leaveBalances: LeaveBalance[] = [];
  
//   // Combined data for display
//   leaveBalanceData: any[] = [];
  
//   // Period selection
//   selectedPeriod = 'This Year';
//   selectedYear: number;
  
//   // Loading and error states
//   isLoading = false;
//   error: string | null = null;
  
//   // Current user email
//   currentUserEmail: string = '';
  
//   // Icon mapping for different leave types
//   private leaveIconMap: { [key: string]: string } = {
//     'C': 'calendar-day',        // Casual leave
//     'A': 'umbrella-beach',      // Annual leave  
//     'M': 'procedures',          // Medical leave
//     'Casual': 'calendar-day',
//     'Annual': 'umbrella-beach',
//     'Medical': 'procedures'
//   };
  
//   // Color class mapping for different leave types
//   private leaveColorMap: { [key: string]: string } = {
//     'C': 'casual',
//     'A': 'annual', 
//     'M': 'medical',
//     'Casual': 'casual',
//     'Annual': 'annual',
//     'Medical': 'medical'
//   };

//   constructor(
//     private leaveService: LeaveService,
//     private authService: AuthService
//   ) {
//     this.selectedYear = new Date().getFullYear();
//   }

//   ngOnInit() {
//     // Get current user email
//     const user = this.authService.getUser();
//     if (user) {
//       this.currentUserEmail = user.emailAddress;
//     }
    
//     // Load data
//     this.loadLeaveData();
//   }

//   loadLeaveData() {
//     this.isLoading = true;
//     this.error = null;

//     // Load both leave types and balances
//     Promise.all([
//       this.loadLeaveTypes(),
//       this.loadLeaveBalances()
//     ]).then(() => {
//       this.combineLeaveData();
//       this.isLoading = false;
//     }).catch(error => {
//       console.error('Error loading leave data:', error);
//       this.error = 'Failed to load leave data. Please try again.';
//       this.isLoading = false;
//     });
//   }

//   private loadLeaveTypes(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       this.leaveService.getLeaveTypes().subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.leaveTypes = response.data || [];
//             resolve();
//           } else {
//             reject(response.message || 'Failed to load leave types');
//           }
//         },
//         error: (error) => {
//           console.error('Error loading leave types:', error);
//           reject('Failed to load leave types');
//         }
//       });
//     });
//   }

//   private loadLeaveBalances(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       this.leaveService.getLeaveBalances(this.currentUserEmail, this.selectedYear).subscribe({
//         next: (response) => {
//           if (response.success) {
//             this.leaveBalances = response.data || [];
//             resolve();
//           } else {
//             reject(response.message || 'Failed to load leave balances');
//           }
//         },
//         error: (error) => {
//           console.error('Error loading leave balances:', error);
//           reject('Failed to load leave balances');
//         }
//       });
//     });
//   }

//   private combineLeaveData() {
//     this.leaveBalanceData = [];
    
//     // Create a map of leave balances by leave type
//     const balanceMap: { [key: string]: LeaveBalance } = {};
//     this.leaveBalances.forEach(balance => {
//       balanceMap[balance.leaveType] = balance;
//     });

//     // Combine leave types with their balances
//     this.leaveTypes.forEach(type => {
//       const balance = balanceMap[type.leaveType];
      
//       this.leaveBalanceData.push({
//         leaveType: type.leaveType,
//         name: type.leaveTypeName,
//         icon: this.getLeaveIcon(type.leaveType),
//         color: this.getLeaveColorClass(type.leaveType),
//         backgroundColor: type.leaveColor || '#6366f1', // Use API color or default
//         availableDays: balance?.availableLeave || 0,
//         entitledDays: balance?.entitledLeave || 0,
//         takenDays: balance?.takenLeaves || 0,
//         requestedDays: balance?.requestedLeave || 0,
//         rejectedDays: balance?.rejectedLeave || 0
//       });
//     });
//   }

//   private getLeaveIcon(leaveType: string): string {
//     return this.leaveIconMap[leaveType] || 'calendar-alt';
//   }

//   private getLeaveColorClass(leaveType: string): string {
//     return this.leaveColorMap[leaveType] || 'default';
//   }

//   onPeriodChange() {
//     // Update selected year based on period
//     const currentYear = new Date().getFullYear();
    
//     switch (this.selectedPeriod) {
//       case 'This Year':
//         this.selectedYear = currentYear;
//         break;
//       case 'Last Year':
//         this.selectedYear = currentYear - 1;
//         break;
//       default:
//         this.selectedYear = currentYear;
//     }
    
//     // Reload data for the selected period
//     this.loadLeaveData();
//   }

//   retryLoad() {
//     this.loadLeaveData();
//   }

//   // Get progress percentage for visual indication
//   getUsagePercentage(item: any): number {
//     if (item.entitledDays === 0) return 0;
//     return Math.min((item.takenDays / item.entitledDays) * 100, 100);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeaveService } from '../../../app/pages/leave-apply/services/leave.service'; // Adjust path as needed
import { LeaveType, LeaveBalance } from '../../../app/pages/leave-apply/models/leave.models'; // Adjust path as needed
import { AuthService } from '../../../app/services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-balance.component.html',
  styleUrls: ['./leave-balance.component.scss']
})
export class LeaveBalanceComponent implements OnInit {
  
  // Data from API
  leaveTypes: LeaveType[] = [];
  leaveBalances: LeaveBalance[] = [];
  
  // Combined data for display
  leaveBalanceData: any[] = [];
  
  // Period selection
  selectedPeriod = 'This Year';
  selectedYear: number;
  
  // Loading and error states
  isLoading = false;
  error: string | null = null;
  
  // Current user email
  currentUserEmail: string = '';
  
  // Icon mapping for different leave types
  private leaveIconMap: { [key: string]: string } = {
    'C': 'calendar-day',        // Casual leave
    'A': 'umbrella-beach',      // Annual leave  
    'M': 'procedures',          // Medical leave
    'Casual': 'calendar-day',
    'Annual': 'umbrella-beach',
    'Medical': 'procedures'
  };
  
 

  constructor(
    private leaveService: LeaveService,
    private authService: AuthService
  ) {
    this.selectedYear = new Date().getFullYear();
  }

  ngOnInit() {
    // Get current user email
    const user = this.authService.getUser();
    if (user) {
      this.currentUserEmail = user.emailAddress;
    }
    
    // Load data
    this.loadLeaveData();
  }

  loadLeaveData() {
    this.isLoading = true;
    this.error = null;

    // Load both leave types and balances
    Promise.all([
      this.loadLeaveTypes(),
      this.loadLeaveBalances()
    ]).then(() => {
      this.combineLeaveData();
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading leave data:', error);
      this.error = 'Failed to load leave data. Please try again.';
      this.isLoading = false;
    });
  }

  private loadLeaveTypes(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.leaveService.getLeaveTypes().subscribe({
        next: (response) => {
          if (response.success) {
            this.leaveTypes = response.data || [];
            resolve();
          } else {
            reject(response.message || 'Failed to load leave types');
          }
        },
        error: (error) => {
          console.error('Error loading leave types:', error);
          reject('Failed to load leave types');
        }
      });
    });
  }

  private loadLeaveBalances(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.leaveService.getLeaveBalances(this.currentUserEmail, this.selectedYear).subscribe({
        next: (response) => {
          if (response.success) {
            this.leaveBalances = response.data || [];
            resolve();
          } else {
            reject(response.message || 'Failed to load leave balances');
          }
        },
        error: (error) => {
          console.error('Error loading leave balances:', error);
          reject('Failed to load leave balances');
        }
      });
    });
  }

  private combineLeaveData() {
    this.leaveBalanceData = [];
    
    // Create a map of leave balances by leave type
    const balanceMap: { [key: string]: LeaveBalance } = {};
    this.leaveBalances.forEach(balance => {
      balanceMap[balance.leaveType] = balance;
    });

    // Combine leave types with their balances
    this.leaveTypes.forEach(type => {
      const balance = balanceMap[type.leaveType];
      
       const baseColor = type.leaveColor || '#6366f1';
       
      this.leaveBalanceData.push({
        leaveType: type.leaveType,
        name: type.leaveTypeName,
        icon: this.getLeaveIcon(type.leaveType),
        backgroundColor: baseColor,
        lightColor1: this.hexToRgba(baseColor, 0.1),
        lightColor2: this.hexToRgba(baseColor, 0.25),// Use API color or default
        availableDays: balance?.availableLeave || 0,
        entitledDays: balance?.entitledLeave || 0,
        takenDays: balance?.takenLeaves || 0,
        requestedDays: balance?.requestedLeave || 0,
        rejectedDays: balance?.rejectedLeave || 0
      });
    });
  }

  private getLeaveIcon(leaveType: string): string {
    return this.leaveIconMap[leaveType] || 'calendar-alt';
  }

  private hexToRgba(hex: string, alpha: number): string {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16);
      g = parseInt(hex[3] + hex[4], 16);
      b = parseInt(hex[5] + hex[6], 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }

  onPeriodChange() {
    // Update selected year based on period
    const currentYear = new Date().getFullYear();
    
    switch (this.selectedPeriod) {
      case 'This Year':
        this.selectedYear = currentYear;
        break;
      case 'Last Year':
        this.selectedYear = currentYear - 1;
        break;
      default:
        this.selectedYear = currentYear;
    }
    
    // Reload data for the selected period
    this.loadLeaveData();
  }

  retryLoad() {
    this.loadLeaveData();
  }

  // Get progress percentage for visual indication
  getUsagePercentage(item: any): number {
    if (item.entitledDays === 0) return 0;
    return Math.min((item.takenDays / item.entitledDays) * 100, 100);
  }
}