import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
// Optional: You can use the ChartService from services/chart.service.ts instead of HttpClient directly
// import { ChartService, Chart } from '../services/chart.service';

// ⚠️ CRITICAL WARNING: DO NOT USE AI TOOLS
// This assessment must be completed WITHOUT using AI tools such as Cursor, ChatGPT,
// GitHub Copilot, or any other AI coding assistants.
// If you use AI tools to complete this assessment, you will FAIL.

// TODO: Task 1 - Implement this component
// Requirements:
// 1. Fetch astrological charts from the API endpoint: GET /api/charts
// 2. Display the charts in a visually appealing card layout
// 3. Each card should show:
//    - Chart name
//    - Birth date, time, and location
//    - Sun sign, Moon sign, and Rising sign
//    - List of planets with their signs and degrees
// 4. Add loading state while fetching data
// 5. Handle error states gracefully
// 6. Make it responsive for mobile devices
// 7. Add some styling to make it look modern and professional
//
// Note: A ChartService is available in services/chart.service.ts if you prefer to use it

interface Planet {
  sign: string;
  degree: number;
}

interface Chart {
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
  count: number;
  total: number;
  page: number;
  pages: number;
  data: Chart[];
}

@Component({
  selector: 'app-task1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task1-container">
      <h2>Astrological Charts</h2>

      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading charts...</p>
      </div>

      <div *ngIf="error && !loading" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button (click)="loadCharts()" class="retry-button">Retry</button>
      </div>

      <div *ngIf="!loading && !error && charts.length === 0" class="empty-container">
        <p>No charts available</p>
      </div>

      <div *ngIf="!loading && !error && charts.length > 0" class="charts-grid">
        <div *ngFor="let chart of charts" class="chart-card">
          <div class="card-header">
            <h3>{{ chart.name }}</h3>
          </div>

          <div class="card-section">
            <h4>Birth Information</h4>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">{{ chart.birthDate | date:'mediumDate' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">{{ chart.birthTime }}</span>
            </div>
            <div class="info-row">
              <span class="label">Location:</span>
              <span class="value">{{ chart.birthLocation }}</span>
            </div>
          </div>

          <div class="card-section">
            <h4>Primary Signs</h4>
            <div class="signs-container">
              <div class="sign-item">
                <span class="sign-icon">☉</span>
                <span class="sign-label">Sun:</span>
                <span class="sign-value">{{ chart.sunSign }}</span>
              </div>
              <div class="sign-item">
                <span class="sign-icon">☽</span>
                <span class="sign-label">Moon:</span>
                <span class="sign-value">{{ chart.moonSign }}</span>
              </div>
              <div class="sign-item">
                <span class="sign-icon">↑</span>
                <span class="sign-label">Rising:</span>
                <span class="sign-value">{{ chart.risingSign }}</span>
              </div>
            </div>
          </div>

          <div class="card-section">
            <h4>Planetary Positions</h4>
            <div class="planets-list">
              <div *ngFor="let planet of getPlanetEntries(chart.planets)" class="planet-item">
                <span class="planet-name">{{ planet.name }}</span>
                <span class="planet-details">{{ planet.data.sign }} {{ planet.data.degree }}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task1-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
      font-size: 2rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #666;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      margin: 2rem 0;
    }

    .error-message {
      color: #c33;
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .retry-button {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s;
    }

    .retry-button:hover {
      background: #5568d3;
    }

    .empty-container {
      text-align: center;
      padding: 3rem;
      color: #999;
      font-size: 1.1rem;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    @media (min-width: 768px) {
      .charts-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .charts-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 1.5rem;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .chart-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .card-header h3 {
      margin: 0 0 1rem 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .card-section {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .card-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .card-section h4 {
      margin: 0 0 0.75rem 0;
      color: #667eea;
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-row {
      display: flex;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .info-row .label {
      font-weight: 500;
      color: #666;
      width: 80px;
    }

    .info-row .value {
      color: #333;
    }

    .signs-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sign-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .sign-icon {
      font-size: 1.2rem;
      width: 24px;
    }

    .sign-label {
      font-weight: 500;
      color: #666;
      width: 60px;
    }

    .sign-value {
      color: #333;
      font-weight: 600;
    }

    .planets-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .planet-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .planet-name {
      font-weight: 500;
      color: #333;
      text-transform: capitalize;
    }

    .planet-details {
      color: #666;
    }
  `]
})
export class Task1Component implements OnInit {
  charts: Chart[] = [];
  loading: boolean = false;
  error: string | null = null;
  page: number = 1;
  totalPages: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCharts();
  }

  loadCharts() {
    this.loading = true;
    this.error = null;

    this.http.get<ApiResponse>('/api/charts').subscribe({
      next: (response: ApiResponse) => {
        if (response.success) {
          this.charts = response.data;
          this.totalPages = response.pages;
          this.page = response.page;
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load charts. Please try again.';
        this.loading = false;
        console.error('Error loading charts:', err);
      }
    });
  }

  getPlanetEntries(planets: Chart['planets']): Array<{name: string, data: Planet}> {
    return Object.entries(planets)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        data: value as Planet
      }));
  }
}
