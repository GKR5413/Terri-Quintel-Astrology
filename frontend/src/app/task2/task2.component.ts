import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
// Optional: You can use the ChartService from services/chart.service.ts instead of HttpClient directly
// import { ChartService, Chart, CalculateChartRequest } from '../services/chart.service';

// ⚠️ CRITICAL WARNING: DO NOT USE AI TOOLS
// This assessment must be completed WITHOUT using AI tools such as Cursor, ChatGPT,
// GitHub Copilot, or any other AI coding assistants.
// If you use AI tools to complete this assessment, you will FAIL.

// TODO: Task 2 - Implement this component
// Requirements:
// 1. Create a form with the following fields:
//    - Birth Date (date picker)
//    - Birth Time (time input)
//    - Birth Location (text input)
// 2. Validate all fields are required
// 3. On form submission, send POST request to /api/charts/calculate
// 4. Display the calculated chart result in a nice format
// 5. Show loading state during API call
// 6. Handle errors appropriately
// 7. Reset form after successful submission
// 8. Add form validation messages
// 9. Make the form responsive and user-friendly
//
// Note: A ChartService is available in services/chart.service.ts if you prefer to use it

interface Planet {
  sign: string;
  degree: number;
}

interface ChartResult {
  _id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  planets: {
    sun: Planet;
    moon: Planet;
    mercury: Planet;
    venus: Planet;
    mars: Planet;
    jupiter?: Planet;
    saturn?: Planet;
    uranus?: Planet;
    neptune?: Planet;
    pluto?: Planet;
  };
  notes?: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  success: boolean;
  data: ChartResult;
}

@Component({
  selector: 'app-task2',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="task2-container">
      <h2>Birth Chart Calculator</h2>

      <div *ngIf="error && !loading" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button (click)="error = null" class="close-button">×</button>
      </div>

      <div *ngIf="!calculatedChart" class="form-section">
        <form [formGroup]="chartForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="birthDate">Birth Date</label>
            <input
              type="date"
              id="birthDate"
              formControlName="birthDate"
              [class.invalid]="isFieldInvalid('birthDate')"
            />
            <div *ngIf="isFieldInvalid('birthDate')" class="validation-message">
              Birth date is required
            </div>
          </div>

          <div class="form-group">
            <label for="birthTime">Birth Time</label>
            <input
              type="time"
              id="birthTime"
              formControlName="birthTime"
              [class.invalid]="isFieldInvalid('birthTime')"
            />
            <div *ngIf="isFieldInvalid('birthTime')" class="validation-message">
              Birth time is required
            </div>
          </div>

          <div class="form-group">
            <label for="birthLocation">Birth Location</label>
            <input
              type="text"
              id="birthLocation"
              formControlName="birthLocation"
              placeholder="e.g., New York, NY"
              [class.invalid]="isFieldInvalid('birthLocation')"
            />
            <div *ngIf="isFieldInvalid('birthLocation')" class="validation-message">
              <span *ngIf="chartForm.get('birthLocation')?.hasError('required')">
                Birth location is required
              </span>
              <span *ngIf="chartForm.get('birthLocation')?.hasError('minlength')">
                Location must be at least 2 characters
              </span>
            </div>
          </div>

          <button
            type="submit"
            class="submit-button"
            [disabled]="loading"
          >
            <span *ngIf="!loading">Calculate Chart</span>
            <span *ngIf="loading" class="loading-text">
              <span class="spinner-small"></span>
              Calculating...
            </span>
          </button>
        </form>
      </div>

      <div *ngIf="calculatedChart && !loading" class="result-section">
        <div class="result-header">
          <h3>Your Birth Chart</h3>
        </div>

        <div class="result-card">
          <div class="result-section-block">
            <h4>Birth Information</h4>
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">{{ calculatedChart.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">{{ calculatedChart.birthDate | date:'mediumDate' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">{{ calculatedChart.birthTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">Location:</span>
              <span class="value">{{ calculatedChart.birthLocation }}</span>
            </div>
          </div>

          <div class="result-section-block">
            <h4>Primary Signs</h4>
            <div class="signs-grid">
              <div class="sign-card sun">
                <span class="sign-icon">☉</span>
                <div class="sign-content">
                  <span class="sign-label">Sun Sign</span>
                  <span class="sign-value">{{ calculatedChart.sunSign }}</span>
                </div>
              </div>
              <div class="sign-card moon">
                <span class="sign-icon">☽</span>
                <div class="sign-content">
                  <span class="sign-label">Moon Sign</span>
                  <span class="sign-value">{{ calculatedChart.moonSign }}</span>
                </div>
              </div>
              <div class="sign-card rising">
                <span class="sign-icon">↑</span>
                <div class="sign-content">
                  <span class="sign-label">Rising Sign</span>
                  <span class="sign-value">{{ calculatedChart.risingSign }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="result-section-block">
            <h4>Planetary Positions</h4>
            <div class="planets-table">
              <div *ngFor="let planet of getPlanetEntries(calculatedChart.planets)" class="planet-row">
                <span class="planet-name">{{ planet.name }}</span>
                <span class="planet-sign">{{ planet.data.sign }}</span>
                <span class="planet-degree">{{ planet.data.degree }}°</span>
              </div>
            </div>
          </div>
        </div>

        <button (click)="resetForm()" class="calculate-another-button">
          Calculate Another Chart
        </button>
      </div>
    </div>
  `,
  styles: [`
    .task2-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
      font-size: 2rem;
    }

    .error-container {
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .error-message {
      color: #c33;
      margin: 0;
      font-weight: 500;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #c33;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      color: #a22;
    }

    .form-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #333;
      font-weight: 500;
      font-size: 0.95rem;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input.invalid {
      border-color: #f44;
    }

    .validation-message {
      color: #f44;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .submit-button {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 1rem;
    }

    .submit-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .result-section {
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .result-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .result-header h3 {
      color: #667eea;
      font-size: 1.8rem;
      margin: 0;
    }

    .result-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      margin-bottom: 1.5rem;
    }

    .result-section-block {
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #eee;
    }

    .result-section-block:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .result-section-block h4 {
      margin: 0 0 1rem 0;
      color: #667eea;
      font-size: 1.1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-row {
      display: flex;
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
    }

    .info-row .label {
      font-weight: 600;
      color: #666;
      width: 100px;
    }

    .info-row .value {
      color: #333;
    }

    .signs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .sign-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: #f8f9fa;
    }

    .sign-card.sun {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    .sign-card.moon {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    .sign-card.rising {
      background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
    }

    .sign-icon {
      font-size: 2rem;
    }

    .sign-content {
      display: flex;
      flex-direction: column;
    }

    .sign-label {
      font-size: 0.85rem;
      color: #666;
      font-weight: 500;
    }

    .sign-value {
      font-size: 1.2rem;
      color: #333;
      font-weight: 600;
    }

    .planets-table {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .planet-row {
      display: grid;
      grid-template-columns: 1fr 1fr 80px;
      gap: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;
      align-items: center;
    }

    .planet-name {
      font-weight: 600;
      color: #333;
      text-transform: capitalize;
    }

    .planet-sign {
      color: #666;
    }

    .planet-degree {
      color: #667eea;
      font-weight: 600;
      text-align: right;
    }

    .calculate-another-button {
      width: 100%;
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .calculate-another-button:hover {
      background: #667eea;
      color: white;
    }

    @media (max-width: 768px) {
      .task2-container {
        padding: 1rem;
      }

      .form-section,
      .result-card {
        padding: 1.5rem;
      }

      .signs-grid {
        grid-template-columns: 1fr;
      }

      .planet-row {
        grid-template-columns: 1fr 1fr 60px;
        gap: 0.5rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class Task2Component {
  chartForm!: FormGroup;
  loading: boolean = false;
  error: string | null = null;
  calculatedChart: ChartResult | null = null;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.chartForm = this.fb.group({
      birthDate: ['', [Validators.required]],
      birthTime: ['', [Validators.required]],
      birthLocation: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.chartForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    const formValues = this.chartForm.value;
    const requestBody = {
      birthDate: formValues.birthDate,
      birthTime: formValues.birthTime,
      birthLocation: formValues.birthLocation
    };

    this.http.post<ApiResponse>('/api/charts/calculate', requestBody).subscribe({
      next: (response: ApiResponse) => {
        if (response.success) {
          this.calculatedChart = response.data;
          this.chartForm.reset();
          this.submitted = false;
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to calculate chart. Please try again.';
        this.loading = false;
        console.error('Error calculating chart:', err);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.chartForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty || this.submitted));
  }

  resetForm() {
    this.calculatedChart = null;
    this.chartForm.reset();
    this.submitted = false;
    this.error = null;
  }

  getPlanetEntries(planets: ChartResult['planets']): Array<{name: string, data: Planet}> {
    return Object.entries(planets)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        data: value as Planet
      }));
  }
}
