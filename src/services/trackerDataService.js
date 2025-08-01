// src/services/trackerDataService.js

class TrackerDataService {
    constructor() {
        this.lgbtData = null;
        this.r4tranData = null;
        this.processedData = null;
        this.isLoaded = false;
    }

    async loadData() {
        // Force reload for debugging
        // if (this.isLoaded) return this.processedData;
        
        try {
            console.log('Loading CSV datasets (using stratified samples across all years)...');
            
            // Use smaller sample files for browser performance
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                console.log('CSV loading timeout - falling back to mock data');
                controller.abort();
            }, 10000); // 10 second timeout
            
            const [lgbtResponse, r4tranResponse] = await Promise.all([
                fetch('/datasets/lgbt_stratified.csv', { signal: controller.signal }).catch(e => {
                    console.warn('Failed to fetch LGBT stratified sample:', e.message);
                    return null;
                }),
                fetch('/datasets/r4tran_stratified.csv', { signal: controller.signal }).catch(e => {
                    console.warn('Failed to fetch 4tran stratified sample:', e.message);
                    return null;
                })
            ]);
            
            clearTimeout(timeoutId);

            if (lgbtResponse && lgbtResponse.ok) {
                console.log('Successfully fetched /lgbt/ CSV');
                const lgbtText = await lgbtResponse.text();
                console.log(`CSV text length: ${lgbtText.length} characters`);
                this.lgbtData = this.parseCSV(lgbtText, 'lgbt');
                console.log(`Loaded ${this.lgbtData.length} /lgbt/ posts`);
                if (this.lgbtData.length > 0) {
                    console.log('Sample /lgbt/ record:', this.lgbtData[0]);
                }
            } else {
                console.log('Failed to fetch /lgbt/ dataset - using mock data');
                this.lgbtData = this.generateMockLgbtData();
            }

            if (r4tranResponse && r4tranResponse.ok) {
                console.log('Successfully fetched r/4tran4 CSV');
                const r4tranText = await r4tranResponse.text();
                console.log(`CSV text length: ${r4tranText.length} characters`);
                this.r4tranData = this.parseCSV(r4tranText, 'r4tran');
                console.log(`Loaded ${this.r4tranData.length} r/4tran4 comments`);
                if (this.r4tranData.length > 0) {
                    console.log('Sample r/4tran4 record:', this.r4tranData[0]);
                }
            } else {
                console.log('Failed to fetch r/4tran4 dataset - using mock data');
                this.r4tranData = this.generateMockR4tranData();
            }

            // Process the data for analysis
            this.processedData = this.processData();
            this.isLoaded = true;
            
            return this.processedData;
        } catch (error) {
            console.error('Error loading datasets:', error);
            console.log('Falling back to mock data for demonstration');
            // Fall back to mock data
            this.lgbtData = this.generateMockLgbtData();
            this.r4tranData = this.generateMockR4tranData();
            this.processedData = this.processData();
            this.isLoaded = true;
            return this.processedData;
        }
    }

    parseCSV(csvText, source) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const data = [];

        console.log(`Parsing ${source} CSV with headers:`, headers);

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') continue;
            
            const values = this.parseCSVLine(lines[i]);
            if (values.length >= headers.length - 1) { // Allow some flexibility
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                
                // Convert timestamp to proper format
                if (row.timestamp) {
                    // Handle both Unix timestamp and ISO string
                    const timestamp = parseInt(row.timestamp);
                    if (!isNaN(timestamp)) {
                        row.timestamp = new Date(timestamp * 1000).toISOString();
                    }
                }
                
                row._source = source;
                data.push(row);
            }
        }

        console.log(`Parsed ${data.length} ${source} records`);
        return data;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Handle escaped quotes
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.replace(/^"|"$/g, '').trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.replace(/^"|"$/g, '').trim());
        return result;
    }

    generateMockLgbtData() {
        const mockTerms = ['hon', 'pooner', 'boymoder', 'gigahon', 'passoid', 'repressor', 'youngshit', 'midshit'];
        const mockData = [];
        const startDate = new Date('2023-01-01');
        const endDate = new Date('2024-12-31');
        
        for (let i = 0; i < 1000; i++) {
            const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            const randomTerm = mockTerms[Math.floor(Math.random() * mockTerms.length)];
            
            mockData.push({
                timestamp: randomDate.toISOString(),
                text: `Anonymous post mentioning ${randomTerm} and other discussion...`,
                thread_id: `thread${Math.floor(Math.random() * 100)}`,
                post_id: `post${i}`,
                is_op: Math.random() < 0.1,
                thread_subject: Math.random() < 0.3 ? 'General Thread' : '',
                _source: 'lgbt'
            });
        }
        
        return mockData;
    }

    generateMockR4tranData() {
        const mockTerms = ['hon', 'pooner', 'boymoder', 'gigahon', 'passoid', 'repressor', 'youngshit', 'midshit'];
        const mockData = [];
        const startDate = new Date('2023-01-01');
        const endDate = new Date('2024-12-31');
        
        for (let i = 0; i < 800; i++) {
            const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            const randomTerm = mockTerms[Math.floor(Math.random() * mockTerms.length)];
            
            mockData.push({
                timestamp: randomDate.toISOString(),
                text: `Reddit comment discussing ${randomTerm} and related topics...`,
                type: 'comment',
                id: `r4tran_${i}`,
                author: `user${Math.floor(Math.random() * 50)}`,
                is_deleted: Math.random() < 0.1,
                score: Math.floor(Math.random() * 20) - 5,
                _source: 'r4tran'
            });
        }
        
        return mockData;
    }

    processData() {
        if (!this.lgbtData || !this.r4tranData) return null;

        // Combine datasets
        const allData = [...this.lgbtData, ...this.r4tranData];
        
        // Get date range
        const dates = allData
            .map(item => new Date(item.timestamp))
            .filter(date => !isNaN(date))
            .sort((a, b) => a - b);
        
        const dateRange = dates.length > 0 
            ? `${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}`
            : 'No data available';

        // Basic statistics
        const processed = {
            totalPosts: this.lgbtData.length,
            totalComments: this.r4tranData.length,
            dateRange: dateRange,
            startDate: dates[0],
            endDate: dates[dates.length - 1],
            allData: allData
        };

        return processed;
    }

    async getTermFrequencyOverTime(termList = ['hon', 'pooner', 'boymoder', 'gigahon'], platforms = ['lgbt', 'r4tran']) {
        const data = await this.loadData();
        if (!data) return null;

        const monthlyTotals = {};
        
        // Group data by month
        data.allData.forEach(item => {
            const date = new Date(item.timestamp);
            if (isNaN(date)) return;
            
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const text = (item.text || '').toLowerCase();
            const platform = item._source === 'lgbt' ? 'lgbt' : 'r4tran';
            
            // Skip if this platform is not selected
            if (!platforms.includes(platform)) return;
            
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = {};
                termList.forEach(term => {
                    monthlyTotals[monthKey][term] = { lgbt: 0, r4tran: 0 };
                });
            }
            
            termList.forEach(term => {
                if (text.includes(term.toLowerCase())) {
                    monthlyTotals[monthKey][term][platform]++;
                }
            });
        });

        // Convert to chart-friendly format with platform separation
        const chartData = [];
        Object.keys(monthlyTotals).sort().forEach(monthKey => {
            const [year, month] = monthKey.split('-');
            const dataPoint = {
                date: new Date(parseInt(year), parseInt(month) - 1, 1),
                month: monthKey
            };
            
            termList.forEach(term => {
                if (platforms.includes('lgbt')) {
                    dataPoint[`${term}_lgbt`] = monthlyTotals[monthKey][term]?.lgbt || 0;
                }
                if (platforms.includes('r4tran')) {
                    dataPoint[`${term}_r4tran`] = monthlyTotals[monthKey][term]?.r4tran || 0;
                }
                // Combined total (for backwards compatibility)
                dataPoint[term] = (monthlyTotals[monthKey][term]?.lgbt || 0) + (monthlyTotals[monthKey][term]?.r4tran || 0);
            });
            
            chartData.push(dataPoint);
        });

        return chartData;
    }

    async getBasicStats() {
        const data = await this.loadData();
        return {
            totalPosts: data?.totalPosts || 0,
            totalComments: data?.totalComments || 0,
            dateRange: data?.dateRange || 'Loading...'
        };
    }

    async getCrossplatformAnalysis() {
        const data = await this.loadData();
        if (!data) return null;

        // Analyze terms that appear on both platforms
        const lgbtTerms = new Set();
        const r4tranTerms = new Set();
        
        // This would need more sophisticated NLP in real implementation
        // For now, return mock analysis structure
        return {
            sharedTerms: ['hon', 'pooner', 'boymoder'],
            lgbtOnlyTerms: ['gigahon', 'passoid'],
            r4tranOnlyTerms: ['cope', 'seethe'],
            migrationPatterns: []
        };
    }
}

// Export singleton instance
export const trackerDataService = new TrackerDataService();