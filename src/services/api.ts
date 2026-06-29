// API calls and external services

export async function fetchMockData() {
  return new Promise((resolve) => setTimeout(() => resolve({ status: 'success' }), 1000));
}
