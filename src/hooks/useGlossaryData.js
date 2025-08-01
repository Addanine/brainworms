// src/hooks/useGlossaryData.js
import { useState, useEffect } from 'react';
import { glossaryService } from '../services/glossaryService';

export default function useGlossaryData() {
    const [data, setData] = useState({
        categories: [],
        termMap: new Map(),
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            try {
                // We don't need to call loadData explicitly; the service handles it.
                const [categories, termMap] = await Promise.all([
                    glossaryService.getCategories(),
                    glossaryService.getTermMap(),
                ]);
                if (isMounted) {
                    setData({ categories, termMap });
                }
            } catch (err) {
                console.error("Failed to load glossary data:", err);
                if (isMounted) {
                    setError(err);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchData();

        // Cleanup function to prevent state updates on an unmounted component.
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array ensures this effect runs only once.

    return { ...data, isLoading, error };
}