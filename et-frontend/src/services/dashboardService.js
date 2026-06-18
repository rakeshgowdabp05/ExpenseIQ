import { apiClient } from "../api/apiClient";

const DASHBOARD_ENDPOINT = "/dashboard";

export async function getDashboard() {
const response = await apiClient.get(
DASHBOARD_ENDPOINT,
);

return response.data?.data ?? response.data;
}