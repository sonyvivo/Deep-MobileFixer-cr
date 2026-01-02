import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Privacy Mode (Existing)
  private privacyModeSubject = new BehaviorSubject<boolean>(true); // Default hidden
  privacyMode$ = this.privacyModeSubject.asObservable();
  private currentPin = '1234';

  // Privacy Auto-Hide
  private privacyTimeout: any;
  private readonly PRIVACY_LIMIT = 60 * 1000; // 60 seconds

  // Login Authentication (New)
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private readonly ADMIN_USER = 'kuldeepgupta577';
  private readonly ADMIN_PASS = 'Deep@1122';

  // Auto Logout
  private idleTimeout: any;
  private readonly IDLE_LIMIT = 5 * 60 * 1000; // 5 minutes
  private eventListener = () => this.resetTimer();

  constructor(
    private router: Router,
    private zone: NgZone
  ) {
    // Check for saved login state
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      this.isAuthenticatedSubject.next(true);
      this.startIdleTimer();
    }

    // Initial PIN load
    const savedPin = localStorage.getItem('appPin');
    if (savedPin) this.currentPin = savedPin;
  }

  // --- Login Logic ---
  login(username: string, pass: string): boolean {
    if (username === this.ADMIN_USER && pass === this.ADMIN_PASS) {
      this.isAuthenticatedSubject.next(true);
      localStorage.setItem('isLoggedIn', 'true');
      this.startIdleTimer();
      return true;
    }
    return false;
  }

  logout() {
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('isLoggedIn');
    this.forcePrivacy(); // Hide sensitive data on logout
    this.stopIdleTimer();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  // --- Auto Logout Logic ---
  private startIdleTimer() {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.eventListener);
      window.addEventListener('mousedown', this.eventListener);
      window.addEventListener('keypress', this.eventListener);
      window.addEventListener('touchmove', this.eventListener);
      window.addEventListener('scroll', this.eventListener);
    });
    this.resetTimer();
  }

  private stopIdleTimer() {
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    window.removeEventListener('mousemove', this.eventListener);
    window.removeEventListener('mousedown', this.eventListener);
    window.removeEventListener('keypress', this.eventListener);
    window.removeEventListener('touchmove', this.eventListener);
    window.removeEventListener('scroll', this.eventListener);
  }

  private resetTimer() {
    if (this.idleTimeout) clearTimeout(this.idleTimeout);

    this.zone.runOutsideAngular(() => {
      this.idleTimeout = setTimeout(() => {
        this.zone.run(() => {
          this.logout();
        });
      }, this.IDLE_LIMIT);
    });
  }

  // --- Privacy Mode Logic ---
  isPrivacyEnabled() {
    return this.privacyModeSubject.value;
  }

  togglePrivacy(inputPin?: string): boolean {
    if (this.privacyModeSubject.value) {
      // Trying to unhide
      if (inputPin === this.currentPin) {
        this.privacyModeSubject.next(false);
        this.startPrivacyTimer();
        return true;
      }
      return false;
    } else {
      // Trying to hide
      this.forcePrivacy();
      return true;
    }
  }

  forcePrivacy() {
    this.privacyModeSubject.next(true);
    this.clearPrivacyTimer();
  }

  private startPrivacyTimer() {
    this.clearPrivacyTimer();
    this.zone.runOutsideAngular(() => {
      this.privacyTimeout = setTimeout(() => {
        this.zone.run(() => {
          this.forcePrivacy();
        });
      }, this.PRIVACY_LIMIT);
    });
  }

  private clearPrivacyTimer() {
    if (this.privacyTimeout) {
      clearTimeout(this.privacyTimeout);
      this.privacyTimeout = null;
    }
  }

  verifyPin(pin: string): boolean {
    return pin === this.currentPin;
  }

  changePin(oldPin: string, newPin: string): boolean {
    if (oldPin === this.currentPin) {
      this.currentPin = newPin;
      localStorage.setItem('appPin', newPin);
      return true;
    }
    return false;
  }
}
