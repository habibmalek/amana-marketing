export {};

declare global {
  interface Window {
    L: any;
  }
  
  interface HTMLElement {
    _leaflet_id?: number;
  }
}
