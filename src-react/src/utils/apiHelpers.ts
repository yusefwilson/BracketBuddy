import type { ApiResponse } from '../../../src-shared/types';

/**
 * Safely handles an API call with automatic error extraction
 * Returns [data, error] tuple
 */
export async function safeApiCall<T>(
    apiCall: Promise<ApiResponse<T>>
): Promise<[T | null, string | null]> {
    try {
        const response = await apiCall;

        if (response.success && response.data !== undefined) {
            return [response.data, null];
        }

        if (response.error) {
            return [null, response.error.message];
        }

        return [null, 'An unexpected error occurred'];
    } catch (error) {
        console.error('API call failed:', error);
        return [null, error instanceof Error ? error.message : 'An unexpected error occurred'];
    }
}
